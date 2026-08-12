import React, { useState } from 'react';
import Header from './components/Header';
import UploadCard from './components/UploadCard';
import PreviewDownloadCard from './components/PreviewDownloadCard';
import PatentFormsCard from './components/PatentFormsCard';
import AdditionalDetailsCard from './components/AdditionalDetailsCard';
import PrincipalDetailsCard from './components/PrincipalDetailsCard';
import InventorsCard from './components/InventorsCard';
import { getApiBaseUrl, fetchWithRetry } from './utils/apiConfig';

// Helper to extract first non-empty string among candidates
const getExtractValue = (...candidates) => {
  for (const val of candidates) {
    if (val !== undefined && val !== null && String(val).trim() !== '') {
      return String(val).trim();
    }
  }
  return null;
};

// Helper to safely merge single field: preference to extracted value if present, else keep existing
const mergeField = (existingValue, ...candidates) => {
  const extractedVal = getExtractValue(...candidates);
  if (extractedVal !== null) {
    return extractedVal;
  }
  return existingValue || '';
};

// Robust normalizer for API JSON response -> Frontend formData state
const normalizeExtractedData = (extracted, existingFormData = {}) => {
  if (!extracted || typeof extracted !== 'object') {
    return existingFormData;
  }

  const applicant = extracted.applicant || {};
  const applicantAddr = (applicant && applicant.address) || {};
  const principal = extracted.principal || {};

  // 1. College / Applicant Name (fullName / full_name / name / collegeName / applicantName / clgName)
  const collegeName = mergeField(
    existingFormData.collegeName,
    applicant.name,
    extracted.collegeName,
    extracted.college_name,
    extracted.applicantName,
    extracted.applicant_name,
    extracted.clgName,
    extracted.clg_name,
    extracted.fullName,
    extracted.full_name,
    extracted.name
  );

  // 2. House No
  const houseNo = mergeField(
    existingFormData.houseNo,
    applicantAddr.houseNo,
    applicantAddr.house_no,
    extracted.houseNo,
    extracted.house_no,
    extracted.doorNo,
    extracted.door_no
  );

  // 3. Street / Address (address / applicantAddress / street)
  const street = mergeField(
    existingFormData.street,
    applicantAddr.street,
    extracted.street,
    extracted.address,
    extracted.applicantAddress,
    extracted.fullAddress,
    extracted.full_address
  );

  // 4. City / District (city / district)
  const city = mergeField(
    existingFormData.city,
    applicantAddr.city,
    applicantAddr.district,
    extracted.city,
    extracted.district,
    extracted.town
  );

  // 5. State (state / stateName)
  const state = mergeField(
    existingFormData.state,
    applicantAddr.state,
    extracted.state,
    extracted.stateName,
    extracted.state_name
  );

  // 6. Country / Nationality (nationality / country)
  const country = mergeField(
    existingFormData.country,
    applicantAddr.country,
    applicant.country,
    extracted.country,
    extracted.nationality,
    applicant.nationality
  );

  // 7. Pincode (pincode / pinCode / postalCode / pin)
  const pincode = mergeField(
    existingFormData.pincode,
    applicantAddr.pincode,
    applicantAddr.pinCode,
    applicantAddr.postalCode,
    extracted.pincode,
    extracted.pinCode,
    extracted.postalCode,
    extracted.pin,
    extracted.pin_code
  );

  // 8. Principal Name (fullName / full_name / name / principalName)
  const principalName = mergeField(
    existingFormData.principalName,
    principal.name,
    extracted.principalName,
    extracted.principal_name,
    extracted.contactPerson,
    extracted.contact_person
  );

  // 9. Telephone (phone / phoneNumber / mobile / telephone)
  const telephone = mergeField(
    existingFormData.telephone,
    principal.telephone,
    extracted.telephone,
    extracted.phone,
    extracted.phoneNumber,
    extracted.phone_number
  );

  // 10. Mobile (phone / phoneNumber / mobile / telephone)
  const mobile = mergeField(
    existingFormData.mobile,
    principal.mobile,
    extracted.mobile,
    extracted.mobileNumber,
    extracted.mobile_number,
    extracted.phone,
    extracted.phoneNumber
  );

  // 11. Fax
  const fax = mergeField(
    existingFormData.fax,
    principal.fax,
    extracted.fax
  );

  // 12. Email (email / emailAddress / email_id)
  const email = mergeField(
    existingFormData.email,
    principal.email,
    applicant.email,
    extracted.email,
    extracted.emailAddress,
    extracted.email_address,
    extracted.emailId,
    extracted.email_id
  );

  // 13. Inventors Array
  let newInventors = [...(existingFormData.inventors || ['', '', ''])];
  if (Array.isArray(extracted.inventors) && extracted.inventors.length > 0) {
    const extractedNames = extracted.inventors
      .map(inv => {
        if (typeof inv === 'string') return inv.trim();
        if (inv && typeof inv === 'object') {
          return getExtractValue(inv.name, inv.fullName, inv.full_name, inv.inventorName, inv.inventor_name) || '';
        }
        return '';
      })
      .filter(name => name !== '');

    if (extractedNames.length > 0) {
      newInventors = extractedNames;
      while (newInventors.length < 3) {
        newInventors.push('');
      }
    }
  }

  return {
    collegeName,
    houseNo,
    street,
    city,
    state,
    country,
    pincode,
    principalName,
    telephone,
    mobile,
    fax,
    email,
    inventors: newInventors
  };
};

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

    setParsedData(prev => {
      const base = baseParsedData || prev || {};
      return {
        ...base,
        applicant: {
          ...(base.applicant || {}),
          name: currentFormData.collegeName || (base.applicant && base.applicant.name) || '',
          email: currentFormData.email || (base.applicant && base.applicant.email) || '',
          address: {
            ...((base.applicant && base.applicant.address) || {}),
            houseNo: currentFormData.houseNo || '',
            street: currentFormData.street || '',
            city: currentFormData.city || '',
            state: currentFormData.state || '',
            country: currentFormData.country || '',
            pincode: currentFormData.pincode || ''
          }
        },
        principal: {
          ...(base.principal || {}),
          name: currentFormData.principalName || (base.principal && base.principal.name) || '',
          designation: 'Principal',
          telephone: currentFormData.telephone || (base.principal && base.principal.telephone) || '',
          mobile: currentFormData.mobile || (base.principal && base.principal.mobile) || '',
          fax: currentFormData.fax || (base.principal && base.principal.fax) || '',
          email: currentFormData.email || (base.principal && base.principal.email) || ''
        },
        inventors: activeInventors.length > 0 ? activeInventors : (base.inventors || [])
      };
    });
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
      const baseUrl = getApiBaseUrl();
      for (const formKey of selectedForms) {
        const payloadData = new FormData();
        payloadData.append('data', JSON.stringify(parsedData || {}));
        if (sourceFile) {
          payloadData.append('sourceFile', sourceFile);
        }
        
        const response = await fetchWithRetry(`${baseUrl}/api/patent/download?formType=${formKey}`, {
          method: 'POST',
          body: payloadData,
        });

        if (!response.ok) {
          const errText = await response.text().catch(() => '');
          throw new Error(`Download failed (${response.status}): ${errText || response.statusText || 'Server error'}`);
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
      alert(`Download failed: ${error.message || 'Connecting to backend failed. Please check network connection or backend server status.'}`);
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