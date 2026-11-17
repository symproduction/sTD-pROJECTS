import { useCallback, useEffect, useState } from "react";
import { Footer } from "./components/Footer";
import { Navbar } from "./components/Navbar";
import { ToastContainer } from "./components/ToastContainer";
import { AboutPage } from "./pages/AboutPage";
import { ContactPage } from "./pages/ContactPage";
import { HealthAssistantPage } from "./pages/HealthAssistantPage";
import { HomePage } from "./pages/HomePage";
import { MedicalDisclaimerPage } from "./pages/MedicalDisclaimerPage";
import { MedicineInfoPage } from "./pages/MedicineInfoPage";
import { PrivacyPolicyPage } from "./pages/PrivacyPolicyPage";
import { ReportExplainerPage } from "./pages/ReportExplainerPage";
import { checkApiHealth } from "./services/apiClient";
import type { PageId, ToastItem } from "./types/medical";

const VALID_PAGES = new Set<PageId>([
  "home",
  "assistant",
  "report",
  "medicine",
  "about",
  "contact",
  "privacy",
  "disclaimer",
]);

function getPageFromHash(): PageId {
  const raw = window.location.hash.replace(/^#\/?/, "").trim() as PageId;
  return VALID_PAGES.has(raw) ? raw : "home";
}

export default function App() {
  const [currentPage, setCurrentPage] = useState<PageId>(() => getPageFromHash());
  const [isDark, setIsDark] = useState<boolean>(() =>
    document.documentElement.classList.contains("dark")
  );
  const [aiConfigured, setAiConfigured] = useState<boolean | null>(null);
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    const onHashChange = () => {
      setCurrentPage(getPageFromHash());
      window.scrollTo({ top: 0, behavior: "smooth" });
    };
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  useEffect(() => {
    checkApiHealth()
      .then((res) => setAiConfigured(res.aiConfigured))
      .catch(() => setAiConfigured(null));
  }, []);

  const navigate = useCallback((page: PageId) => {
    setCurrentPage(page);
    const nextHash = page === "home" ? "#/" : `#/${page}`;
    if (window.location.hash !== nextHash) {
      window.location.hash = nextHash;
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const toggleTheme = useCallback(() => {
    setIsDark((prev) => {
      const next = !prev;
      if (next) {
        document.documentElement.classList.add("dark");
        localStorage.setItem("mediai-theme", "dark");
      } else {
        document.documentElement.classList.remove("dark");
        localStorage.setItem("mediai-theme", "light");
      }
      return next;
    });
  }, []);

  const addToast = useCallback(
    (type: "success" | "error" | "info", message: string) => {
      const id = `t-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      setToasts((prev) => [...prev, { id, type, message }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((item) => item.id !== id));
      }, 4500);
    },
    []
  );

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((item) => item.id !== id));
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-white text-slate-900 transition-colors dark:bg-slate-950 dark:text-slate-100">
      <Navbar
        currentPage={currentPage}
        onNavigate={navigate}
        isDark={isDark}
        onToggleTheme={toggleTheme}
      />

      <main className="flex-1">
        {currentPage === "home" && <HomePage onNavigate={navigate} />}
        {currentPage === "assistant" && (
          <HealthAssistantPage
            aiConfigured={aiConfigured}
            onToast={addToast}
            onNavigate={navigate}
          />
        )}
        {currentPage === "report" && (
          <ReportExplainerPage aiConfigured={aiConfigured} onToast={addToast} />
        )}
        {currentPage === "medicine" && (
          <MedicineInfoPage aiConfigured={aiConfigured} onToast={addToast} />
        )}
        {currentPage === "about" && <AboutPage onNavigate={navigate} />}
        {currentPage === "contact" && <ContactPage onToast={addToast} />}
        {currentPage === "privacy" && <PrivacyPolicyPage />}
        {currentPage === "disclaimer" && <MedicalDisclaimerPage />}
      </main>

      <Footer onNavigate={navigate} />
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
