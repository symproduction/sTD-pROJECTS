import "dotenv/config";
import express from "express";
import type { Express, Request, Response } from "express";
import multer from "multer";
import {
  ApiConfigError,
  askHealthAssistant,
  explainMedicalReport,
  getMedicineInformation,
  isAiConfigured,
  isGeminiConfigured,
  isOpenAiConfigured,
  type ChatTurn,
} from "./aiServices.ts";

const ALLOWED_MIME_TYPES = new Set([
  "application/pdf",
  "image/jpeg",
  "image/jpg",
  "image/png",
]);

// Store uploaded medical reports strictly in RAM during the request; never write to disk.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB
  },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_MIME_TYPES.has(file.mimetype.toLowerCase())) {
      cb(null, true);
    } else {
      cb(new Error("Unsupported file format. Please upload a PDF, JPG, or PNG file."));
    }
  },
});

function handleApiError(res: Response, err: unknown, fallbackMsg: string) {
  if (err instanceof ApiConfigError) {
    return res.status(err.statusCode).json({
      errorCode: err.errorCode,
      message: err.message,
    });
  }

  const errObj = err as { status?: number; message?: string };
  const msg = errObj?.message || fallbackMsg;
  console.error("[MediAI API Error]:", errObj?.status, msg);

  if (
    msg.includes("API_KEY_INVALID") ||
    msg.includes("PERMISSION_DENIED") ||
    errObj?.status === 403 ||
    errObj?.status === 401
  ) {
    let reasonDetail = "";
    try {
      const parsed = JSON.parse(msg) as { error?: { message?: string } };
      if (parsed?.error?.message) {
        reasonDetail = ` (${parsed.error.message})`;
      }
    } catch {
      if (msg && msg.length < 240) {
        reasonDetail = ` (${msg})`;
      }
    }
    return res.status(503).json({
      errorCode: "API_KEY_INVALID",
      message: `The configured server AI API key was rejected or lacks permission${reasonDetail}. Please verify your GEMINI_API_KEY in Settings > Secrets.`,
    });
  }

  if (errObj?.status === 429 || msg.includes("RESOURCE_EXHAUSTED")) {
    return res.status(429).json({
      errorCode: "RATE_LIMITED",
      message: "The AI service is temporarily busy. Please wait a moment and try again.",
    });
  }

  if (
    errObj?.status === 504 ||
    msg.includes("DEADLINE_EXCEEDED") ||
    msg.includes("AbortError") ||
    msg.includes("timeout")
  ) {
    return res.status(504).json({
      errorCode: "AI_TIMEOUT",
      message: "The AI service took too long to respond. Please try again in a moment.",
    });
  }

  return res.status(500).json({
    errorCode: "AI_SERVICE_ERROR",
    message: fallbackMsg,
  });
}

export function createApiApp(): Express {
  const app = express();
  app.use(express.json({ limit: "2mb" }));

  // Health & AI availability check (exposes no secrets)
  app.get("/api/health", (_req: Request, res: Response) => {
    res.json({
      ok: true,
      aiConfigured: isAiConfigured(),
      providers: {
        gemini: isGeminiConfigured(),
        openai: isOpenAiConfigured(),
      },
    });
  });

  // Feature 1: AI Health Assistant
  app.post("/api/health-assistant", async (req: Request, res: Response) => {
    try {
      const { message, history } = req.body as {
        message?: string;
        history?: ChatTurn[];
      };

      const question = typeof message === "string" ? message.trim() : "";
      if (!question || question.length > 2000) {
        return res.status(400).json({
          errorCode: "INVALID_INPUT",
          message: "Please enter a clear health question (up to 2,000 characters).",
        });
      }

      const safeHistory: ChatTurn[] = Array.isArray(history)
        ? history
            .filter(
              (item) =>
                item &&
                (item.role === "user" || item.role === "assistant") &&
                typeof item.content === "string"
            )
            .slice(-12)
        : [];

      const result = await askHealthAssistant(safeHistory, question);
      return res.json(result);
    } catch (err) {
      return handleApiError(
        res,
        err,
        "Unable to reach the AI Health Assistant right now. Please try again shortly."
      );
    }
  });

  // Feature 2: AI Medical Report Explainer
  app.post("/api/report/analyze", (req: Request, res: Response) => {
    upload.single("report")(req, res, async (uploadErr) => {
      if (uploadErr) {
        return res.status(400).json({
          errorCode: "INVALID_FILE",
          message:
            uploadErr instanceof Error
              ? uploadErr.message
              : "Invalid file upload. Please upload a PDF, JPG, or PNG under 10 MB.",
        });
      }

      if (!req.file) {
        return res.status(400).json({
          errorCode: "MISSING_FILE",
          message: "Please select a PDF, JPG, or PNG medical report to analyze.",
        });
      }

      try {
        const extraNotes =
          typeof req.body?.notes === "string" ? req.body.notes.slice(0, 600) : undefined;
        const normalizedMime =
          req.file.mimetype === "image/jpg" ? "image/jpeg" : req.file.mimetype;

        const analysis = await explainMedicalReport(
          req.file.buffer,
          normalizedMime,
          req.file.originalname,
          extraNotes
        );

        req.file.buffer.fill(0);
        return res.json(analysis);
      } catch (err) {
        req.file?.buffer.fill(0);
        return handleApiError(
          res,
          err,
          "Unable to analyze the uploaded medical report. Please ensure the file is clear and try again."
        );
      }
    });
  });

  // Feature 3: AI Medicine Information Assistant
  app.post("/api/medicine/info", async (req: Request, res: Response) => {
    try {
      const { query } = req.body as { query?: string };
      const cleanQuery = typeof query === "string" ? query.trim() : "";

      if (!cleanQuery || cleanQuery.length < 2 || cleanQuery.length > 120) {
        return res.status(400).json({
          errorCode: "INVALID_QUERY",
          message: "Please enter a medicine name (2 to 120 characters).",
        });
      }

      const info = await getMedicineInformation(cleanQuery);
      return res.json(info);
    } catch (err) {
      return handleApiError(
        res,
        err,
        "Unable to retrieve medicine information right now. Please try again shortly."
      );
    }
  });

  // Contact form endpoint (stateless validation & confirmation)
  app.post("/api/contact", (req: Request, res: Response) => {
    const { name, email, topic, message } = req.body as {
      name?: string;
      email?: string;
      topic?: string;
      message?: string;
    };

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!name?.trim() || name.trim().length < 2) {
      return res.status(400).json({ message: "Please provide your full name." });
    }
    if (!email?.trim() || !emailRegex.test(email.trim())) {
      return res.status(400).json({ message: "Please provide a valid email address." });
    }
    if (!message?.trim() || message.trim().length < 10) {
      return res
        .status(400)
        .json({ message: "Please enter a message of at least 10 characters." });
    }

    const referenceCode = `MED-${Date.now().toString(36).toUpperCase().slice(-6)}`;
    return res.json({
      received: true,
      referenceCode,
      topic: topic?.trim() || "General Inquiry",
      submittedAt: new Date().toISOString(),
    });
  });

  return app;
}
