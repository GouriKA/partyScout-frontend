import { useState, useRef, useEffect, useCallback } from 'react';
import './ChatPanel.css';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080';
const STORAGE_KEY = 'ps_chat';

/* ── Markdown helpers ────────────────────────────────────────── */

function renderInline(text) {
  const parts = text.split(/(\*\*[^*\n]+\*\*|\*[^*\n]+\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**'))
      return <span key={i} className="chat-md-tag">{part.slice(2, -2)}</span>;
    if (part.startsWith('*') && part.endsWith('*'))
      return <em key={i}>{part.slice(1, -1)}</em>;
    return part;
  });
}

function normalizeMarkdown(text) {
  // Only fix the case where a word runs directly into an opening marker:
  // "How**wonderful**" → "How **wonderful**"
  // Uses word char on both sides to distinguish opening ** from closing **
  return text
    .replace(/([a-zA-Z0-9])\*\*([a-zA-Z])/g, '$1 **$2')
    .replace(/([a-zA-Z0-9])\*([a-zA-Z])/g,   '$1 *$2');
}

function renderInlineWithLinks(text, venues, onVenueSelect) {
  if (!venues?.length || !onVenueSelect) return renderInline(text);

  const sorted = [...venues].sort((a, b) => b.name.length - a.name.length);
  const escaped = sorted.map(v => v.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  const pattern = new RegExp(`(${escaped.join('|')})`, 'gi');

  return text.split(pattern).map((seg, i) => {
    const venue = sorted.find(v => v.name.toLowerCase() === seg.toLowerCase());
    if (venue) {
      return (
        <button key={i} className="msg-venue-inline-link" onClick={() => onVenueSelect(venue)}>
          {seg}
        </button>
      );
    }
    return <span key={i}>{renderInline(seg)}</span>;
  });
}

function renderMarkdown(text, venues, onVenueSelect) {
  if (!text) return null;
  const lines = normalizeMarkdown(text).split('\n');
  const output = [];
  let listItems = [];
  let k = 0;

  const inline = (t) => renderInlineWithLinks(t, venues, onVenueSelect);

  const flushList = () => {
    if (listItems.length > 0) {
      output.push(<ul key={k++} className="chat-md-list">{listItems}</ul>);
      listItems = [];
    }
  };

  for (const line of lines) {
    const t = line.trimStart();
    if (/^[-•*]\s/.test(t)) {
      listItems.push(<li key={k++}>{inline(t.slice(2))}</li>);
    } else if (/^\d+\.\s/.test(t)) {
      listItems.push(<li key={k++}>{inline(t.replace(/^\d+\.\s/, ''))}</li>);
    } else {
      flushList();
      if (t) output.push(<p key={k++} className="chat-md-p">{inline(t)}</p>);
    }
  }
  flushList();
  return output.length ? output : <p className="chat-md-p">{text}</p>;
}

function stripDataPrefix(raw) {
  let s = raw;
  while (s.startsWith('data: ') || s.startsWith('data:')) {
    s = s.replace(/^data: ?/, '');
  }
  return s;
}

/* ── Storage helpers ─────────────────────────────────────────── */
function loadChat() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    const messages = (saved.messages || []).filter(m => m.content || m.venueList);
    const history  = saved.history  || [];
    return { messages, history };
  } catch {
    return { messages: [], history: [] };
  }
}

function saveChat(messages, history) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ messages, history }));
  } catch {}
}

function clearChat() {
  try { localStorage.removeItem(STORAGE_KEY); } catch {}
}

export default function ChatPanel({
  existingContext = {},
  contextLabel,
  suggestions = [],
  onVenuesFound,
  onVenueSelect,
  onSeeAll,
  onCompare,
  onCollapse,
  onClose,
  initialText,
  triggerSend,
}) {
  const initial = loadChat();
  const [messages,    setMessages]    = useState(initial.messages);
  const [input,       setInput]       = useState('');
  const [isStreaming, setIsStreaming] = useState(false);

  const historyRef        = useRef(initial.history);
  const knownVenuesRef    = useRef([]);
  const onCompareRef      = useRef(onCompare);
  const onCollapseRef     = useRef(onCollapse);
  useEffect(() => { onCompareRef.current  = onCompare;  }, [onCompare]);
  useEffect(() => { onCollapseRef.current = onCollapse; }, [onCollapse]);
  const messagesEndRef    = useRef(null);
  const readerRef         = useRef(null);
  const lastTriggerKeyRef = useRef(null);
  // Monotonically increasing counter used to assign stable React keys to messages.
  // Index-based keys cause reconciliation bugs when new messages append; this avoids that.
  const nextKeyRef        = useRef(initial.messages.length);
  // AbortController for the active fetch — aborted on unmount or new send to prevent leaks.
  const abortRef          = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    // On unmount: cancel the stream reader AND abort the underlying fetch
    return () => {
      readerRef.current?.cancel();
      abortRef.current?.abort();
    };
  }, []);

  const sendMessage = useCallback(async (text) => {
    const msg = (text ?? input).trim();
    if (!msg || isStreaming) return;

    // Intercept compare intent — open compare overlay immediately
    if (onCompareRef.current && /compare/i.test(msg)) {
      // Fall back to venues in message history if knownVenuesRef isn't populated yet
      const known = knownVenuesRef.current.length >= 2
        ? knownVenuesRef.current
        : messages
            .filter(m => m.venueList)
            .flatMap(m => m.venueList.map((v, i) => ({
              num: i + 1,
              name: v.name,
              rating: v.rating || null,
              address: v.address || null,
              setting: v.setting || null,
              reason: v.reason || null,
              photos: v.photos || [],
            })));
      if (known.length >= 2) {
        const nums = [...msg.matchAll(/\b([1-9])\b/g)].map(m => parseInt(m[1]));
        const matched = nums.length >= 2
          ? nums.map(n => known.find(v => v.num === n)).filter(Boolean)
          : known;
        if (matched.length >= 2) {
          setInput('');
          setMessages(prev => [...prev, { role: 'user', content: msg, _key: nextKeyRef.current++ }]);
          onCompareRef.current(matched);
          return;
        }
      }
    }

    // If in expanded full-screen mode, collapse to side panel so messages are visible
    onCollapseRef.current?.();

    setInput('');
    setIsStreaming(true);

    // Assign stable keys so React doesn't confuse bubbles during re-renders
    const userKey      = nextKeyRef.current++;
    const assistantKey = nextKeyRef.current++;
    setMessages(prev => [
      ...prev,
      { role: 'user',      content: msg,  _key: userKey },
      { role: 'assistant', content: '',   _key: assistantKey },
    ]);
    let assistantContent = '';

    // Abort any in-flight request before starting a new one
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await fetch(`${API_BASE}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          message: msg,
          conversationHistory: historyRef.current,
          existingContext: {
            city:     existingContext.city     ?? null,
            persona:  existingContext.persona  ?? null,
            occasion: existingContext.occasion ?? null,
          },
          knownVenues: knownVenuesRef.current,
        }),
      });

      if (!res.ok || !res.body) throw new Error(`HTTP ${res.status}`);

      const reader = res.body.getReader();
      readerRef.current = reader;
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';

        for (const line of lines) {
          if (!line.startsWith('data:')) continue;
          const data = stripDataPrefix(line);
          if (data === null || data === undefined) continue;

          // Empty data line = the backend is encoding a newline character
          if (!data) {
            if (assistantContent && !assistantContent.endsWith('\n')) {
              assistantContent += '\n';
              setMessages(prev => {
                const updated = [...prev];
                updated[updated.length - 1] = { role: 'assistant', content: assistantContent };
                return updated;
              });
            }
            continue;
          }

          if (data.startsWith('[VENUES]')) {
            try {
              const venues = JSON.parse(data.slice(8));
              onVenuesFound?.(venues);
              // Store numbered venue context so follow-up questions have accurate info
              knownVenuesRef.current = venues.map((v, i) => ({
                num: i + 1,
                name: v.name,
                rating: v.rating || null,
                address: v.address || null,
                setting: v.setting || null,
                reason: v.reason || null,
                photos: v.photos || [],
              }));
              // Merge into the last assistant bubble so text + cards appear as one unit
              setMessages(prev => {
                const updated = [...prev];
                const last = updated[updated.length - 1];
                if (last?.role === 'assistant') {
                  updated[updated.length - 1] = { ...last, venueList: venues };
                } else {
                  updated.push({ role: 'assistant', content: '', venueList: venues, _key: nextKeyRef.current++ });
                }
                return updated;
              });
            } catch { /* ignore malformed */ }
          } else {
            // If the previous chunk ended with a word char and this one starts
            // with a word char, a space was lost between SSE tokens — restore it
            if (assistantContent && /\w$/.test(assistantContent) && /^\w/.test(data)) {
              assistantContent += ' ';
            }
            assistantContent += data;
            setMessages(prev => {
              const updated = [...prev];
              updated[updated.length - 1] = { role: 'assistant', content: assistantContent };
              return updated;
            });
          }
        }
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        setMessages(prev => {
          const updated = [...prev];
          updated[updated.length - 1] = {
            role: 'assistant',
            content: 'Something went wrong. Please try again.',
          };
          return updated;
        });
      }
    } finally {
      readerRef.current = null;
      setIsStreaming(false);
      historyRef.current = [
        ...historyRef.current,
        { role: 'user',      content: msg },
        { role: 'assistant', content: assistantContent },
      ].slice(-20);
      // Persist after each complete exchange
      setMessages(prev => {
        saveChat(prev, historyRef.current);
        return prev;
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [input, isStreaming, existingContext.city, existingContext.persona, existingContext.occasion]);

  // Pre-fill input
  useEffect(() => {
    if (initialText) setInput(initialText);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialText]);

  // Auto-send
  useEffect(() => {
    if (!triggerSend?.text || triggerSend.key === lastTriggerKeyRef.current) return;
    lastTriggerKeyRef.current = triggerSend.key;
    sendMessage(triggerSend.text);
  }, [triggerSend?.key, sendMessage]);

  const handleNewChat = () => {
    readerRef.current?.cancel();
    abortRef.current?.abort();
    setMessages([]);
    setIsStreaming(false);
    historyRef.current = [];
    knownVenuesRef.current = [];
    nextKeyRef.current = 0;
    clearChat();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Collect all venues mentioned in this conversation for inline linking
  const knownVenues = messages.filter(m => m.venueList).flatMap(m => m.venueList);

  const renderBubble = (msg, i) => {
    // Use the stable _key assigned at message-creation time.
    // Fall back to index only for messages restored from localStorage (which predate the _key field).
    const key = msg._key ?? i;

    const isLast     = i === messages.length - 1;
    const showTyping = isLast && msg.role === 'assistant' && isStreaming && !msg.content && !msg.venueList;

    if (msg.role === 'user') {
      return <div key={key} className="msg-user">{msg.content}</div>;
    }

    if (msg.venueList) {
      return (
        <div key={key} className="msg-bot msg-bot--venues">
          {msg.content && (
            <div className="msg-bot-prose">
              {renderMarkdown(msg.content, knownVenues, onVenueSelect)}
            </div>
          )}
          <div className={`msg-venue-cards${msg.content ? ' msg-venue-cards--divided' : ''}`}>
            {msg.venueList.map((v, vi) => (
              <div
                key={v.googlePlaceId || v.id || v.name || vi}
                className="msg-venue-card"
              >
                <div className="msg-venue-card-num">{vi + 1}</div>
                <div
                  className="msg-venue-card-photo"
                  onClick={() => onVenueSelect?.(v)}
                  style={onVenueSelect ? { cursor: 'pointer' } : undefined}
                >
                  {v.photos?.[0] ? (
                    <img src={v.photos[0]} alt={v.name} loading="lazy" />
                  ) : (
                    <div className="msg-venue-card-photo-empty">🎉</div>
                  )}
                </div>
                <div className="msg-venue-card-body">
                  <div
                    className={`msg-venue-card-name${onVenueSelect ? ' msg-venue-card-name--link' : ''}`}
                    onClick={() => onVenueSelect?.(v)}
                  >
                    {v.name}
                  </div>
                  {v.rating > 0 && (
                    <div className="msg-venue-card-rating">
                      <span className="msg-venue-card-star">★</span>
                      {v.rating.toFixed(1)}
                    </div>
                  )}
                  {v.reason && (
                    <div className="msg-venue-card-reason">{v.reason}</div>
                  )}
                </div>
                <button
                  className="msg-venue-card-ask"
                  onClick={() => sendMessage(`Tell me more about ${v.name}`)}
                  disabled={isStreaming}
                  title={`Ask Scout about ${v.name}`}
                >
                  Ask →
                </button>
              </div>
            ))}
          </div>
          {onSeeAll && (
            <button className="msg-see-all" onClick={onSeeAll}>
              See all venues →
            </button>
          )}
        </div>
      );
    }

    if (showTyping) {
      return (
        <div key={key} className="msg-bot">
          <div className="cp-typing"><span /><span /><span /></div>
        </div>
      );
    }

    return (
      <div key={key} className="msg-bot">
        {renderMarkdown(msg.content, knownVenues, onVenueSelect)}
      </div>
    );
  };

  return (
    <div className="chat-panel">
      <div className="cp-header">
        {onClose && (
          <button className="cp-back" onClick={onClose} aria-label="Close chat">✕</button>
        )}
        <div className="cp-dot" />
        <span className="cp-title">Hi, I'm Scout</span>
        <span className="cp-sub">AI powered</span>
        {messages.length > 0 && (
          <button className="cp-new-chat" onClick={handleNewChat} title="Start a new conversation">
            New chat
          </button>
        )}
      </div>

      {contextLabel && <div className="cp-ctx">{contextLabel}</div>}

      <div className="cp-messages">
        {messages.length === 0 && (
          <p className="cp-empty">Ask me anything about party planning…</p>
        )}
        {messages.map(renderBubble)}
        <div ref={messagesEndRef} />
      </div>

      {suggestions.length > 0 && messages.length === 0 && (
        <div className={`cp-chips${isStreaming ? ' cp-chips--dim' : ''}`}>
          {suggestions.map(s => (
            <button key={s} className="cp-chip" onClick={() => sendMessage(s)} disabled={isStreaming}>
              {s}
            </button>
          ))}
        </div>
      )}

      <div className="cp-input-area">
        <div className="cp-input-wrap">
          <textarea
            className="cp-textarea"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isStreaming ? 'Thinking...' : 'Ask Scout anything...'}
            disabled={isStreaming}
            rows={2}
          />
          <div className="cp-input-footer">
            <span className="cp-input-hint">
              {!isStreaming && 'Shift + Enter for new line'}
            </span>
            <button
              className="cp-send"
              onClick={() => sendMessage()}
              disabled={isStreaming || !input.trim()}
              aria-label="Send message"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"/>
                <polygon points="22 2 15 22 11 13 2 9 22 2"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
