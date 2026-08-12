import React, { useState } from 'react';
import Header from './components/Header';
import UploadCard from './components/UploadCard';
import PreviewDownloadCard from './components/PreviewDownloadCard';
import PatentFormsCard from './components/PatentFormsCard';

function App() {
  const [parsedData, setParsedData] = useState(null);
  const [isDownloading, setIsDownloading] = useState(false);
  // Track which forms are selected in the right column
  const [selectedForms, setSelectedForms] = useState([]);

  // --- DOWNLOAD ACTION ---
  const handleDownloadDocx = async () => {
    if (!parsedData) return;
    
    if (selectedForms.length === 0) {
      alert("Please select at least one form to download from the list.");
      return;
    }

    setIsDownloading(true);

    try {
      const baseUrl = getApiBaseUrl();
      const downloadResponse = await fetchWithRetry(`${baseUrl}/api/patent/download`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...parsedData,         // Spreads fields (title, abstract, claims) at root level for backend binding
          requestedForms: selectedForms 
        }),
      });

      if (!downloadResponse.ok) throw new Error(`Server returned status ${downloadResponse.status} during document creation.`);

      const blob = await downloadResponse.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      
      // Dynamic naming structure based on number of selected forms
      const filename = selectedForms.length === 1 
        ? `Filled_Patent_${selectedForms[0]}.docx` 
        : 'Filled_Patent_Documents.zip'; 
        
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error(error);
      alert(`Download failed: ${error.message || 'Connecting to backend failed. Please check network connection or backend server status.'}`);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleDataParsed = (data) => {
    setParsedData(data);
  };

  return (
    <div>
      <Header />
      <div className="main-container">
        <div className="left-column">
          <UploadCard onDataParsed={handleDataParsed} />
          <PreviewDownloadCard 
            previewData={parsedData} 
            onDownloadTrigger={handleDownloadDocx}
            isDownloading={isDownloading}
            selectedForms={selectedForms} // 👈 Added prop to update button text dynamically
          />
        </div>
        <div className="right-column">
          <PatentFormsCard 
            selectedForms={selectedForms} 
            setSelectedForms={setSelectedForms} 
          />
        </div>
      </div>
    </div>
  );
}

export default App;