import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  ChatMessage,
  sendChatMessage
} from '../../services/aiChatService';
import {
  Sparkles,
  Send,
  X,
  Maximize2,
  Minimize2,
  RotateCcw,
  Copy,
  Check,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Layers,
  FileText,
  Building,
  Award,
  HelpCircle,
  Clock,
  ArrowRight,
  TrendingUp,
  Shield,
  CornerDownLeft,
  MessageSquare
} from 'lucide-react';

export const AIChatbotDrawer: React.FC = () => {
  const {
    initiatives,
    currentPage,
    currentUser,
    selectedInitiative,
    setSelectedInitiativeId
  } = useApp();

  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [inputPrompt, setInputPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Initial welcome message
  const initialMessages: ChatMessage[] = useMemo(() => [
    {
      id: 'welcome-1',
      role: 'assistant',
      content: `### Welcome to the AUDA-NEPAD Strategic Intelligence Advisor\n\n` +
        `I am your institutional AI advisor for the **Pipeline Projects Management System (PPMS)**, operating under the executive mandate of **Mrs. Nardos Bekele-Thomas** and the **African Union Agenda 2063**.\n\n` +
        `I have direct analytical access to all **${initiatives.length} live pipeline initiatives**, Stage-Gate governance records, and the **$1.0 Billion capital mobilization target**.\n\n` +
        `How may I assist you today? Choose a prompt below or ask any question about projects, directorates, gate SLAs, or financial agreements.`,
      timestamp: new Date().toISOString(),
      suggestedQuestions: [
        'How are we tracking against the $1B mobilization target?',
        'Which initiatives are awaiting CEO Mrs. Nardos Bekele-Thomas approval?',
        'Identify projects delayed against Gate SLAs or with high risk'
      ]
    }
  ], [initiatives.length]);

  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    // Attempt restoring from sessionStorage for continuous user experience
    try {
      const saved = sessionStorage.getItem('ppms_ai_chat_history');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore
    }
    return initialMessages;
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Save conversation history
  useEffect(() => {
    try {
      sessionStorage.setItem('ppms_ai_chat_history', JSON.stringify(messages));
    } catch {
      // ignore
    }
  }, [messages]);

  // Auto-scroll on new message
  useEffect(() => {
    if (isOpen && !isMinimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isMinimized, loading]);

  // Global custom event listener so any button in the app can open the chat with a prompt
  useEffect(() => {
    const handleOpenChat = (event: Event) => {
      const customEvent = event as CustomEvent<{ prompt?: string }>;
      setIsOpen(true);
      setIsMinimized(false);
      if (customEvent.detail?.prompt) {
        handleSendMessage(customEvent.detail.prompt);
      } else {
        setTimeout(() => inputRef.current?.focus(), 150);
      }
    };

    window.addEventListener('open-ai-chat', handleOpenChat);
    return () => window.removeEventListener('open-ai-chat', handleOpenChat);
  }, [messages, initiatives, currentPage, selectedInitiative, currentUser]);

  // Keyboard shortcut: Alt+K or Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.altKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
        setIsMinimized(false);
        setTimeout(() => inputRef.current?.focus(), 100);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputPrompt).trim();
    if (!query || loading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: query,
      timestamp: new Date().toISOString()
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInputPrompt('');
    setLoading(true);

    try {
      const response = await sendChatMessage({
        prompt: query,
        conversationHistory: updatedMessages,
        initiatives,
        currentPage,
        selectedInitiative,
        userRole: currentUser.role
      });

      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: response.reply,
        timestamp: new Date().toISOString(),
        suggestedQuestions: response.suggestedQuestions,
        isOffline: response.isOffline
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: any) {
      const errorMessage: ChatMessage = {
        id: `assistant-err-${Date.now()}`,
        role: 'assistant',
        content: `I encountered an issue processing your query: ${err?.message || 'Connection error'}. Please try asking again.`,
        timestamp: new Date().toISOString()
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearHistory = () => {
    if (window.confirm('Clear AI Advisor conversation history?')) {
      setMessages(initialMessages);
      sessionStorage.removeItem('ppms_ai_chat_history');
    }
  };

  const handleCopyMessage = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleInitiativeClick = (code: string) => {
    const matched = initiatives.find(
      (i) => i.code.toLowerCase() === code.toLowerCase() || i.title.toLowerCase().includes(code.toLowerCase())
    );
    if (matched) {
      setSelectedInitiativeId(matched.id);
    }
  };

  // Pre-curated quick starter questions
  const quickStarters = [
    { label: '$1B Mobilization Progress', prompt: 'How is the pipeline progressing towards the $1.0 Billion capital mobilization target?' },
    { label: 'CEO Approval Queue', prompt: 'Which initiatives are currently in Stage 4 awaiting approval by CEO Mrs. Nardos Bekele-Thomas?' },
    { label: 'SLA Health & Risks', prompt: 'Which initiatives are delayed against Gate SLAs or marked as high risk?' },
    { label: 'Directorate Breakdown', prompt: 'Provide a breakdown of investment volumes and initiative counts by Directorate' }
  ];

  return (
    <>
      {/* Floating Action Launcher Button (Fixed Bottom-Right) */}
      {!isOpen && (
        <div className="fixed bottom-5 right-5 z-40 flex items-center gap-2 group animate-in fade-in slide-in-from-bottom-4 duration-200">
          <div className="hidden md:flex items-center gap-1.5 bg-slate-900/90 text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow-lg border border-slate-700/60 backdrop-blur-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>Ask PPMS AI</span>
            <kbd className="ml-1 px-1.5 py-0.2 text-[10px] bg-slate-800 rounded border border-slate-600 text-slate-300">
              Alt+K
            </kbd>
          </div>

          <button
            onClick={() => {
              setIsOpen(true);
              setIsMinimized(false);
              setTimeout(() => inputRef.current?.focus(), 150);
            }}
            className="relative p-3.5 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white rounded-2xl shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-200 border border-emerald-400/40 flex items-center justify-center focus:outline-none focus:ring-4 focus:ring-emerald-400/30"
            title="Open AUDA-NEPAD Strategic Intelligence AI Assistant"
            aria-label="Open AI Advisor"
          >
            <Sparkles className="w-6 h-6 text-amber-300 animate-pulse" />
            <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-amber-400 rounded-full border-2 border-slate-900" />
          </button>
        </div>
      )}

      {/* Chat Window Panel */}
      {isOpen && (
        <div
          className={`fixed z-50 transition-all duration-200 shadow-2xl border border-slate-200 bg-white flex flex-col ${
            isMinimized
              ? 'bottom-5 right-5 w-80 h-14 rounded-2xl overflow-hidden'
              : isExpanded
              ? 'inset-4 md:inset-8 rounded-3xl overflow-hidden'
              : 'bottom-5 right-4 sm:right-6 w-[94vw] sm:w-[460px] h-[640px] max-h-[88vh] rounded-2xl overflow-hidden'
          }`}
        >
          {/* Header Ribbon */}
          <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white px-4 py-3 border-b border-slate-700 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center shadow-md border border-emerald-300/30 flex-shrink-0">
                <Sparkles className="w-4 h-4 text-amber-300" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h3 className="text-xs sm:text-sm font-black tracking-tight text-white truncate">
                    PPMS Strategic AI Advisor
                  </h3>
                  <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 hidden sm:inline">
                    AUDA-NEPAD
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[10px] text-slate-400">
                  <span className="truncate">Context: {currentPage}</span>
                  {selectedInitiative && (
                    <>
                      <span>•</span>
                      <span className="text-emerald-400 font-mono truncate max-w-[100px]">
                        {selectedInitiative.code}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Window Controls */}
            <div className="flex items-center gap-1 flex-shrink-0">
              {/* Reset History */}
              {!isMinimized && (
                <button
                  onClick={handleClearHistory}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                  title="Clear conversation"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              )}

              {/* Minimize / Expand Toggle */}
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                title={isMinimized ? 'Expand Chat' : 'Minimize Chat'}
              >
                {isMinimized ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {/* Fullscreen / Wide Toggle */}
              {!isMinimized && (
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors hidden sm:block"
                  title={isExpanded ? 'Restore size' : 'Expand full view'}
                >
                  {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
                </button>
              )}

              {/* Close Button */}
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                title="Close AI Assistant"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Collapsed Bar View */}
          {isMinimized ? (
            <div
              onClick={() => setIsMinimized(false)}
              className="flex-1 px-4 flex items-center justify-between text-xs text-slate-600 bg-slate-50 cursor-pointer hover:bg-slate-100"
            >
              <span className="font-semibold text-slate-800 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                AI Assistant minimized (click to expand)
              </span>
              <span className="text-[11px] text-slate-400">{messages.length} messages</span>
            </div>
          ) : (
            <>
              {/* Message Scrollable Body */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 bg-slate-50/70 text-slate-800 text-xs sm:text-sm">
                {messages.map((message) => {
                  const isUser = message.role === 'user';
                  return (
                    <div
                      key={message.id}
                      className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} space-y-1.5 animate-in fade-in duration-150`}
                    >
                      {/* Role Banner */}
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-400 px-1">
                        {isUser ? (
                          <>
                            <span className="font-semibold text-slate-700">{currentUser.name}</span>
                            <span>•</span>
                            <span>{new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </>
                        ) : (
                          <>
                            <span className="font-bold text-emerald-700 flex items-center gap-1">
                              <Sparkles className="w-2.5 h-2.5 text-amber-500" />
                              PPMS AI Advisor
                            </span>
                            {message.isOffline && (
                              <span className="px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 font-medium">
                                Local Engine
                              </span>
                            )}
                            <span>•</span>
                            <span>{new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </>
                        )}
                      </div>

                      {/* Bubble */}
                      <div
                        className={`max-w-[90%] sm:max-w-[85%] rounded-2xl px-4 py-3 shadow-2xs leading-relaxed ${
                          isUser
                            ? 'bg-emerald-700 text-white rounded-tr-xs'
                            : 'bg-white text-slate-800 border border-slate-200/90 rounded-tl-xs'
                        }`}
                      >
                        {isUser ? (
                          <div className="whitespace-pre-wrap">{message.content}</div>
                        ) : (
                          <div>
                            <MessageMarkdownRenderer
                              content={message.content}
                              onInitiativeClick={handleInitiativeClick}
                            />

                            {/* Message Action Utilities */}
                            <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handleCopyMessage(message.id, message.content)}
                                  className="hover:text-slate-700 flex items-center gap-1 transition-colors"
                                  title="Copy response to clipboard"
                                >
                                  {copiedId === message.id ? (
                                    <>
                                      <Check className="w-3 h-3 text-emerald-600" />
                                      <span className="text-emerald-600 font-semibold">Copied</span>
                                    </>
                                  ) : (
                                    <>
                                      <Copy className="w-3 h-3" />
                                      <span>Copy</span>
                                    </>
                                  )}
                                </button>
                              </div>

                              <span className="text-[10px] text-slate-400">
                                AUDA-NEPAD Continental PPMS
                              </span>
                            </div>

                            {/* Suggested Follow-up Questions */}
                            {message.suggestedQuestions && message.suggestedQuestions.length > 0 && (
                              <div className="mt-3 pt-2.5 border-t border-slate-100 space-y-1.5">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                                  Suggested Follow-ups:
                                </span>
                                <div className="flex flex-wrap gap-1.5">
                                  {message.suggestedQuestions.map((q, qIdx) => (
                                    <button
                                      key={qIdx}
                                      onClick={() => handleSendMessage(q)}
                                      disabled={loading}
                                      className="text-left text-xs bg-slate-50 hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-300 border border-slate-200 text-slate-700 px-2.5 py-1 rounded-xl transition-all flex items-center gap-1.5 disabled:opacity-50"
                                    >
                                      <ArrowRight className="w-3 h-3 text-emerald-600 flex-shrink-0" />
                                      <span>{q}</span>
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}

                {/* Loading indicator */}
                {loading && (
                  <div className="flex items-start gap-2 animate-in fade-in duration-150">
                    <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-800 flex items-center justify-center text-white flex-shrink-0 shadow-2xs">
                      <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-spin" />
                    </div>
                    <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-xs px-4 py-3 shadow-2xs max-w-sm">
                      <div className="flex items-center gap-2">
                        <div className="flex space-x-1">
                          <span className="w-2 h-2 bg-emerald-600 rounded-full animate-bounce [animation-delay:-0.3s]" />
                          <span className="w-2 h-2 bg-emerald-600 rounded-full animate-bounce [animation-delay:-0.15s]" />
                          <span className="w-2 h-2 bg-emerald-600 rounded-full animate-bounce" />
                        </div>
                        <span className="text-xs text-slate-500 font-medium">
                          Synthesizing PPMS pipeline analytics...
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Quick Starter Suggestions Bar if conversation is short */}
              {messages.length <= 2 && (
                <div className="px-4 py-2 bg-slate-100/90 border-t border-slate-200">
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-500" />
                    <span>Quick Strategic Inquiries:</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {quickStarters.map((qs, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSendMessage(qs.prompt)}
                        disabled={loading}
                        className="text-[11px] font-medium bg-white hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-300 border border-slate-200 text-slate-700 px-2.5 py-1 rounded-lg transition-colors shadow-2xs"
                      >
                        {qs.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Chat Input Bar */}
              <div className="p-3 sm:p-4 bg-white border-t border-slate-200">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage();
                  }}
                  className="flex items-end gap-2"
                >
                  <div className="flex-1 relative">
                    <textarea
                      ref={inputRef}
                      value={inputPrompt}
                      onChange={(e) => setInputPrompt(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                      placeholder={`Query ${initiatives.length} initiatives, CEO approvals, $1B target...`}
                      rows={2}
                      disabled={loading}
                      className="w-full resize-none px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                    />
                    <div className="absolute right-2.5 bottom-2.5 text-[10px] text-slate-400 hidden sm:block">
                      Enter ↵ to send
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={!inputPrompt.trim() || loading}
                    className="p-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white rounded-xl shadow-xs transition-colors flex items-center justify-center flex-shrink-0"
                    title="Send query"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>

                <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400 px-1">
                  <span>AUDA-NEPAD Strategic Intelligence Engine</span>
                  <span className="text-emerald-700 font-semibold">Gemini 3.8 Flash</span>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
};

/**
 * Custom Markdown and Table Renderer for Assistant Messages
 */
interface MarkdownRendererProps {
  content: string;
  onInitiativeClick: (code: string) => void;
}

const MessageMarkdownRenderer: React.FC<MarkdownRendererProps> = ({
  content,
  onInitiativeClick
}) => {
  // Parse lines and detect markdown tables or standard formatting
  const lines = content.split('\n');
  const renderedElements: React.ReactNode[] = [];

  let inTable = false;
  let tableRows: string[][] = [];

  const flushTable = (keyPrefix: string) => {
    if (tableRows.length > 0) {
      const headerRow = tableRows[0];
      const dataRows = tableRows.slice(1).filter((r) => !r.every((c) => c.match(/^:?-+:?$/)));

      renderedElements.push(
        <div key={`table-${keyPrefix}`} className="my-3 overflow-x-auto rounded-lg border border-slate-200">
          <table className="min-w-full text-xs text-left divide-y divide-slate-200">
            <thead className="bg-slate-100 font-bold text-slate-700">
              <tr>
                {headerRow.map((cell, cIdx) => (
                  <th key={cIdx} className="px-3 py-1.5 whitespace-nowrap">
                    {formatInlineText(cell.trim(), onInitiativeClick)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {dataRows.map((row, rIdx) => (
                <tr key={rIdx} className={rIdx % 2 === 0 ? 'bg-white' : 'bg-slate-50/60'}>
                  {row.map((cell, cIdx) => (
                    <td key={cIdx} className="px-3 py-1.5 whitespace-nowrap">
                      {formatInlineText(cell.trim(), onInitiativeClick)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      tableRows = [];
    }
    inTable = false;
  };

  lines.forEach((line, index) => {
    const trimmed = line.trim();

    // Check if table row
    if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
      inTable = true;
      const columns = trimmed
        .slice(1, -1)
        .split('|')
        .map((c) => c.trim());
      tableRows.push(columns);
      return;
    } else if (inTable) {
      flushTable(`line-${index}`);
    }

    if (!trimmed) {
      renderedElements.push(<div key={`spacer-${index}`} className="h-2" />);
      return;
    }

    // Headers
    if (trimmed.startsWith('### ')) {
      renderedElements.push(
        <h4 key={`h3-${index}`} className="text-sm font-black text-slate-900 mt-2.5 mb-1 text-emerald-900 flex items-center gap-1.5">
          {formatInlineText(trimmed.replace(/^### /, ''), onInitiativeClick)}
        </h4>
      );
      return;
    }

    if (trimmed.startsWith('#### ')) {
      renderedElements.push(
        <h5 key={`h4-${index}`} className="text-xs font-bold text-slate-900 mt-2 mb-1">
          {formatInlineText(trimmed.replace(/^#### /, ''), onInitiativeClick)}
        </h5>
      );
      return;
    }

    // Bullet points
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      renderedElements.push(
        <div key={`bullet-${index}`} className="flex items-start gap-2 my-0.5 ml-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-1.5 flex-shrink-0" />
          <div className="flex-1">
            {formatInlineText(trimmed.replace(/^[-*]\s+/, ''), onInitiativeClick)}
          </div>
        </div>
      );
      return;
    }

    // Numbered lists
    const numMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
    if (numMatch) {
      renderedElements.push(
        <div key={`num-${index}`} className="flex items-start gap-2 my-0.5 ml-1">
          <span className="text-[11px] font-bold text-emerald-700 min-w-[16px]">
            {numMatch[1]}.
          </span>
          <div className="flex-1">
            {formatInlineText(numMatch[2], onInitiativeClick)}
          </div>
        </div>
      );
      return;
    }

    // Standard paragraph
    renderedElements.push(
      <p key={`p-${index}`} className="my-1">
        {formatInlineText(trimmed, onInitiativeClick)}
      </p>
    );
  });

  if (inTable) {
    flushTable('end');
  }

  return <div className="space-y-0.5">{renderedElements}</div>;
};

/**
 * Format inline text (bold, code, and clickable initiative codes like INIT-2024-001)
 */
function formatInlineText(
  text: string,
  onInitiativeClick: (code: string) => void
): React.ReactNode {
  // Regex to match **bold**, `code`, and INIT-YYYY-XXX
  const pattern = /(\*\*[^*]+\*\*|`[^`]+`|INIT-\d{4}-\d{3})/g;
  const parts = text.split(pattern);

  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={index} className="font-bold text-slate-900">
          {part.slice(2, -2)}
        </strong>
      );
    }

    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code
          key={index}
          className="px-1.5 py-0.2 bg-slate-100 text-slate-800 rounded font-mono text-[11px] border border-slate-200"
        >
          {part.slice(1, -1)}
        </code>
      );
    }

    // Check if it's an initiative code
    if (/^INIT-\d{4}-\d{3}$/.test(part)) {
      return (
        <button
          key={index}
          onClick={() => onInitiativeClick(part)}
          className="inline-flex items-center gap-0.5 px-1.5 py-0.2 mx-0.5 rounded font-mono font-bold text-[11px] bg-emerald-100 hover:bg-emerald-200 text-emerald-900 border border-emerald-300 cursor-pointer transition-colors"
          title={`Click to view ${part} details`}
        >
          <span>{part}</span>
          <ExternalLink className="w-2.5 h-2.5 text-emerald-700" />
        </button>
      );
    }

    return part;
  });
}
