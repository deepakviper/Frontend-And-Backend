import React, { useState } from 'react';
import Header from './components/Header';
import UploadCard from './components/UploadCard';
import PreviewDownloadCard from './components/PreviewDownloadCard';
import PatentFormsCard from './components/PatentFormsCard';
import AdditionalDetailsCard from './components/AdditionalDetailsCard';
import PrincipalDetailsCard from './components/PrincipalDetailsCard';
import InventorsCard from './components/InventorsCard';

function App() {
  // Unified single source of truth for all form inputs
  const [formData, setFormData] = useState({
    collegeName: '',
    houseNo: '',
    street: '',
    city: '',
    state: '',
    country: '',
    pincode: '',
    principalName: '',
    telephone: '',
    mobile: '',
    fax: '',
    email: '',
    inventors: ['', '', '']
  });

  // Track parsed patent data from document upload
  const [parsedData, setParsedData] = useState({
    applicant: {
      name: '',
      email: '',
      address: {
        houseNo: '',
        street: '',
        city: '',
        state: '',
        country: '',
        pincode: ''
      }
    },
    principal: {
      name: '',
      designation: 'Principal',
      telephone: '',
      mobile: '',
      fax: '',
      email: ''
    },
    inventors: []
  });

  const [isDownloading, setIsDownloading] = useState(false);
  const [selectedForms, setSelectedForms] = useState([]);
  const [sourceFile, setSourceFile] = useState(null);

  // Sync form inputs into parsedData for document generation
  const syncParsedData = (currentFormData, baseParsedData) => {
    const activeInventors = (currentFormData.inventors || [])
      .filter(name => name && name.trim() !== '')
      .map(name => ({
        name: name.trim(),
        nationality: 'Indian',
        country: 'India'
      }));

    setParsedData(prev => ({
      ...(baseParsedData || prev || {}),
      applicant: {
        name: currentFormData.collegeName || '',
        email: currentFormData.email || '',
        address: {
          houseNo: currentFormData.houseNo || '',
          street: currentFormData.street || '',
          city: currentFormData.city || '',
          state: currentFormData.state || '',
          country: currentFormData.country || '',
          pincode: currentFormData.pincode || ''
        }
      },
      principal: {
        name: currentFormData.principalName || '',
        designation: 'Principal',
        telephone: currentFormData.telephone || '',
        mobile: currentFormData.mobile || '',
        fax: currentFormData.fax || '',
        email: currentFormData.email || ''
      },
      inventors: activeInventors
    }));
  };

  const handleFormFieldChange = (fieldName, value) => {
    setFormData(prev => {
      const updated = { ...prev, [fieldName]: value };
      syncParsedData(updated, parsedData);
      return updated;
    });
  };

  const handleInventorChange = (index, value) => {
    setFormData(prev => {
      const updatedInventors = [...prev.inventors];
      updatedInventors[index] = value;
      const updated = { ...prev, inventors: updatedInventors };
      syncParsedData(updated, parsedData);
      return updated;
    });
  };

  const handleAddInventor = () => {
    setFormData(prev => {
      if (prev.inventors.length >= 8) return prev;
      const updated = { ...prev, inventors: [...prev.inventors, ''] };
      syncParsedData(updated, parsedData);
      return updated;
    });
  };

  const handleRemoveInventor = (index) => {
    setFormData(prev => {
      let updatedInventors = prev.inventors.filter((_, idx) => idx !== index);
      while (updatedInventors.length < 3) {
        updatedInventors.push('');
      }
      const updated = { ...prev, inventors: updatedInventors };
      syncParsedData(updated, parsedData);
      return updated;
    });
  };

  // --- DOWNLOAD ACTION ---
  const handleDownloadDocx = async () => {
    if (!parsedData) return;
    
    if (selectedForms.length === 0) {
      alert("Please select at least one form to download from the list.");
      return;
    }

    const validForms = ['form1', 'form2', 'form3', 'form5', 'form9', 'form28'];
    const unsupportedSelected = selectedForms.filter(form => !validForms.includes(form));
    
    if (unsupportedSelected.length > 0) {
      alert(`Backend for ${unsupportedSelected.join(', ')} is not ready!`);
      return;
    }

    setIsDownloading(true);

    try {
      for (const formKey of selectedForms) {
        const payloadData = new FormData();
        payloadData.append('data', JSON.stringify(parsedData || {}));
        if (sourceFile) {
          payloadData.append('sourceFile', sourceFile);
        }
        
        const rawBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';
        const baseUrl = rawBaseUrl.replace(/\/+$/, '');
        const response = await fetch(`${baseUrl}/api/patent/download?formType=${formKey}`, {
          method: 'POST',
          body: payloadData,
        });

        if (!response.ok) {
          const errText = await response.text().catch(() => '');
          throw new Error(`Download failed (${response.status}): ${errText || response.statusText}`);
        }

        const blob = await response.blob();
        const downloadUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = downloadUrl;
        
        let displayFormName = 'Form_1_Application';
        if (formKey === 'form2') {
          displayFormName = 'Form_2_Specification';
        } else if (formKey === 'form3') {
          displayFormName = 'Form_3_Undertaking';
        } else if (formKey === 'form5') {
          displayFormName = 'Form_5_Declaration_of_Inventorship';
        } else if (formKey === 'form9') {
          displayFormName = 'Form_9_Request_For_Publication';
        } else if (formKey === 'form28') {
          displayFormName = 'Form_28_Small_Entity_Claim';
        }

        link.setAttribute('download', `Filled_Patent_${displayFormName}.docx`);
        
        document.body.appendChild(link);
        link.click();
        link.parentNode.removeChild(link);
        window.URL.revokeObjectURL(downloadUrl);
      }
    } catch (error) {
      console.error("Download Error: ", error);
      alert('An error occurred while downloading.');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleResetWorkspace = () => {
    setSourceFile(null);
    const cleanForm = {
      collegeName: '',
      houseNo: '',
      street: '',
      city: '',
      state: '',
      country: '',
      pincode: '',
      principalName: '',
      telephone: '',
      mobile: '',
      fax: '',
      email: '',
      inventors: ['', '', '']
    };
    setFormData(cleanForm);
    setParsedData({
      applicant: {
        name: '',
        email: '',
        address: { houseNo: '', street: '', city: '', state: '', country: '', pincode: '' }
      },
      principal: { name: '', designation: 'Principal', telephone: '', mobile: '', fax: '', email: '' },
      inventors: []
    });
    setSelectedForms([]);
  };

  const handleDataParsed = (data, file) => {
    if (file) {
      setSourceFile(file);
    }

    if (data) {
      syncParsedData(formData, data);
    }
  };

  return (
    <div>
      <Header user={{ name: formData.collegeName, email: formData.email }} onLogout={handleResetWorkspace} />
      <div className="main-container">
        <div className="column-card-container col-1">
          <AdditionalDetailsCard
            formData={formData}
            onChange={handleFormFieldChange}
          />
        </div>
        <div className="column-card-container col-2" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <PrincipalDetailsCard
            formData={formData}
            onChange={handleFormFieldChange}
          />
          <InventorsCard
            formData={formData}
            onInventorChange={handleInventorChange}
            onAddInventor={handleAddInventor}
            onRemoveInventor={handleRemoveInventor}
          />
        </div>
        <div className="column-card-container col-3" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <UploadCard onDataParsed={handleDataParsed} />
          <PreviewDownloadCard 
            previewData={parsedData} 
            onDownloadTrigger={handleDownloadDocx}
            isDownloading={isDownloading}
            selectedForms={selectedForms} 
          />
        </div>
        <div className="column-card-container col-4">
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