import { useEffect, useState } from "react";

const EVENT_NAME = "developerModeChanged";

export function useDeveloperMode() {
  const [isDeveloper, setIsDeveloper] = useState(false);

  useEffect(() => {
    const cookies = document.cookie.split(";").map((c) => c.trim());
    const devCookie = cookies.find((c) => c.startsWith("is_developer="));
    setIsDeveloper(devCookie ? devCookie.split("=")[1] === "1" : false);

    const handler = (e: Event) => {
      const custom = e as CustomEvent<boolean>;
      setIsDeveloper(custom.detail);
    };

    window.addEventListener(EVENT_NAME, handler);
    return () => window.removeEventListener(EVENT_NAME, handler);
  }, []);

  const toggle = () => {
    const next = !isDeveloper;
    document.cookie = `is_developer=${next ? "1" : "0"}; path=/; max-age=${60 * 60 * 24 * 30}`;
    setIsDeveloper(next);
    window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: next }));
  };

  return { isDeveloper, toggle };
}
