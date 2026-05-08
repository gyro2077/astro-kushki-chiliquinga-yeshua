import { useEffect, useState } from "react";
import { useDeveloperMode } from "./useDeveloperMode";

export default function HeaderAuth() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const { isDeveloper, toggle } = useDeveloperMode();

  useEffect(() => {
    const cookies = document.cookie.split(";").map((c) => c.trim());
    const hasUserCookie = cookies.some((c) => c.startsWith("user_id="));
    setIsLoggedIn(hasUserCookie);
  }, []);

  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2">
        <span className="text-xs text-text-secondary font-medium">User</span>
        <button
          className={`w-12 h-6 rounded-full transition-all duration-300 relative ${
            isDeveloper
              ? "bg-gradient-to-r from-ai-cyan to-ai-purple shadow-[0_0_12px_rgba(6,182,212,0.4)]"
              : "bg-surface-container-lowest border border-white/10"
          }`}
          onClick={toggle}
          type="button"
          aria-label="Toggle developer mode"
        >
          <span
            className={`h-4 w-4 rounded-full bg-white shadow-md absolute top-1 transition-all duration-300 ${
              isDeveloper ? "left-[28px]" : "left-1"
            }`}
          />
        </button>
        <span className="text-xs text-ai-cyan font-bold">Dev</span>
      </div>
      {isLoggedIn ? (
        <form action="/api/auth/logout" method="post">
          <button
            className="bg-primary-container text-on-primary-container px-4 py-2 rounded-DEFAULT font-label-sm text-label-sm hover:opacity-90 transition-opacity"
            type="submit"
          >
            Cerrar sesion
          </button>
        </form>
      ) : (
        <div className="flex items-center gap-3">
          <a className="text-text-secondary hover:text-ai-cyan font-label-sm" href="/login">
            Iniciar sesion
          </a>
          <a
            className="bg-primary-container text-on-primary-container px-4 py-2 rounded-DEFAULT font-label-sm text-label-sm hover:opacity-90 transition-opacity"
            href="/register"
          >
            Crear cuenta
          </a>
        </div>
      )}
    </div>
  );
}
