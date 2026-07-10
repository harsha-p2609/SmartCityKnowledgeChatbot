import React, { useState } from 'react';

export default function RagFlowMonitor() {
  const [activeStep, setActiveStep] = useState('chunking');

  const steps = [
    {
      id: 'documents',
      title: 'City Documents',
      icon: 'source',
      badge: 'PDF, DOCX, CSV',
      description: 'Raw city regulations, waste schedules, transport rules uploaded by the administrator.',
      details: {
        'Supported Formats': '.pdf, .docx, .txt, .csv',
        'Storage Staging': 'Local system directory /uploads',
        'Database Logging': 'Stored in smartcity_db.documents'
      }
    },
    {
      id: 'loader',
      title: 'Document Loader',
      icon: 'file_download',
      badge: 'Text Extractor',
      description: 'Extracts structured text contents and layout elements. Strips binary headers and figures.',
      details: {
        'PDF Parsing': 'pypdf PdfReader extractor',
        'Word Parsing': 'python-docx Document text extractor',
        'Spreadsheet Parsing': 'Native line-by-line CSV parser'
      }
    },
    {
      id: 'chunking',
      title: 'Text Chunking',
      icon: 'reorder',
      badge: 'Recursive Split',
      description: 'Recursively splits the raw parsed text into smaller overlapping sections to preserve semantic context.',
      details: {
        'Target Chunk Size': '800 Characters',
        'Overlap Ratio': '15% (120 Characters)',
        'Locational Metadata': 'Page num (PDF) / Paragraph num (Word)'
      }
    },
    {
      id: 'embeddings',
      title: 'Embeddings',
      icon: 'neurology',
      badge: 'Gemini Vector API',
      description: 'Converts chunks of text into high-dimensional vector representations capturing semantic meaning.',
      details: {
        'Embedding Model': 'models/text-embedding-004',
        'Vector Dimensions': '768 Dimensions (Gemini)',
        'API Request Mode': 'retrieval_document (Bulk batching)'
      }
    },
    {
      id: 'database',
      title: 'Vector Database',
      icon: 'storage',
      badge: 'MongoDB Chunks',
      description: 'Stores text chunks, source metadata, and embedding vectors for ultra-fast persistent querying.',
      details: {
        'Collection Name': 'smartcity_db.chunks',
        'Vector Storage Format': 'Standard Array [Double]',
        'Index Configuration': 'Document references and chunk indexes'
      }
    },
    {
      id: 'search',
      title: 'Semantic Search',
      icon: 'manage_search',
      badge: 'Cosine Similarity',
      description: 'Calculates similarity between query embedding and document chunk embeddings to find top K references.',
      details: {
        'Matching Algorithm': 'Native Python Cosine Similarity',
        'Mathematical Formula': 'dot_product(A, B) / (norm(A) * norm(B))',
        'Default Retain Count': 'Top 5 matches (Filtered at similarity score > 0.2)'
      }
    },
    {
      id: 'rag',
      title: 'RAG Ingestion',
      icon: 'prompt_suggestion',
      badge: 'Grounded LLM Prompt',
      description: 'Compiles the user query and retrieved context chunks into a structured prompt, instructing the LLM to write a grounded response.',
      details: {
        'Target LLM': 'models/gemini-1.5-flash',
        'System Guidelines': 'Answer ONLY using provided text, cite files & pages, report confidence',
        'Hallucination Shield': 'Return "I cannot find the answer..." if context is absent'
      }
    },
    {
      id: 'response',
      title: 'AI Response',
      icon: 'chat',
      badge: 'Verified Output',
      description: 'Presents the formatted answer to the user with confidence gauges and clickable citations linking back to original sources.',
      details: {
        'Citations Mapping': 'Highlights matching file, page/paragraph, and excerpt text',
        'Confidence Scoring': 'Calculated based on best cosine similarity match score',
        'Citizen Actions': 'Feedback ratings (Helpful / Inaccurate), copy answers'
      }
    }
  ];

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h3 style={styles.title}>RAG Infrastructure Flow</h3>
        <p style={styles.subtitle}>Click on any stage in the pipeline to view real-time operations, parameters, and metadata configurations.</p>
      </div>

      <div style={styles.splitLayout}>
        {/* Left Column: Visual flow chart */}
        <div style={styles.flowColumn}>
          <div style={styles.flowChain}>
            {steps.map((step, idx) => {
              const isSelected = activeStep === step.id;
              return (
                <React.Fragment key={step.id}>
                  {idx > 0 && (
                    <div style={styles.arrowWrapper}>
                      <span className="material-symbols-outlined" style={styles.arrowIcon}>arrow_downward</span>
                      <div className="flow-line" style={styles.animatedLine} />
                    </div>
                  )}
                  
                  <div
                    onClick={() => setActiveStep(step.id)}
                    style={{
                      ...styles.nodeCard,
                      border: isSelected ? '2px solid var(--color-primary)' : '1px solid var(--color-outline-variant)',
                      boxShadow: isSelected ? 'var(--shadow-lg)' : 'var(--shadow-sm)',
                      transform: isSelected ? 'scale(1.02)' : 'scale(1)',
                      backgroundColor: isSelected ? '#f8fafc' : 'var(--color-surface)'
                    }}
                    className="hover-lift"
                  >
                    <div style={styles.nodeHeader}>
                      <div style={{
                        ...styles.iconBox,
                        backgroundColor: isSelected ? 'var(--color-primary-container)' : 'var(--color-surface-container-high)',
                        color: isSelected ? 'var(--color-on-primary)' : 'var(--color-primary)'
                      }}>
                        <span className="material-symbols-outlined">{step.icon}</span>
                      </div>
                      <span style={{
                        ...styles.nodeBadge,
                        backgroundColor: isSelected ? 'var(--color-secondary-container)' : 'var(--color-surface-container-low)',
                        color: isSelected ? 'var(--color-on-secondary-container)' : 'var(--color-on-surface-variant)'
                      }}>{step.badge}</span>
                    </div>
                    <div style={styles.nodeBody}>
                      <h4 style={{
                        ...styles.nodeTitle,
                        color: isSelected ? 'var(--color-primary)' : 'var(--color-on-surface)'
                      }}>{step.title}</h4>
                      <p style={styles.nodeDesc}>{step.description}</p>
                    </div>
                  </div>
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Right Column: Dynamic Step Details Panel */}
        <div style={styles.detailsColumn}>
          {(() => {
            const step = steps.find(s => s.id === activeStep);
            if (!step) return null;
            return (
              <div style={styles.detailsPanel}>
                <div style={styles.detailsHeader}>
                  <span className="material-symbols-outlined" style={styles.detailsIcon}>{step.icon}</span>
                  <div>
                    <h3 style={styles.detailsTitle}>{step.title}</h3>
                    <span style={styles.detailsBadge}>{step.badge}</span>
                  </div>
                </div>

                <div style={styles.detailsSection}>
                  <h4 style={styles.sectionTitle}>Pipeline Stage Overview</h4>
                  <p style={styles.sectionText}>{step.description}</p>
                </div>

                <div style={styles.detailsSection}>
                  <h4 style={styles.sectionTitle}>Technical Configuration Properties</h4>
                  <div style={styles.propsList}>
                    {Object.entries(step.details).map(([key, val]) => (
                      <div key={key} style={styles.propItem}>
                        <span style={styles.propKey}>{key}</span>
                        <span style={styles.propVal}>{val}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={styles.detailsSection}>
                  <h4 style={styles.sectionTitle}>Simulation Status</h4>
                  <div style={styles.statusBox}>
                    <div style={styles.statusPulse}></div>
                    <span style={styles.statusText}>Systems Operational (Listening to updates)</span>
                  </div>
                </div>
              </div>
            );
          })()}
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
  },
  header: {
    marginBottom: 'var(--spacing-sm)',
  },
  title: {
    fontSize: '20px',
    fontWeight: '700',
    color: 'var(--color-on-surface)',
    marginBottom: 'var(--spacing-base)',
  },
  subtitle: {
    fontSize: '14px',
    color: 'var(--color-on-surface-variant)',
    lineHeight: '1.4',
  },
  splitLayout: {
    display: 'grid',
    gridTemplateColumns: '1.2fr 1fr',
    gap: 'var(--spacing-md)',
    alignItems: 'start',
  },
  flowColumn: {
    display: 'flex',
    justifyContent: 'center',
    padding: 'var(--spacing-sm) 0',
  },
  flowChain: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%',
    maxWidth: '440px',
  },
  nodeCard: {
    width: '100%',
    padding: 'var(--spacing-sm) var(--spacing-md)',
    borderRadius: 'var(--rounded-lg)',
    cursor: 'pointer',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-xs)',
  },
  nodeHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  iconBox: {
    width: '32px',
    height: '32px',
    borderRadius: 'var(--rounded-md)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.3s',
  },
  nodeBadge: {
    fontSize: '11px',
    fontWeight: '700',
    padding: '2px 8px',
    borderRadius: 'var(--rounded-full)',
    textTransform: 'uppercase',
  },
  nodeBody: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  nodeTitle: {
    fontSize: '15px',
    fontWeight: '700',
    transition: 'color 0.3s',
  },
  nodeDesc: {
    fontSize: '13px',
    color: 'var(--color-on-surface-variant)',
    lineHeight: '1.4',
  },
  arrowWrapper: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    height: '36px',
    justifyContent: 'center',
    position: 'relative',
    width: '100%',
  },
  arrowIcon: {
    fontSize: '20px',
    color: 'var(--color-outline-variant)',
    zIndex: 2,
  },
  animatedLine: {
    position: 'absolute',
    width: '2px',
    height: '100%',
    top: 0,
    zIndex: 1,
  },
  detailsColumn: {
    position: 'sticky',
    top: '80px',
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
  detailsIcon: {
    fontSize: '36px',
    color: 'var(--color-primary)',
  },
  detailsTitle: {
    fontSize: '18px',
    fontWeight: '700',
    color: 'var(--color-on-surface)',
  },
  detailsBadge: {
    fontSize: '11px',
    fontWeight: '600',
    color: 'var(--color-primary)',
    backgroundColor: 'var(--color-on-primary-container)',
    padding: '2px 8px',
    borderRadius: 'var(--rounded-full)',
  },
  detailsSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-xs)',
  },
  sectionTitle: {
    fontSize: '12px',
    fontWeight: '600',
    color: 'var(--color-outline)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  sectionText: {
    fontSize: '14px',
    color: 'var(--color-on-surface-variant)',
    lineHeight: '1.5',
  },
  propsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-xs)',
    backgroundColor: 'var(--color-surface-container-low)',
    borderRadius: 'var(--rounded-md)',
    padding: 'var(--spacing-sm)',
    border: '1px solid var(--color-outline-variant)',
  },
  propItem: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '13px',
    lineHeight: '1.4',
  },
  propKey: {
    fontWeight: '600',
    color: 'var(--color-on-surface-variant)',
  },
  propVal: {
    color: 'var(--color-primary)',
    fontWeight: '700',
    textAlign: 'right',
  },
  statusBox: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-xs)',
    backgroundColor: '#ecfdf5',
    border: '1px solid #a7f3d0',
    borderRadius: 'var(--rounded-md)',
    padding: 'var(--spacing-sm)',
  },
  statusPulse: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    backgroundColor: 'var(--color-secondary)',
    boxShadow: '0 0 0 0 rgba(46, 125, 50, 0.4)',
    animation: 'pulse 2s infinite',
  },
  statusText: {
    fontSize: '13px',
    fontWeight: '600',
    color: 'var(--color-on-secondary-container)',
  },
};

// Add CSS keyframe animation for status pulse
const styleSheet = document.styleSheets[0];
try {
  styleSheet.insertRule(`
    @keyframes pulse {
      0% { box-shadow: 0 0 0 0 rgba(46, 125, 50, 0.4); }
      70% { box-shadow: 0 0 0 10px rgba(46, 125, 50, 0); }
      100% { box-shadow: 0 0 0 0 rgba(46, 125, 50, 0); }
    }
  `, styleSheet.cssRules.length);
} catch (e) {}
