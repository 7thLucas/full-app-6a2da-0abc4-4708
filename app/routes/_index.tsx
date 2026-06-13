import { useState, useRef, useEffect, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import { invokeLLM } from "@qb/agentic";
import { useConfigurables } from "~/modules/configurables";
import {
  Send,
  Bot,
  User,
  Copy,
  Check,
  Zap,
  Code2,
  MessageSquare,
  ChevronRight,
  Trash2,
} from "lucide-react";

/* ─── Types ──────────────────────────────────────────────────────────── */

type Role = "user" | "assistant";

interface Message {
  id: string;
  role: Role;
  content: string;
  timestamp: Date;
}

/* ─── Code block component with copy button ──────────────────────────── */

function CodeBlock({
  children,
  className,
}: {
  children?: React.ReactNode;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);
  const codeText = String(children ?? "").replace(/\n$/, "");

  const handleCopy = () => {
    navigator.clipboard.writeText(codeText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="relative group my-3">
      <div className="flex items-center justify-between px-4 py-1.5 bg-[#0a0f1e] border border-[#1e2a45] rounded-t-md">
        <span className="text-xs text-[#8892a4] font-mono">
          {className?.replace("language-", "") || "code"}
        </span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-xs text-[#8892a4] hover:text-[#00d4ff] transition-colors"
        >
          {copied ? (
            <>
              <Check size={12} />
              <span>Copied</span>
            </>
          ) : (
            <>
              <Copy size={12} />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <pre className="overflow-x-auto p-4 bg-[#0d1526] border border-t-0 border-[#1e2a45] rounded-b-md text-sm font-mono leading-relaxed">
        <code className={className}>{codeText}</code>
      </pre>
    </div>
  );
}

/* ─── Markdown renderer ──────────────────────────────────────────────── */

function MarkdownContent({ content }: { content: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeHighlight]}
      components={{
        code({ className, children, ...props }) {
          const isBlock = className?.startsWith("language-");
          if (isBlock) {
            return <CodeBlock className={className}>{children}</CodeBlock>;
          }
          return (
            <code
              className="px-1.5 py-0.5 bg-[#0a0f1e] border border-[#1e2a45] rounded text-[#00d4ff] text-sm font-mono"
              {...props}
            >
              {children}
            </code>
          );
        },
        pre({ children }) {
          return <>{children}</>;
        },
        p({ children }) {
          return <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>;
        },
        ul({ children }) {
          return <ul className="mb-2 ml-4 list-disc space-y-1">{children}</ul>;
        },
        ol({ children }) {
          return <ol className="mb-2 ml-4 list-decimal space-y-1">{children}</ol>;
        },
        li({ children }) {
          return <li className="leading-relaxed">{children}</li>;
        },
        h1({ children }) {
          return <h1 className="text-xl font-semibold mb-2 text-[#f0f4ff]">{children}</h1>;
        },
        h2({ children }) {
          return <h2 className="text-lg font-semibold mb-2 text-[#f0f4ff]">{children}</h2>;
        },
        h3({ children }) {
          return <h3 className="text-base font-semibold mb-1 text-[#f0f4ff]">{children}</h3>;
        },
        blockquote({ children }) {
          return (
            <blockquote className="border-l-2 border-[#00d4ff] pl-4 my-2 text-[#8892a4] italic">
              {children}
            </blockquote>
          );
        },
        a({ children, href }) {
          return (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#00d4ff] underline underline-offset-2 hover:text-[#00aaff] transition-colors"
            >
              {children}
            </a>
          );
        },
        table({ children }) {
          return (
            <div className="overflow-x-auto my-3">
              <table className="w-full border-collapse text-sm">{children}</table>
            </div>
          );
        },
        th({ children }) {
          return (
            <th className="border border-[#1e2a45] px-3 py-2 text-left font-semibold bg-[#0a0f1e] text-[#f0f4ff]">
              {children}
            </th>
          );
        },
        td({ children }) {
          return (
            <td className="border border-[#1e2a45] px-3 py-2 text-[#8892a4]">
              {children}
            </td>
          );
        },
        hr() {
          return <hr className="border-[#1e2a45] my-4" />;
        },
      }}
    >
      {content}
    </ReactMarkdown>
  );
}

/* ─── Typing indicator ───────────────────────────────────────────────── */

function TypingIndicator() {
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <div className="w-7 h-7 rounded-md bg-[#111827] border border-[#1e2a45] flex items-center justify-center flex-shrink-0">
        <Bot size={14} className="text-[#00d4ff]" />
      </div>
      <div className="flex items-center gap-1.5 px-4 py-3 bg-[#111827] border border-[#1e2a45] rounded-lg rounded-tl-sm">
        <span className="typing-dot w-1.5 h-1.5 rounded-full bg-[#00d4ff] inline-block" />
        <span className="typing-dot w-1.5 h-1.5 rounded-full bg-[#00d4ff] inline-block" />
        <span className="typing-dot w-1.5 h-1.5 rounded-full bg-[#00d4ff] inline-block" />
      </div>
    </div>
  );
}

/* ─── Message bubble ─────────────────────────────────────────────────── */

function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === "user";

  if (isUser) {
    return (
      <div className="flex items-start gap-3 justify-end px-4 py-2 msg-in">
        <div className="max-w-[75%]">
          <div className="px-4 py-3 bg-[#00aaff20] border border-[#00aaff40] rounded-lg rounded-tr-sm text-[#f0f4ff] text-sm leading-relaxed whitespace-pre-wrap">
            {message.content}
          </div>
          <div className="text-xs text-[#8892a4] mt-1 text-right">
            {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </div>
        </div>
        <div className="w-7 h-7 rounded-md bg-[#00aaff20] border border-[#00aaff40] flex items-center justify-center flex-shrink-0 mt-0.5">
          <User size={14} className="text-[#00d4ff]" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-3 px-4 py-2 msg-in">
      <div className="w-7 h-7 rounded-md bg-[#111827] border border-[#1e2a45] flex items-center justify-center flex-shrink-0 mt-0.5">
        <Bot size={14} className="text-[#00d4ff]" />
      </div>
      <div className="max-w-[80%]">
        <div className="px-4 py-3 bg-[#111827] border border-[#1e2a45] rounded-lg rounded-tl-sm text-[#f0f4ff] text-sm">
          <MarkdownContent content={message.content} />
        </div>
        <div className="text-xs text-[#8892a4] mt-1">
          {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </div>
      </div>
    </div>
  );
}

/* ─── Welcome screen ─────────────────────────────────────────────────── */

function WelcomeScreen({
  appName,
  welcomeMessage,
  suggestions,
  onSuggestionClick,
}: {
  appName: string;
  welcomeMessage: string;
  suggestions: string[];
  onSuggestionClick: (text: string) => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center h-full px-6 py-12 text-center">
      <div className="mb-6">
        <div className="w-16 h-16 rounded-xl bg-[#0d1526] border border-[#1e2a45] flex items-center justify-center mx-auto mb-4 glow-cyan">
          <Zap size={28} className="text-[#00d4ff]" />
        </div>
        <h2 className="text-2xl font-semibold text-[#f0f4ff] mb-2">{appName}</h2>
        <p className="text-[#8892a4] text-sm max-w-md leading-relaxed">{welcomeMessage}</p>
      </div>

      {suggestions.length > 0 && (
        <div className="w-full max-w-lg mt-4">
          <p className="text-xs text-[#8892a4] mb-3 font-medium uppercase tracking-wider">
            Try asking
          </p>
          <div className="grid gap-2">
            {suggestions.map((s, i) => (
              <button
                key={i}
                onClick={() => onSuggestionClick(s)}
                className="flex items-center gap-3 w-full text-left px-4 py-3 bg-[#0d1526] border border-[#1e2a45] rounded-lg text-sm text-[#8892a4] hover:border-[#00d4ff40] hover:text-[#f0f4ff] hover:glow-cyan transition-all duration-150 group"
              >
                <ChevronRight
                  size={14}
                  className="text-[#00d4ff] opacity-60 group-hover:opacity-100 flex-shrink-0"
                />
                <span className="truncate">{s}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Sidebar ────────────────────────────────────────────────────────── */

function Sidebar({
  appName,
  logoUrl,
  tagline,
  messages,
  onNewChat,
}: {
  appName: string;
  logoUrl: string;
  tagline: string;
  messages: Message[];
  onNewChat: () => void;
}) {
  const hasMessages = messages.length > 0;
  const firstUserMsg = messages.find((m) => m.role === "user");

  return (
    <div className="w-60 flex-shrink-0 bg-[#0d1526] border-r border-[#1e2a45] flex flex-col h-full">
      {/* Brand */}
      <div className="px-4 py-4 border-b border-[#1e2a45]">
        <div className="flex items-center gap-2.5">
          {logoUrl && !logoUrl.startsWith("FILL_") ? (
            <img src={logoUrl} alt={appName} className="w-7 h-7 rounded object-contain" />
          ) : (
            <div className="w-7 h-7 rounded bg-[#00d4ff15] border border-[#00d4ff30] flex items-center justify-center">
              <Zap size={14} className="text-[#00d4ff]" />
            </div>
          )}
          <div>
            <div className="text-sm font-semibold text-[#f0f4ff] tracking-wide">{appName}</div>
            {tagline && <div className="text-[10px] text-[#8892a4] leading-tight">{tagline}</div>}
          </div>
        </div>
      </div>

      {/* New chat button */}
      <div className="px-3 py-3">
        <button
          onClick={onNewChat}
          className="flex items-center gap-2 w-full px-3 py-2 rounded-md text-xs text-[#8892a4] hover:text-[#00d4ff] hover:bg-[#00d4ff0d] border border-[#1e2a45] hover:border-[#00d4ff30] transition-all duration-150"
        >
          <MessageSquare size={13} />
          <span>New Chat</span>
        </button>
      </div>

      {/* Chat history hint */}
      <div className="flex-1 px-3 overflow-y-auto">
        {hasMessages && (
          <div>
            <p className="text-[10px] text-[#8892a4] uppercase tracking-wider px-2 mb-2">
              Current session
            </p>
            <div className="px-2 py-2 rounded-md bg-[#00d4ff0d] border border-[#1e2a45]">
              <p className="text-xs text-[#f0f4ff] truncate">
                {firstUserMsg?.content ?? "New conversation"}
              </p>
              <p className="text-[10px] text-[#8892a4] mt-0.5">
                {messages.length} message{messages.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
        )}
        {!hasMessages && (
          <div className="flex flex-col items-center justify-center h-24 gap-2">
            <MessageSquare size={18} className="text-[#1e2a45]" />
            <p className="text-xs text-[#8892a4] text-center">No chats yet</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-[#1e2a45]">
        <div className="flex items-center gap-2">
          <Code2 size={12} className="text-[#00d4ff] opacity-60" />
          <span className="text-[10px] text-[#8892a4]">Powered by AI</span>
        </div>
      </div>
    </div>
  );
}

/* ─── Main page ──────────────────────────────────────────────────────── */

export default function IndexPage() {
  const { config, loading } = useConfigurables();

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const appName = config?.appName ?? "KYYBOT";
  const logoUrl = (config as any)?.logoUrl ?? "";
  const tagline = (config as any)?.tagline ?? "Your personal AI dev companion";
  const welcomeMessage =
    (config as any)?.welcomeMessage ?? "Hey, I'm KYYBOT. Ask me anything.";
  const systemPrompt =
    (config as any)?.systemPrompt ??
    "You are KYYBOT, a smart and direct personal AI assistant. You help with general questions, coding (debugging, writing, explaining code), and any topic the user brings up. Be concise, sharp, and useful. Use markdown formatting for code.";
  const inputPlaceholder =
    (config as any)?.inputPlaceholder ?? "Ask anything — code, questions, ideas...";
  const showSidebar = (config as any)?.showSidebar !== false;
  const suggestionPrompts: string[] = (config as any)?.suggestionPrompts ?? [];

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, scrollToBottom]);

  const autoResizeTextarea = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 160) + "px";
  };

  const handleSend = async (text?: string) => {
    const messageText = (text ?? input).trim();
    if (!messageText || isLoading) return;

    setInput("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: messageText,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const result = await invokeLLM({
        message: messageText,
        systemPrompt,
        schema: {
          type: "object",
          properties: {
            reply: { type: "string" },
          },
          required: ["reply"],
        },
      });

      const replyContent =
        (result.response as any)?.reply ??
        "I encountered an issue generating a response. Please try again.";

      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: replyContent,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      const errorMessage: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content:
          "Something went wrong connecting to the AI. Check your configuration or try again in a moment.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleNewChat = () => {
    setMessages([]);
    setInput("");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0a0f1e]">
        <div className="flex items-center gap-3 text-[#8892a4]">
          <div className="w-2 h-2 rounded-full bg-[#00d4ff] animate-pulse" />
          <span className="text-sm">Loading KYYBOT...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#0a0f1e] text-[#f0f4ff] overflow-hidden">
      {/* Sidebar */}
      {showSidebar && (
        <Sidebar
          appName={appName}
          logoUrl={logoUrl}
          tagline={tagline}
          messages={messages}
          onNewChat={handleNewChat}
        />
      )}

      {/* Main chat area */}
      <div className="flex flex-col flex-1 min-w-0">
        {/* Header */}
        <header className="flex items-center justify-between px-5 py-3.5 border-b border-[#1e2a45] bg-[#0d1526] flex-shrink-0">
          <div className="flex items-center gap-3">
            {!showSidebar && (
              <>
                {logoUrl && !logoUrl.startsWith("FILL_") ? (
                  <img src={logoUrl} alt={appName} className="w-6 h-6 rounded object-contain" />
                ) : (
                  <Zap size={18} className="text-[#00d4ff]" />
                )}
              </>
            )}
            <span className="font-semibold text-sm tracking-wide text-[#f0f4ff]">{appName}</span>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00d4ff] animate-pulse" />
              <span className="text-xs text-[#8892a4]">Online</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {messages.length > 0 && (
              <button
                onClick={handleNewChat}
                className="flex items-center gap-1.5 text-xs text-[#8892a4] hover:text-[#f0f4ff] px-3 py-1.5 rounded border border-[#1e2a45] hover:border-[#00d4ff40] transition-all"
              >
                <Trash2 size={12} />
                <span>Clear</span>
              </button>
            )}
          </div>
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto py-2">
          {messages.length === 0 && !isLoading ? (
            <WelcomeScreen
              appName={appName}
              welcomeMessage={welcomeMessage}
              suggestions={suggestionPrompts}
              onSuggestionClick={(text) => handleSend(text)}
            />
          ) : (
            <div className="max-w-4xl mx-auto">
              {messages.map((message) => (
                <MessageBubble key={message.id} message={message} />
              ))}
              {isLoading && <TypingIndicator />}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input bar */}
        <div className="flex-shrink-0 border-t border-[#1e2a45] bg-[#0d1526] px-4 py-3">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-end gap-3 bg-[#111827] border border-[#1e2a45] rounded-lg px-4 py-3 focus-within:border-[#00d4ff40] focus-within:glow-cyan transition-all">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  autoResizeTextarea();
                }}
                onKeyDown={handleKeyDown}
                placeholder={inputPlaceholder}
                rows={1}
                disabled={isLoading}
                className="flex-1 bg-transparent text-[#f0f4ff] text-sm placeholder:text-[#8892a4] outline-none resize-none min-h-[24px] max-h-[160px] leading-relaxed disabled:opacity-50"
                style={{ fontFamily: "Inter, sans-serif" }}
              />
              <button
                onClick={() => handleSend()}
                disabled={!input.trim() || isLoading}
                className="flex-shrink-0 w-8 h-8 rounded-md bg-[#00d4ff] hover:bg-[#00aaff] disabled:bg-[#1e2a45] disabled:text-[#8892a4] flex items-center justify-center text-[#0a0f1e] transition-all duration-150 disabled:cursor-not-allowed glow-cyan disabled:shadow-none"
              >
                <Send size={14} />
              </button>
            </div>
            <p className="text-center text-[10px] text-[#8892a4] mt-2">
              Enter to send &middot; Shift+Enter for new line
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
