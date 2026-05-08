import { useState } from "react";

export default function SearchBarMini() {
  const [value, setValue] = useState("");

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const id = value.trim();
    if (!id) return;
    window.location.href = `/character/${id}`;
  };

  return (
    <form class="relative group" onSubmit={handleSubmit}>
      <div class="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none text-text-secondary group-focus-within:text-ai-cyan transition-colors">
        <span class="material-symbols-outlined text-sm">search</span>
      </div>
      <input
        class="w-full bg-surface-container/50 border border-white/10 rounded-full py-1.5 pl-7 pr-3 text-text-primary text-xs placeholder-text-secondary/50 focus:outline-none focus:ring-2 focus:ring-ai-cyan focus:border-ai-cyan transition-all"
        placeholder="Buscar ID..."
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
    </form>
  );
}
