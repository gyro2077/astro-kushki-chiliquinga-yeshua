import { useEffect, useState, useRef } from "react";

type ChatMessage = {
  role: "user" | "model";
  message: string;
};

const RICK_AVATAR = "https://rickandmortyapi.com/api/character/avatar/1.jpeg";

export default function Chatbot() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const wordCount = input.trim() ? input.trim().split(/\s+/).length : 0;
  const estimatedTokens = Math.ceil(wordCount * 1.3);

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    const nextMessages = [...messages, { role: "user", message: trimmed }];
    setMessages(nextMessages);
    setInput("");
    setIsLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed })
      });
      if (!res.ok) {
        const json = (await res.json().catch(() => ({ error: "Error" }))) as { error?: string };
        throw new Error(json.error ?? "Error en chat");
      }
      const json = (await res.json()) as { text?: string };
      setMessages((prev) => [...prev, { role: "model", message: json.text ?? "" }]);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "No pude responder";
      setMessages((prev) => [...prev, { role: "model", message: msg }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      <div
        className={`chat-bubble-portal w-[360px] sm:w-[400px] rounded-xl p-5 flex flex-col gap-4 origin-bottom-right transition-all duration-300 ${
          isOpen ? "scale-100 opacity-100" : "scale-0 opacity-0 pointer-events-none"
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img
                src={RICK_AVATAR}
                alt="Rick Sanchez"
                className="w-10 h-10 rounded-full object-cover border-2 border-ai-cyan shadow-[0_0_10px_rgba(6,182,212,0.4)]"
              />
              <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-status-alive rounded-full border-2 border-surface-container-lowest shadow-[0_0_5px_rgba(16,185,129,0.5)]" />
            </div>
            <div>
              <h3 className="font-h2 text-[16px] text-text-primary">Rickbot</h3>
              <p className="text-xs text-text-secondary">Asistente IA</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="chat-pill">
              ~{estimatedTokens} tokens
            </span>
            <button
              className="text-text-secondary hover:text-text-primary transition-colors"
              onClick={() => setIsOpen(false)}
              type="button"
            >
              <span className="material-symbols-outlined text-sm">close</span>
            </button>
          </div>
        </div>

        <div className="h-52 overflow-y-auto rounded-lg bg-surface-container-lowest/60 border border-white/10 p-3 space-y-3">
          {messages.length === 0 && (
            <p className="text-text-secondary text-xs text-center">
              Sin historial. Haz una pregunta sobre la API de Rick and Morty.
            </p>
          )}
          {messages.map((msg, index) => (
            <div
              key={`${msg.role}-${index}`}
              className={`text-xs ${msg.role === "user" ? "text-ai-cyan" : "text-text-primary"}`}
            >
              <span className="font-semibold mr-2">{msg.role === "user" ? "Tu" : "Rick"}:</span>
              {msg.message}
            </div>
          ))}
          {isLoading && (
            <div className="text-text-secondary text-xs flex items-center gap-1">
              <span className="material-symbols-outlined text-ai-purple animate-spin text-sm">autorenew</span>
              Rick esta pensando...
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="flex gap-2">
          <input
            className="flex-grow rounded-lg bg-surface-container-lowest border border-white/10 px-3 py-2 text-text-primary text-xs focus:ring-2 focus:ring-ai-cyan focus:outline-none placeholder-text-secondary/50"
            placeholder="Pregunta sobre la API o el multiverso..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSend();
            }}
          />
          <button
            className="bg-gradient-to-r from-ai-purple to-ai-cyan text-bg-main px-3 py-2 rounded font-label-sm font-bold hover:opacity-90 transition-all hover:shadow-[0_0_10px_rgba(139,92,246,0.3)]"
            type="button"
            onClick={handleSend}
            disabled={isLoading}
          >
            <span className="material-symbols-outlined text-sm">send</span>
          </button>
        </div>
      </div>

      <button
        className="h-14 w-14 rounded-full bg-gradient-to-br from-ai-purple to-ai-cyan text-bg-main flex items-center justify-center shadow-[0_0_25px_rgba(139,92,246,0.4)] hover:scale-110 transition-all duration-300 hover:shadow-[0_0_35px_rgba(6,182,212,0.5)] relative"
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label="Abrir chatbot"
      >
        {isOpen ? (
          <span className="material-symbols-outlined text-[28px]">close</span>
        ) : (
          <img
            src={RICK_AVATAR}
            alt="Rick"
            className="w-9 h-9 rounded-full object-cover"
          />
        )}
      </button>
    </div>
  );
}
