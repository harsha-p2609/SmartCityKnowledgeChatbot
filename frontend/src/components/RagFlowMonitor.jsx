import React, { useState, useEffect } from 'react';

// Safely inject @keyframes animation once on mount
function injectPulseAnimation() {
  const styleId = 'rag-flow-pulse-style';
  if (document.getElementById(styleId)) return;
  const styleEl = document.createElement('style');
  styleEl.id = styleId;
  styleEl.textContent = `
    @keyframes ragPulse {
      0%   { box-shadow: 0 0 0 0 rgba(46, 125, 50, 0.5); }
      70%  { box-shadow: 0 0 0 10px rgba(46, 125, 50, 0); }
      100% { box-shadow: 0 0 0 0 rgba(46, 125, 50, 0); }
    }
    @keyframes flowLine {
      0%   { background-position: 0 0; }
      100% { background-position: 0 24px; }
    }
    .rag-node-card {
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .rag-node-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(0,0,0,0.12);
    }
  `;
  document.head.appendChild(styleEl);
}

export default function RagFlowMonitor() {
  const [activeStep, setActiveStep] = useState('chunking');

  useEffect(() => {
    injectPulseAnimation();
  }, []);

  const steps = [
    {
      id: 'documents',
      title: 'City Documents',
      icon: 'source',
      badge: 'PDF · DOCX · CSV',
      color: '#3b82f6',
      description: 'Raw city regulations, waste schedules, and transport rules uploaded by the administrator. Only admins can upload or delete documents.',
      details: {
        'Supported Formats': '.pdf, .docx, .txt, .csv',
        'Storage Location': 'Server /uploads directory',
        'Database Logging': 'Atlas: smartcity_db.documents',
        'Access Control': 'Admin-only upload & delete'
      }
    },
    {
      id: 'loader',
      title: 'Document Loader',
      icon: 'file_download',
      badge: 'Text Extractor',
      color: '#8b5cf6',
      description: 'Extracts structured text content and layout elements from uploaded files. Strips binary headers and non-text elements.',
      details: {
        'PDF Parsing': 'pypdf PdfReader extractor',
        'Word Parsing': 'python-docx Document text extractor',
        'CSV / TXT Parsing': 'Native line-by-line text parser',
        'Error Handling': 'Graceful fallback on parse failure'
      }
    },
    {
      id: 'chunking',
      title: 'Text Chunking',
      icon: 'reorder',
      badge: 'Recursive Split',
      color: '#f59e0b',
      description: 'Recursively splits the raw parsed text into smaller overlapping sections to preserve semantic context at boundaries.',
      details: {
        'Target Chunk Size': '800 Characters',
        'Overlap Size': '120 Characters (15%)',
        'Location Metadata': 'Page num (PDF) · Paragraph num (DOCX)',
        'Storage Target': 'Atlas: smartcity_db.chunks'
      }
    },
    {
      id: 'embeddings',
      title: 'Vector Embeddings',
      icon: 'neurology',
      badge: 'Gemini API',
      color: '#10b981',
      description: 'Converts text chunks into high-dimensional vector representations that capture semantic meaning using Google Gemini.',
      details: {
        'Embedding Model': 'gemini-embedding-001',
        'Vector Dimensions': '768 Dimensions',
        'API Mode': 'REST POST to Gemini API',
        'Fallback': 'Zero vector on API failure'
      }
    },
    {
      id: 'database',
      title: 'Vector Store',
      icon: 'storage',
      badge: 'MongoDB Atlas',
      color: '#06b6d4',
      description: 'Stores text chunks, source location metadata, and embedding vectors persistently in MongoDB Atlas for fast querying.',
      details: {
        'Cluster': 'aismartcityapp.n2ofg6l.mongodb.net',
        'Collection': 'smartcity_db.chunks',
        'Vector Format': 'Array [Float64] per chunk',
        'Document Ref': 'document_id links chunk to source file'
      }
    },
    {
      id: 'search',
      title: 'Semantic Search',
      icon: 'manage_search',
      badge: 'Cosine Similarity',
      color: '#f97316',
      description: 'Embeds the user query and compares it against all stored chunk vectors using cosine similarity to find the most relevant context.',
      details: {
        'Algorithm': 'Native Python Cosine Similarity',
        'Formula': 'dot(A,B) / (‖A‖ · ‖B‖)',
        'Top K Results': '5 Matches',
        'Similarity Threshold': 'Score > 0.2 (filtered out below)'
      }
    },
    {
      id: 'rag',
      title: 'RAG Prompting',
      icon: 'prompt_suggestion',
      badge: 'Grounded LLM',
      color: '#ec4899',
      description: 'Compiles the user query and retrieved context chunks into a structured prompt, instructing the LLM to produce a grounded response.',
      details: {
        'Primary LLM': 'Groq — llama-3.3-70b-versatile',
        'Fallback LLM': 'Google Gemini 2.0 Flash',
        'Grounding Rule': 'Answer ONLY from provided context',
        'Hallucination Guard': 'Returns "I cannot find..." if context absent'
      }
    },
    {
      id: 'response',
      title: 'AI Response',
      icon: 'chat',
      badge: 'Verified Output',
      color: '#84cc16',
      description: 'Presents the answer to the citizen with a confidence score and source citations. Citizens access information only via the chatbot — not raw documents.',
      details: {
        'Confidence Score': 'Derived from best cosine similarity score',
        'Citations': 'File name + page/paragraph + excerpt',
        'Citizen Access': 'Chatbot only — no direct document download',
        'Feedback': 'Helpful / Inaccurate rating supported'
      }
    }
  ];

  const activeStepData = steps.find(s => s.id === activeStep);

  return (
    <div style={styles.container}>
      {/* Page Header */}
      <div style={styles.pageHeader}>
        <div style={styles.headerLeft}>
          <div style={styles.headerIconBg}>
            <span className="material-symbols-outlined" style={styles.headerIcon}>account_tree</span>
          </div>
          <div>
            <h2 style={styles.pageTitle}>RAG Infrastructure Flow</h2>
            <p style={styles.pageSubtitle}>
              Click any stage to inspect its technical parameters and live configuration.
            </p>
          </div>
        </div>
        <div style={styles.liveChip}>
          <div style={styles.liveDot} />
          <span style={styles.liveText}>Pipeline Active</span>
        </div>
      </div>

      {/* Main Content: Flow Chart + Details */}
      <div style={styles.splitLayout}>

        {/* Left — Vertical Flow Chain */}
        <div style={styles.flowColumn}>
          <div style={styles.flowChain}>
            {steps.map((step, idx) => {
              const isActive = activeStep === step.id;
              return (
                <React.Fragment key={step.id}>
                  {/* Connector Arrow between nodes */}
                  {idx > 0 && (
                    <div style={styles.connectorWrap}>
                      <div style={{ ...styles.connectorLine, borderColor: step.color + '55' }} />
                      <div style={{ ...styles.connectorArrow, borderTopColor: step.color }}>
                        <span className="material-symbols-outlined" style={{ ...styles.arrowIcon, color: step.color }}>
                          expand_more
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Pipeline Step Card */}
                  <div
                    className="rag-node-card"
                    onClick={() => setActiveStep(step.id)}
                    style={{
                      ...styles.nodeCard,
                      border: isActive
                        ? `2px solid ${step.color}`
                        : '1px solid var(--color-outline-variant)',
                      boxShadow: isActive
                        ? `0 0 0 4px ${step.color}22, 0 8px 24px rgba(0,0,0,0.10)`
                        : 'var(--shadow-sm)',
                      backgroundColor: isActive ? `${step.color}0d` : 'var(--color-surface)',
                    }}
                  >
                    {/* Step number + icon row */}
                    <div style={styles.nodeTop}>
                      <div style={{ ...styles.stepNumBadge, backgroundColor: step.color + '22', color: step.color }}>
                        {String(idx + 1).padStart(2, '0')}
                      </div>
                      <div style={{ ...styles.iconCircle, backgroundColor: isActive ? step.color : step.color + '22' }}>
                        <span className="material-symbols-outlined" style={{ ...styles.nodeIcon, color: isActive ? '#fff' : step.color }}>
                          {step.icon}
                        </span>
                      </div>
                      <span style={{
                        ...styles.nodeBadge,
                        backgroundColor: isActive ? step.color + '22' : 'var(--color-surface-container-low)',
                        color: isActive ? step.color : 'var(--color-on-surface-variant)',
                        border: `1px solid ${isActive ? step.color + '44' : 'transparent'}`
                      }}>
                        {step.badge}
                      </span>
                    </div>

                    {/* Title + description */}
                    <div style={styles.nodeBody}>
                      <h4 style={{ ...styles.nodeTitle, color: isActive ? step.color : 'var(--color-on-surface)' }}>
                        {step.title}
                      </h4>
                      <p style={styles.nodeDesc}>{step.description}</p>
                    </div>
                  </div>
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Right — Sticky Details Panel */}
        <div style={styles.detailsColumn}>
          {activeStepData && (
            <div style={{ ...styles.detailsPanel, borderTop: `4px solid ${activeStepData.color}` }}>
              {/* Panel header */}
              <div style={styles.detailsHeader}>
                <div style={{ ...styles.detailsIconCircle, backgroundColor: activeStepData.color + '22' }}>
                  <span className="material-symbols-outlined" style={{ ...styles.detailsIcon, color: activeStepData.color }}>
                    {activeStepData.icon}
                  </span>
                </div>
                <div>
                  <h3 style={{ ...styles.detailsTitle, color: activeStepData.color }}>
                    {activeStepData.title}
                  </h3>
                  <span style={{ ...styles.detailsBadge, color: activeStepData.color, backgroundColor: activeStepData.color + '18' }}>
                    {activeStepData.badge}
                  </span>
                </div>
              </div>

              {/* Overview */}
              <div style={styles.detailsSection}>
                <p style={styles.sectionLabel}>PIPELINE STAGE OVERVIEW</p>
                <p style={styles.sectionText}>{activeStepData.description}</p>
              </div>

              {/* Technical properties */}
              <div style={styles.detailsSection}>
                <p style={styles.sectionLabel}>TECHNICAL CONFIGURATION</p>
                <div style={styles.propsList}>
                  {Object.entries(activeStepData.details).map(([key, val]) => (
                    <div key={key} style={styles.propRow}>
                      <span style={styles.propKey}>{key}</span>
                      <span style={{ ...styles.propVal, color: activeStepData.color }}>{val}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Status */}
              <div style={styles.detailsSection}>
                <p style={styles.sectionLabel}>SIMULATION STATUS</p>
                <div style={styles.statusBox}>
                  <div style={styles.statusPulse} />
                  <span style={styles.statusText}>Systems Operational — Listening for Updates</span>
                </div>
              </div>

              {/* Step navigation */}
              <div style={styles.navRow}>
                {steps.findIndex(s => s.id === activeStep) > 0 && (
                  <button
                    style={styles.navBtn}
                    onClick={() => {
                      const idx = steps.findIndex(s => s.id === activeStep);
                      setActiveStep(steps[idx - 1].id);
                    }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>arrow_back</span>
                    Previous Stage
                  </button>
                )}
                {steps.findIndex(s => s.id === activeStep) < steps.length - 1 && (
                  <button
                    style={{ ...styles.navBtn, marginLeft: 'auto', backgroundColor: activeStepData.color + '18', color: activeStepData.color, border: `1px solid ${activeStepData.color + '44'}` }}
                    onClick={() => {
                      const idx = steps.findIndex(s => s.id === activeStep);
                      setActiveStep(steps[idx + 1].id);
                    }}
                  >
                    Next Stage
                    <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>arrow_forward</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Pipeline summary card below sticky panel */}
          <div style={styles.summaryCard}>
            <p style={styles.sectionLabel}>PIPELINE SUMMARY</p>
            <div style={styles.summaryGrid}>
              <div style={styles.summaryItem}>
                <span style={styles.summaryNum}>8</span>
                <span style={styles.summaryLabel}>Pipeline Stages</span>
              </div>
              <div style={styles.summaryItem}>
                <span style={styles.summaryNum}>768</span>
                <span style={styles.summaryLabel}>Vector Dimensions</span>
              </div>
              <div style={styles.summaryItem}>
                <span style={styles.summaryNum}>Top 5</span>
                <span style={styles.summaryLabel}>Semantic Matches</span>
              </div>
              <div style={styles.summaryItem}>
                <span style={styles.summaryNum}>Atlas</span>
                <span style={styles.summaryLabel}>Vector Store</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-md)',
    paddingBottom: 'var(--spacing-xl)',
  },

  // Header
  pageHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 'var(--spacing-sm)',
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-sm)',
  },
  headerIconBg: {
    width: '48px',
    height: '48px',
    borderRadius: 'var(--rounded-lg)',
    backgroundColor: 'var(--color-primary-container)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerIcon: {
    fontSize: '26px',
    color: 'var(--color-on-primary)',
  },
  pageTitle: {
    fontSize: '20px',
    fontWeight: '700',
    color: 'var(--color-on-surface)',
    margin: 0,
  },
  pageSubtitle: {
    fontSize: '13px',
    color: 'var(--color-on-surface-variant)',
    margin: 0,
    lineHeight: '1.4',
  },
  liveChip: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    backgroundColor: '#ecfdf5',
    border: '1px solid #a7f3d0',
    borderRadius: 'var(--rounded-full)',
    padding: '6px 14px',
  },
  liveDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    backgroundColor: '#10b981',
    animation: 'ragPulse 2s infinite',
  },
  liveText: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#065f46',
  },

  // Layout
  splitLayout: {
    display: 'grid',
    gridTemplateColumns: '1.3fr 1fr',
    gap: 'var(--spacing-lg)',
    alignItems: 'start',
  },

  // Flow column
  flowColumn: {
    display: 'flex',
    justifyContent: 'center',
  },
  flowChain: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch',
    width: '100%',
    maxWidth: '500px',
  },

  // Connector between nodes
  connectorWrap: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    height: '32px',
    position: 'relative',
  },
  connectorLine: {
    width: '0px',
    height: '100%',
    borderLeft: '2px dashed',
    opacity: 0.5,
  },
  connectorArrow: {
    position: 'absolute',
    bottom: 0,
  },
  arrowIcon: {
    fontSize: '20px',
    display: 'block',
    marginTop: '-4px',
  },

  // Node cards
  nodeCard: {
    width: '100%',
    borderRadius: 'var(--rounded-lg)',
    padding: 'var(--spacing-sm) var(--spacing-md)',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  nodeTop: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  stepNumBadge: {
    fontSize: '10px',
    fontWeight: '800',
    padding: '2px 7px',
    borderRadius: '4px',
    letterSpacing: '0.05em',
    minWidth: '28px',
    textAlign: 'center',
  },
  iconCircle: {
    width: '34px',
    height: '34px',
    borderRadius: 'var(--rounded-full)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    transition: 'background-color 0.3s',
  },
  nodeIcon: {
    fontSize: '18px',
    transition: 'color 0.3s',
  },
  nodeBadge: {
    marginLeft: 'auto',
    fontSize: '10px',
    fontWeight: '700',
    padding: '3px 10px',
    borderRadius: 'var(--rounded-full)',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
  },
  nodeBody: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  nodeTitle: {
    fontSize: '15px',
    fontWeight: '700',
    margin: 0,
    transition: 'color 0.3s',
  },
  nodeDesc: {
    fontSize: '12px',
    color: 'var(--color-on-surface-variant)',
    lineHeight: '1.5',
    margin: 0,
  },

  // Details panel (sticky)
  detailsColumn: {
    position: 'sticky',
    top: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-md)',
  },
  detailsPanel: {
    backgroundColor: 'var(--color-surface)',
    border: '1px solid var(--color-outline-variant)',
    borderRadius: 'var(--rounded-lg)',
    padding: 'var(--spacing-md)',
    boxShadow: 'var(--shadow-lg)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-md)',
  },
  detailsHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-sm)',
    paddingBottom: 'var(--spacing-sm)',
    borderBottom: '1px solid var(--color-outline-variant)',
  },
  detailsIconCircle: {
    width: '52px',
    height: '52px',
    borderRadius: 'var(--rounded-lg)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  detailsIcon: {
    fontSize: '30px',
  },
  detailsTitle: {
    fontSize: '17px',
    fontWeight: '700',
    margin: '0 0 4px 0',
  },
  detailsBadge: {
    fontSize: '11px',
    fontWeight: '600',
    padding: '2px 10px',
    borderRadius: 'var(--rounded-full)',
  },
  detailsSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-xs)',
  },
  sectionLabel: {
    fontSize: '10px',
    fontWeight: '700',
    color: 'var(--color-outline)',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    margin: 0,
  },
  sectionText: {
    fontSize: '13px',
    color: 'var(--color-on-surface-variant)',
    lineHeight: '1.55',
    margin: 0,
  },
  propsList: {
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: 'var(--color-surface-container-low)',
    borderRadius: 'var(--rounded-md)',
    border: '1px solid var(--color-outline-variant)',
    overflow: 'hidden',
  },
  propRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '12px',
    padding: '8px 12px',
    borderBottom: '1px solid var(--color-outline-variant)',
    fontSize: '12px',
    lineHeight: '1.4',
  },
  propKey: {
    fontWeight: '600',
    color: 'var(--color-on-surface-variant)',
    flexShrink: 0,
  },
  propVal: {
    fontWeight: '700',
    textAlign: 'right',
    fontSize: '12px',
  },
  statusBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    backgroundColor: '#ecfdf5',
    border: '1px solid #a7f3d0',
    borderRadius: 'var(--rounded-md)',
    padding: 'var(--spacing-sm)',
  },
  statusPulse: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    backgroundColor: '#10b981',
    flexShrink: 0,
    animation: 'ragPulse 2s infinite',
  },
  statusText: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#065f46',
  },

  // Navigation buttons inside panel
  navRow: {
    display: 'flex',
    gap: '8px',
    paddingTop: 'var(--spacing-xs)',
    borderTop: '1px solid var(--color-outline-variant)',
  },
  navBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    padding: '7px 14px',
    fontSize: '12px',
    fontWeight: '600',
    border: '1px solid var(--color-outline-variant)',
    borderRadius: 'var(--rounded-md)',
    backgroundColor: 'var(--color-surface-container-low)',
    color: 'var(--color-on-surface-variant)',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },

  // Summary card
  summaryCard: {
    backgroundColor: 'var(--color-surface)',
    border: '1px solid var(--color-outline-variant)',
    borderRadius: 'var(--rounded-lg)',
    padding: 'var(--spacing-md)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-sm)',
  },
  summaryGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 'var(--spacing-xs)',
  },
  summaryItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    backgroundColor: 'var(--color-surface-container-low)',
    borderRadius: 'var(--rounded-md)',
    padding: '12px 8px',
    textAlign: 'center',
  },
  summaryNum: {
    fontSize: '18px',
    fontWeight: '800',
    color: 'var(--color-primary)',
  },
  summaryLabel: {
    fontSize: '10px',
    fontWeight: '600',
    color: 'var(--color-on-surface-variant)',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
    marginTop: '2px',
  },
};
