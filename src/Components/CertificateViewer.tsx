import React, { useState, useEffect } from 'react';
import { getCertificateFromStorage, getAllCertificates, loadCertificateFromPublic } from '../utils/certificateUtils';

interface CertificateViewerProps {
  certificateName?: string;
  filename?: string; // For loading from public folder
  onClose?: () => void;
}

const CertificateViewer: React.FC<CertificateViewerProps> = ({ 
  certificateName, 
  filename,
  onClose 
}) => {
  const [htmlContent, setHtmlContent] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadCertificate = async () => {
      setLoading(true);
      setError(null);
      
      try {
        let content: string | null = null;
        
        // Try to load from public folder first if filename is provided
        if (filename) {
          try {
            content = await loadCertificateFromPublic(filename);
          } catch (err) {
            console.warn('Could not load from public folder, trying localStorage...');
          }
        }
        
        // If not found in public folder, try localStorage
        if (!content && certificateName) {
          content = getCertificateFromStorage(certificateName);
        }
        
        if (content) {
          setHtmlContent(content);
        } else {
          setError('Certificate not found');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load certificate');
      } finally {
        setLoading(false);
      }
    };

    if (certificateName || filename) {
      loadCertificate();
    }
  }, [certificateName, filename]);

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loading}>Loading certificate...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.container}>
        <div style={styles.error}>Error: {error}</div>
        {onClose && (
          <button onClick={onClose} style={styles.closeButton}>
            Close
          </button>
        )}
      </div>
    );
  }

  return (
    <div style={styles.wrapper}>
      {onClose && (
        <button onClick={onClose} style={styles.closeButton}>
          ✕ Close
        </button>
      )}
      <div 
        style={styles.certificateContainer}
        dangerouslySetInnerHTML={{ __html: htmlContent }}
      />
    </div>
  );
};

// Certificate List Component
export const CertificateList: React.FC<{ onSelect: (name: string) => void }> = ({ onSelect }) => {
  const [certificates, setCertificates] = useState<string[]>([]);

  useEffect(() => {
    setCertificates(getAllCertificates());
  }, []);

  if (certificates.length === 0) {
    return (
      <div style={styles.emptyState}>
        <p>No certificates saved yet.</p>
        <p style={styles.hint}>Create a certificate in the Edit Template page to get started.</p>
      </div>
    );
  }

  return (
    <div style={styles.listContainer}>
      <h3 style={styles.listTitle}>Saved Certificates</h3>
      <ul style={styles.list}>
        {certificates.map((name) => (
          <li key={name} style={styles.listItem}>
            <button 
              onClick={() => onSelect(name)} 
              style={styles.listButton}
            >
              {name}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  wrapper: {
    position: 'relative',
    width: '100%',
    minHeight: '100vh',
    padding: '20px',
    backgroundColor: '#f5f5f5',
  },
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    padding: '20px',
  },
  certificateContainer: {
    width: '100%',
    maxWidth: '1200px',
    margin: '0 auto',
    backgroundColor: 'white',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    borderRadius: '8px',
    overflow: 'auto',
  },
  loading: {
    fontSize: '18px',
    color: '#666',
  },
  error: {
    fontSize: '18px',
    color: '#d32f2f',
    marginBottom: '20px',
  },
  closeButton: {
    position: 'absolute',
    top: '20px',
    right: '20px',
    padding: '10px 20px',
    background: 'linear-gradient(90deg, #7fc9fd 0%, #7a1dd9 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    zIndex: 1000,
  },
  listContainer: {
    padding: '20px',
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    maxWidth: '600px',
    margin: '20px auto',
  },
  listTitle: {
    fontSize: '24px',
    marginBottom: '20px',
    color: '#333',
  },
  list: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
  },
  listItem: {
    marginBottom: '10px',
  },
  listButton: {
    width: '100%',
    padding: '12px 20px',
    backgroundColor: '#f5f5f5',
    border: '1px solid #ddd',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '16px',
    textAlign: 'left',
    transition: 'background-color 0.2s',
  },
  emptyState: {
    textAlign: 'center',
    padding: '40px',
    color: '#666',
  },
  hint: {
    fontSize: '14px',
    color: '#999',
    marginTop: '10px',
  },
};

export default CertificateViewer;

