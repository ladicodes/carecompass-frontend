const KEY = "carecompass_demo_mode_v1";

export function isDemoModeEnabled() {
  if (typeof window === "undefined") return false;
  try {
    const fromStorage = window.localStorage.getItem(KEY);
    if (fromStorage === "1") return true;
    if (fromStorage === "0") return false;
  } catch {
    // ignore
  }
  return process.env.NEXT_PUBLIC_CARECOMPASS_DEMO_MODE === "1";
}

export function setDemoModeEnabled(enabled: boolean) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, enabled ? "1" : "0");
  } catch {
    // ignore
  }
  window.dispatchEvent(new Event("carecompass:demo-mode"));
}

export function onDemoModeChange(cb: () => void) {
  if (typeof window === "undefined") return () => {};
  const handler = () => cb();
  window.addEventListener("carecompass:demo-mode", handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener("carecompass:demo-mode", handler);
    window.removeEventListener("storage", handler);
  };
}

