import { useState } from "react";

type AiLoreBoxProps = {
  character: unknown;
};

export default function AiLoreBox({ character }: AiLoreBoxProps) {
  const [loading, setLoading] = useState(false);
  const [loreText, setLoreText] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    setLoreText(null);
    try {
      const res = await fetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(character)
      });
      const json = (await res.json()) as { text?: string; error?: string };
      if (!res.ok || json.error) {
        throw new Error(json.error ?? "Error desconocido");
      }
      setLoreText(json.text ?? "Respuesta vacia");
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo generar el resumen");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-xl p-card-padding relative overflow-hidden" style={{
      background: "linear-gradient(135deg, rgba(6,182,212,0.08), rgba(6,182,212,0.03))",
      border: "1px solid rgba(6,182,212,0.3)",
      boxShadow: "inset 0 0 30px rgba(6,182,212,0.08), 0 0 20px rgba(6,182,212,0.1)"
    }}>
      <div className="absolute inset-0 pointer-events-none" style={{
        background: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(6,182,212,0.03) 2px, rgba(6,182,212,0.03) 4px)"
      }} />
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-4">
          <span className="material-symbols-outlined text-ai-cyan">auto_awesome</span>
          <h3 className="font-h2 text-[20px] text-text-primary font-semibold">AI Entity Summary</h3>
        </div>
        <p className="font-body-md text-text-secondary mb-6 leading-relaxed">
          {loreText ??
            "Querying interdimensional database for entity background and behavioral patterns..."}
        </p>
        {error && <p className="mb-4 text-sm text-status-dead">{error}</p>}
        <button
          className="w-full portal-btn text-ai-purple font-label-sm py-3 rounded-lg flex justify-center items-center gap-2"
          type="button"
          onClick={handleGenerate}
          disabled={loading}
        >
          <span className="material-symbols-outlined text-ai-purple">generating_tokens</span>
          {loading ? "Generando..." : "Generar resumen con Rickbot"}
        </button>
      </div>
    </div>
  );
}
