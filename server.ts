import express from "express";
import type { Request, Response } from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { createApiApp } from "./server/app.ts";

const PORT = Number(process.env.PORT || 3000);

async function startServer() {
  const app = createApiApp();

  // Vite dev middleware or production static assets
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(process.cwd(), "dist");
    app.use(express.static(distDir));
    app.get("*", (_req: Request, res: Response) => {
      res.sendFile(path.join(distDir, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`MediAI server running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start MediAI server:", err);
  process.exit(1);
});
