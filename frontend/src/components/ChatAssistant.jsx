import React, { useState, useRef, useEffect } from 'react';

export default function ChatAssistant() {
  const [selectedCitation, setSelectedCitation] = useState(null);
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'assistant',
      text: 'Hello! I am your Smart City Knowledge Assistant. I can help answer questions about waste management schedules, public transport rules, city zoning, and utility regulations based on official documents. What would you like to know?',
      confidence: 100,
      citations: [],
    }
  ]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const API_URL = 'http://127.0.0.1:5000/api';

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async (textToSend) => {
    const promptText = textToSend || query.trim();
    if (!promptText) return;

    if (!textToSend) {
      setQuery('');
    }

    // Append user message
    const userMsg = { id: Date.now(), sender: 'user', text: promptText };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/citizen/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify({ query: promptText }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Query failed');
      }

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'assistant',
          text: data.answer,
          confidence: data.confidence,
          citations: data.citations || [],
        }
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'assistant',
          text: `Sorry, I encountered an error connecting to the intelligence server: ${err.message}`,
          confidence: 0,
          citations: [],
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const suggestionChips = [
    'How do I request residential waste collection?',
    'What is the speed limit in urban zones?',
    'What regulations apply to smart grid meters?',
    'What is the recycling schedule for district 4?'
  ];

  return (
    <div style={styles.container}>
      <div style={styles.chatArea}>
        <div style={styles.messagesContainer}>
          {messages.map((msg) => (
            <div
              key={msg.id}
              style={{
                ...styles.messageRow,
                justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start',
              }}
            >
              {msg.sender === 'assistant' && (
                <div style={styles.avatar}>
                  <span className="material-symbols-outlined" style={{ color: 'var(--color-primary)' }}>smart_toy</span>
                </div>
              )}
              
              <div
                style={{
                  ...styles.bubble,
                  backgroundColor: msg.sender === 'user' ? 'var(--color-primary-container)' : '#f0fdfa',
                  color: msg.sender === 'user' ? 'var(--color-on-primary)' : 'var(--color-on-background)',
                  border: msg.sender === 'user' ? 'none' : '1px solid #5eead4',
                  borderRadius: msg.sender === 'user' ? '12px 12px 0px 12px' : '12px 12px 12px 0px',
                }}
              >
                <p style={styles.bubbleText}>{msg.text}</p>

                {msg.sender === 'assistant' && msg.confidence > 0 && (
                  <div style={styles.metricsRow}>
                    <div style={styles.metricItem}>
                      <span style={styles.metricLabel}>Confidence</span>
                      <div style={styles.confidenceBarContainer}>
                        <div
                          style={{
                            ...styles.confidenceBar,
                            width: `${msg.confidence}%`,
                          }}
                        />
                      </div>
                      <span style={styles.metricVal}>{msg.confidence}%</span>
                    </div>

                    <div style={styles.sourceBadge}>
                      <span className="material-symbols-outlined" style={styles.badgeIcon}>verified</span>
                      <span>Verified Policy</span>
                    </div>
                  </div>
                )}

                {msg.sender === 'assistant' && msg.citations.length > 0 && (
                  <div style={styles.citationsSection}>
                    <p style={styles.citationsTitle}>Sources & References</p>
                    <div style={styles.citationChipsContainer}>
                      {msg.citations.map((cite, i) => (
                        <div
                          key={i}
                          style={styles.citationChip}
                          title="Click to view details"
                          onClick={() => setSelectedCitation(cite)}
                          className="hover-lift active-scale animate-fade-in"
                        >
                          <span className="material-symbols-outlined" style={styles.citeIcon}>description</span>
                          <span style={styles.citeText}>{cite.filename}</span>
                          <span style={styles.citeMeta}>{cite.meta}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
          {loading && (
            <div style={styles.messageRow}>
              <div style={styles.avatar}>
                <span className="material-symbols-outlined" style={{ color: 'var(--color-primary)' }}>smart_toy</span>
              </div>
              <div style={styles.typingIndicator}>
                <div style={styles.dot}></div>
                <div style={{ ...styles.dot, animationDelay: '0.2s' }}></div>
                <div style={{ ...styles.dot, animationDelay: '0.4s' }}></div>
                <span style={styles.typingText}>Searching knowledge index...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div style={styles.inputArea}>
        <div style={styles.suggestions}>
          {suggestionChips.map((chip, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(chip)}
              style={styles.suggestionChip}
              className="hover-lift active-scale"
            >
              {chip}
            </button>
          ))}
        </div>

        <div style={styles.inputBar}>
          <div style={styles.inputWrapper}>
            <button style={styles.actionBtn} title="Upload document context">
              <span className="material-symbols-outlined" style={{ color: 'var(--color-outline)' }}>attach_file</span>
            </button>
            
            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Ask a question about city regulations, waste collection, public utility rules..."
              style={styles.textarea}
              rows={1}
            />

            <div style={styles.inputActions}>
              <button style={styles.actionBtn} title="Voice input">
                <span className="material-symbols-outlined" style={{ color: 'var(--color-outline)' }}>mic</span>
              </button>
              <button onClick={() => handleSend()} style={styles.sendBtn} className="active-scale">
                <span className="material-symbols-outlined" style={{ color: '#fff' }}>send</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Citation Detail Modal */}
      {selectedCitation && (
        <div style={styles.modalOverlay} onClick={() => setSelectedCitation(null)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <div style={styles.modalTitleRow}>
                <span className="material-symbols-outlined" style={{ color: 'var(--color-primary)', fontSize: '20px' }}>description</span>
                <strong style={styles.modalTitle}>{selectedCitation.filename}</strong>
                <span style={styles.modalBadge}>{selectedCitation.meta}</span>
              </div>
              <button style={styles.closeBtn} onClick={() => setSelectedCitation(null)} className="hover-lift">
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>close</span>
              </button>
            </div>
            <div style={styles.modalBody}>
              <p style={styles.modalSectionLabel}>Retrieved Document Excerpt:</p>
              <blockquote style={styles.modalExcerpt}>{selectedCitation.text_excerpt}</blockquote>
            </div>
            <div style={styles.modalFooter}>
              <button style={styles.primaryBtn} onClick={() => setSelectedCitation(null)} className="hover-lift active-scale">
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    position: 'relative',
  },
  chatArea: {
    flex: 1,
    overflowY: 'auto',
    padding: 'var(--spacing-md)',
  },
  messagesContainer: {
    maxWidth: '800px',
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-md)',
  },
  messageRow: {
    display: 'flex',
    gap: 'var(--spacing-sm)',
    maxWidth: '85%',
  },
  avatar: {
    width: '40px',
    height: '40px',
    borderRadius: 'var(--rounded-full)',
    backgroundColor: 'var(--color-surface-container-high)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  bubble: {
    padding: 'var(--spacing-md)',
    boxShadow: 'var(--shadow-sm)',
    lineHeight: '1.6',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-sm)',
  },
  bubbleText: {
    fontSize: '15px',
    whiteSpace: 'pre-wrap',
  },
  metricsRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 'var(--spacing-md)',
    paddingTop: 'var(--spacing-xs)',
    borderTop: '1px solid rgba(94, 234, 212, 0.3)',
    alignItems: 'center',
  },
  metricItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-xs)',
  },
  metricLabel: {
    fontSize: '11px',
    fontWeight: '600',
    color: 'var(--color-outline)',
    textTransform: 'uppercase',
  },
  confidenceBarContainer: {
    width: '80px',
    height: '6px',
    borderRadius: 'var(--rounded-full)',
    backgroundColor: 'var(--color-outline-variant)',
    overflow: 'hidden',
  },
  confidenceBar: {
    height: '100%',
    backgroundColor: 'var(--color-secondary)',
    borderRadius: 'var(--rounded-full)',
  },
  metricVal: {
    fontSize: '12px',
    fontWeight: '700',
    color: 'var(--color-secondary)',
  },
  sourceBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '12px',
    fontWeight: '600',
    color: 'var(--color-secondary)',
  },
  badgeIcon: {
    fontSize: '16px',
  },
  citationsSection: {
    borderTop: '1px solid rgba(94, 234, 212, 0.3)',
    paddingTop: 'var(--spacing-xs)',
  },
  citationsTitle: {
    fontSize: '11px',
    fontWeight: '600',
    color: 'var(--color-outline)',
    textTransform: 'uppercase',
    marginBottom: 'var(--spacing-xs)',
    letterSpacing: '0.05em',
  },
  citationChipsContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 'var(--spacing-xs)',
  },
  citationChip: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    backgroundColor: 'var(--color-surface-container-high)',
    border: '1px solid var(--color-outline-variant)',
    borderRadius: 'var(--rounded-full)',
    padding: '4px 12px',
    cursor: 'help',
    transition: 'background-color 0.2s',
  },
  citeIcon: {
    fontSize: '14px',
    color: 'var(--color-primary)',
  },
  citeText: {
    fontSize: '12px',
    fontWeight: '500',
    color: 'var(--color-on-surface)',
  },
  citeMeta: {
    fontSize: '11px',
    color: 'var(--color-outline)',
    marginLeft: '4px',
  },
  typingIndicator: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: 'var(--spacing-sm)',
    backgroundColor: 'var(--color-surface)',
    borderRadius: 'var(--rounded-lg)',
    border: '1px solid var(--color-outline-variant)',
    boxShadow: 'var(--shadow-sm)',
  },
  dot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    backgroundColor: 'var(--color-primary)',
    animation: 'bounce 1.4s infinite ease-in-out both',
  },
  typingText: {
    fontSize: '13px',
    color: 'var(--color-outline)',
    marginLeft: 'var(--spacing-xs)',
  },
  inputArea: {
    padding: 'var(--spacing-md)',
    backgroundColor: 'var(--color-background)',
    borderTop: '1px solid var(--color-outline-variant)',
  },
  suggestions: {
    maxWidth: '800px',
    margin: '0 auto var(--spacing-sm) auto',
    display: 'flex',
    gap: 'var(--spacing-xs)',
    overflowX: 'auto',
    paddingBottom: '4px',
  },
  suggestionChip: {
    whiteSpace: 'nowrap',
    padding: '6px 14px',
    borderRadius: 'var(--rounded-full)',
    backgroundColor: 'var(--color-surface)',
    border: '1px solid var(--color-outline-variant)',
    fontSize: '13px',
    color: 'var(--color-on-surface-variant)',
    cursor: 'pointer',
    boxShadow: 'var(--shadow-sm)',
    transition: 'all 0.2s',
  },
  inputBar: {
    maxWidth: '800px',
    margin: '0 auto',
  },
  inputWrapper: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: 'var(--color-surface)',
    border: '1px solid var(--color-outline-variant)',
    borderRadius: 'var(--rounded-lg)',
    padding: '6px var(--spacing-sm)',
    boxShadow: 'var(--shadow-lg)',
  },
  textarea: {
    flex: 1,
    border: 'none',
    outline: 'none',
    resize: 'none',
    padding: '8px',
    fontSize: '14px',
    maxHeight: '120px',
    color: 'var(--color-on-surface)',
    backgroundColor: 'transparent',
  },
  actionBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '8px',
    borderRadius: 'var(--rounded-md)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'background-color 0.2s',
  },
  inputActions: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-xs)',
  },
  sendBtn: {
    backgroundColor: 'var(--color-primary)',
    border: 'none',
    borderRadius: 'var(--rounded-md)',
    width: '36px',
    height: '36px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    boxShadow: 'var(--shadow-sm)',
    transition: 'opacity 0.2s',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    backdropFilter: 'blur(4px)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    animation: 'fadeIn 0.2s ease-out',
  },
  modalContent: {
    backgroundColor: 'var(--color-surface)',
    borderRadius: 'var(--rounded-lg)',
    width: '90%',
    maxWidth: '500px',
    boxShadow: 'var(--shadow-lg)',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    animation: 'slideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
    border: '1px solid var(--color-outline-variant)',
  },
  modalHeader: {
    padding: 'var(--spacing-md)',
    borderBottom: '1px solid var(--color-outline-variant)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'var(--color-surface-container-low)',
  },
  modalTitleRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-xs)',
  },
  modalTitle: {
    fontSize: '15px',
    color: 'var(--color-on-surface)',
    margin: 0,
  },
  modalBadge: {
    fontSize: '11px',
    fontWeight: '600',
    backgroundColor: 'var(--color-primary-container)',
    color: 'var(--color-on-primary)',
    padding: '2px 8px',
    borderRadius: 'var(--rounded-full)',
    textTransform: 'uppercase',
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '4px',
    borderRadius: 'var(--rounded-md)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBody: {
    padding: 'var(--spacing-md)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-xs)',
  },
  modalSectionLabel: {
    fontSize: '11px',
    fontWeight: '600',
    color: 'var(--color-outline)',
    textTransform: 'uppercase',
    margin: '0 0 var(--spacing-xs) 0',
  },
  modalExcerpt: {
    fontSize: '14px',
    lineHeight: '1.6',
    color: 'var(--color-on-surface-variant)',
    backgroundColor: 'var(--color-surface-container-lowest)',
    borderLeft: '4px solid var(--color-primary)',
    padding: 'var(--spacing-sm)',
    margin: 0,
    borderRadius: '0 var(--rounded-md) var(--rounded-md) 0',
    whiteSpace: 'pre-wrap',
    maxHeight: '200px',
    overflowY: 'auto',
  },
  modalFooter: {
    padding: 'var(--spacing-md)',
    borderTop: '1px solid var(--color-outline-variant)',
    display: 'flex',
    justifyContent: 'flex-end',
    backgroundColor: 'var(--color-surface-container-low)',
  },
  primaryBtn: {
    backgroundColor: 'var(--color-primary)',
    color: '#fff',
    border: 'none',
    borderRadius: 'var(--rounded-md)',
    padding: '8px 16px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    boxShadow: 'var(--shadow-sm)',
  },
};

// Add raw CSS keyframe animations for typing indicator
const styleSheet = document.styleSheets[0];
try {
  styleSheet.insertRule(`
    @keyframes bounce {
      0%, 80%, 100% { transform: scale(0); }
      40% { transform: scale(1.0); }
    }
  `, styleSheet.cssRules.length);
} catch (e) {}
