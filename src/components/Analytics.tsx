import { useEffect } from "react";
import { useLocation } from "react-router-dom";

// GoatCounter site code: the "xxx" in https://xxx.goatcounter.com.
// Leave empty to turn tracking off.
const GOATCOUNTER_CODE = "";

declare global {
  interface Window {
    goatcounter?: { count: (vars: { path: string }) => void };
  }
}

let scriptLoaded: Promise<void> | null = null;

function loadScript() {
  if (!scriptLoaded) {
    scriptLoaded = new Promise((resolve) => {
      const script = document.createElement("script");
      script.async = true;
      script.src = "https://gc.zgo.at/count.js";
      script.dataset.goatcounter = `https://${GOATCOUNTER_CODE}.goatcounter.com/count`;
      // We count page views ourselves so client-side navigation is tracked too
      script.dataset.goatcounterSettings = JSON.stringify({ no_onload: true });
      script.onload = () => resolve();
      document.head.appendChild(script);
    });
  }
  return scriptLoaded;
}

/** Counts a page view in GoatCounter on every route change. */
const Analytics = () => {
  const { pathname, search } = useLocation();

  useEffect(() => {
    if (!GOATCOUNTER_CODE || import.meta.env.DEV) return;
    loadScript().then(() => window.goatcounter?.count({ path: pathname + search }));
  }, [pathname, search]);

  return null;
};

export default Analytics;
