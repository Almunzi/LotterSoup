"use client";

import { useEffect, useState } from "react";
import { Download } from "./icons";

type InstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

export function InstallAppButton({ compact = false }: { compact?: boolean }) {
  const [installPrompt, setInstallPrompt] = useState<InstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [installing, setInstalling] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    const standalone = window.matchMedia("(display-mode: standalone)").matches
      || ("standalone" in window.navigator && Boolean((window.navigator as Navigator & { standalone?: boolean }).standalone));
    setInstalled(standalone);

    const capturePrompt = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as InstallPromptEvent);
    };
    const markInstalled = () => setInstalled(true);

    window.addEventListener("beforeinstallprompt", capturePrompt);
    window.addEventListener("appinstalled", markInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", capturePrompt);
      window.removeEventListener("appinstalled", markInstalled);
    };
  }, []);

  if (installed) return null;

  async function install() {
    if (!installPrompt) {
      setShowHelp((value) => !value);
      return;
    }
    setInstalling(true);
    try {
      await installPrompt.prompt();
      const result = await installPrompt.userChoice;
      if (result.outcome === "accepted") setInstalled(true);
      setInstallPrompt(null);
    } finally {
      setInstalling(false);
    }
  }

  return <div className={`install-wrap${compact ? " compact" : ""}`}>
    <button className={compact ? "subscriber-install" : "button button-yellow"} type="button" onClick={install} disabled={installing} aria-busy={installing}>
      {installing ? <><span className="button-spinner" aria-hidden="true" /><span>Installing…</span></> : <><Download /> <span>Install app</span></>}
    </button>
    {showHelp && <p className="install-help">On iPhone, tap Share then Add to Home Screen. On desktop or Android, open the browser menu and choose Install app.</p>}
  </div>;
}
