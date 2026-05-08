import { useEffect, useState } from "react";
import { useDeveloperMode } from "./useDeveloperMode";

type ApiExplorerTerminalProps = {
  initialId?: string;
};

type Character = {
  id: number;
  name: string;
  status: string;
  species: string;
  type: string;
  gender: string;
  origin: { name: string; url: string };
  location: { name: string; url: string };
  image: string;
  created: string;
};

const getStatusClass = (value: string) => {
  if (value === "Alive") return "text-status-alive";
  if (value === "Dead") return "text-status-dead";
  return "text-status-unknown";
};

const renderValue = (value: unknown): JSX.Element => {
  if (typeof value === "string") return <span className="syntax-string">"{value}"</span>;
  if (typeof value === "number") return <span className="syntax-number">{value}</span>;
  if (value && typeof value === "object") return <span className="text-text-secondary">&#123;...&#125;</span>;
  return <span className="text-text-secondary">null</span>;
};

export default function ApiExplorerTerminal({ initialId = "1" }: ApiExplorerTerminalProps) {
  const { isDeveloper } = useDeveloperMode();
  const [id, setId] = useState(initialId);
  const [data, setData] = useState<Character | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async (targetId: string) => {
    setLoading(true);
    setError(null);
    setData(null);
    try {
      const res = await fetch(`https://rickandmortyapi.com/api/character/${encodeURIComponent(targetId)}`);
      if (!res.ok) throw new Error("Personaje no encontrado");
      const json = (await res.json()) as Character;
      setData(json);
    } catch {
      setError("No pudimos encontrar ese personaje. Intenta con otro ID.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialId) fetchData(initialId);
  }, [initialId]);

  return (
    <div className="glass-panel rounded-xl h-full flex flex-col overflow-hidden">
      <div className="border-b border-white/10 p-4 bg-surface-container/50 flex justify-between items-center">
        <h2 className="font-h2 text-[20px] text-text-primary font-semibold flex items-center gap-2">
          <span className="material-symbols-outlined text-ai-cyan">api</span>
          {isDeveloper ? "API Explorer" : "Explorador"}
        </h2>
        <div className="flex gap-2">
          <span className="w-3 h-3 rounded-full bg-status-dead"></span>
          <span className="w-3 h-3 rounded-full bg-status-unknown"></span>
          <span className="w-3 h-3 rounded-full bg-status-alive"></span>
        </div>
      </div>

      {!isDeveloper ? (
        <div className="flex-grow flex flex-col items-center justify-center p-8 text-center">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-ai-purple/20 to-ai-cyan/20 border border-ai-cyan/30 flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(6,182,212,0.15)]">
            <span className="material-symbols-outlined text-4xl text-ai-cyan">explore</span>
          </div>
          <h3 className="font-h2 text-[20px] text-text-primary mb-2">Modo Explorador Activo</h3>
          <p className="text-text-secondary text-sm max-w-xs mb-6">
            Activa el Modo Desarrollador en la barra superior para acceder a la terminal JSON en bruto.
          </p>
          <div className="h-32 w-full max-w-sm rounded-lg bg-surface-container-lowest/50 border border-white/5 flex items-center justify-center">
            <span className="text-text-secondary/30 text-xs font-code-snippet">
              {`{ "id": "${id}", ... }`}
            </span>
          </div>
        </div>
      ) : (
        <>
          <div className="p-card-padding border-b border-white/10 flex flex-col lg:flex-row gap-4">
            <div className="flex-grow relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-status-alive font-code-snippet text-xs font-bold">GET</span>
              <input
                className="w-full bg-surface-container-lowest border border-white/10 rounded px-4 py-2 pl-14 text-text-primary font-code-snippet text-code-snippet focus:outline-none focus:ring-2 focus:ring-ai-cyan focus:border-ai-cyan transition-all"
                type="text"
                value={`https://rickandmortyapi.com/api/character/${id}`}
                onChange={(e) => {
                  const value = e.target.value;
                  const nextId = value.split("/").pop() ?? "";
                  setId(nextId);
                }}
              />
            </div>
            <button
              className="bg-gradient-to-r from-ai-purple to-ai-cyan text-bg-main px-6 py-2 rounded font-label-sm font-bold hover:opacity-90 transition-all hover:shadow-[0_0_15px_rgba(139,92,246,0.3)]"
              type="button"
              onClick={() => fetchData(id)}
            >
              Send
            </button>
          </div>
          <div className="terminal-bg flex-grow p-card-padding font-code-snippet text-code-snippet overflow-x-auto relative group">
            <button
              className="absolute top-4 right-4 text-text-secondary hover:text-text-primary opacity-0 group-hover:opacity-100 transition-opacity"
              type="button"
              onClick={() => {
                if (data) navigator.clipboard.writeText(JSON.stringify(data, null, 2));
              }}
            >
              <span className="material-symbols-outlined text-sm">content_copy</span>
            </button>
            {loading && <pre className="text-text-secondary animate-pulse">Fetching data...</pre>}
            {error && <pre className="text-status-dead">{error}</pre>}
            {data && !loading && (
              <pre className="leading-relaxed">
                &#123;
                {"\n"}
                <span className="syntax-key">"id"</span>: {renderValue(data.id)},
                {"\n"}
                <span className="syntax-key">"name"</span>: {renderValue(data.name)},
                {"\n"}
                <span className="syntax-key">"status"</span>: <span className={getStatusClass(data.status)}>{renderValue(data.status)}</span>,
                {"\n"}
                <span className="syntax-key">"species"</span>: {renderValue(data.species)},
                {"\n"}
                <span className="syntax-key">"type"</span>: {renderValue(data.type)},
                {"\n"}
                <span className="syntax-key">"gender"</span>: {renderValue(data.gender)},
                {"\n"}
                <span className="syntax-key">"origin"</span>: &#123;
                {"\n"}  <span className="syntax-key">"name"</span>: {renderValue(data.origin?.name ?? "")},
                {"\n"}  <span className="syntax-key">"url"</span>: {renderValue(data.origin?.url ?? "")}
                {"\n"}&#125;,
                {"\n"}
                <span className="syntax-key">"location"</span>: &#123;
                {"\n"}  <span className="syntax-key">"name"</span>: {renderValue(data.location?.name ?? "")},
                {"\n"}  <span className="syntax-key">"url"</span>: {renderValue(data.location?.url ?? "")}
                {"\n"}&#125;,
                {"\n"}
                <span className="syntax-key">"image"</span>: {renderValue(data.image)},
                {"\n"}
                <span className="syntax-key">"created"</span>: {renderValue(data.created)}
                {"\n"}&#125;
              </pre>
            )}
            {!data && !loading && !error && <pre className="text-text-secondary">Esperando consulta...</pre>}
          </div>
        </>
      )}
    </div>
  );
}
