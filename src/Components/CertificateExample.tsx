import React, { useState } from 'react';
import CertificateViewer, { CertificateList } from './CertificateViewer';

/**
 * Example component showing how to use CertificateViewer
 * You can integrate this into your MainPage or create a separate route
 */
const CertificateExample: React.FC = () => {
  const [selectedCertificate, setSelectedCertificate] = useState<string | null>(null);
  const [showViewer, setShowViewer] = useState(false);

  const handleSelectCertificate = (name: string) => {
    setSelectedCertificate(name);
    setShowViewer(true);
  };

  const handleCloseViewer = () => {
    setShowViewer(false);
    setSelectedCertificate(null);
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Certificate Viewer Example</h2>
      
      {!showViewer ? (
        <div>
          <p>Select a certificate to view:</p>
          <CertificateList onSelect={handleSelectCertificate} />
          
          <div style={{ marginTop: '30px', padding: '20px', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
            <h3>Usage Examples:</h3>
            <pre style={{ backgroundColor: 'white', padding: '15px', borderRadius: '5px', overflow: 'auto' }}>
{`// Load from localStorage
<CertificateViewer certificateName="birth certificate" />

// Load from public folder
<CertificateViewer filename="birth_certificate_certificate.html" />

// With close button
<CertificateViewer 
  certificateName="birth certificate" 
  onClose={() => setShowViewer(false)} 
/>

// List all certificates
<CertificateList onSelect={(name) => handleSelect(name)} />`}
            </pre>
          </div>
        </div>
      ) : (
        <CertificateViewer 
          certificateName={selectedCertificate || undefined}
          onClose={handleCloseViewer}
        />
      )}
    </div>
  );
};

export default CertificateExample;

