import { useState } from "react";

type SearchBarProps = {
  placeholder?: string;
};

export default function SearchBar({ placeholder = "Buscar personaje por ID..." }: SearchBarProps) {
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isShaking, setIsShaking] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const id = value.trim();
    if (!id) {
      return;
    }

    try {
      const res = await fetch(`https://rickandmortyapi.com/api/character/${encodeURIComponent(id)}`);
      if (!res.ok) {
        throw new Error("Personaje no encontrado");
      }
      window.location.href = `/character/${id}`;
    } catch (err) {
      setError("Error 404: Personaje no encontrado. Intenta con otro ID.");
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
    }
  };

  return (
    <div className="relative">
      <form
        className={`w-full max-w-2xl relative group ${isShaking ? "animate-[shake_0.4s_ease-in-out]" : ""}`}
        onSubmit={handleSubmit}
      >
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-text-secondary group-focus-within:text-ai-cyan transition-colors">
          <span className="material-symbols-outlined" data-icon="search">
            search
          </span>
        </div>
        <input
          className={`w-full bg-surface-container/50 border rounded-xl py-4 pl-12 pr-4 text-text-primary font-body-md placeholder-text-secondary/50 backdrop-blur-xl focus:outline-none focus:ring-2 transition-all duration-300 shadow-inner group-hover:bg-surface-container/70 group-focus-within:bg-surface-container/80 group-focus-within:shadow-[0_0_20px_rgba(6,182,212,0.15)] group-focus-within:scale-[1.01] ${
            error ? "border-status-dead focus:border-status-dead focus:ring-status-dead" : "border-white/10 focus:border-ai-cyan focus:ring-ai-cyan"
          }`}
          placeholder={placeholder}
          type="text"
          value={value}
          onChange={(event) => {
            setValue(event.target.value);
            if (error) setError(null);
          }}
        />
        <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
          <span className="text-text-secondary/50 font-code-snippet text-[12px] bg-surface-container-highest px-2 py-1 rounded border border-white/5">
            Enter
          </span>
        </div>
      </form>
      {error && (
        <div className="absolute right-0 mt-4 w-full max-w-sm rounded-lg border border-status-dead/40 bg-status-dead/10 px-4 py-3 text-sm text-status-dead shadow-lg">
          {error}
        </div>
      )}
    </div>
  );
}
