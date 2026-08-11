import React from 'react';
import { Phone, User } from 'lucide-react';

function PrincipalDetailsCard({ formData, onChange }) {
  const inputStyle = {
    background: '#F9FAFB',
    border: '1px solid #D1D5DB',
    color: '#1F2937',
    paddingLeft: '12px',
    paddingRight: '12px',
    height: '36px',
    fontSize: '13px',
    borderRadius: '6px',
    width: '100%'
  };

  const labelStyle = {
    color: '#4B5563',
    fontWeight: '600',
    fontSize: '12px',
    marginBottom: '4px',
    display: 'block'
  };

  return (
    <div className="card principal-details-card" style={{ padding: '24px', backgroundColor: '#FFF', borderRadius: '12px', border: '1px solid #E5E7EB', display: 'flex', flexDirection: 'column' }}>
      <div className="card-header" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', borderBottom: '1px solid #F3F4F6', paddingBottom: '12px', flexShrink: 0 }}>
        <Phone className="card-header-icon" style={{ color: '#0052cc' }} size={20} />
        <span className="card-header-title" style={{ fontWeight: '600', fontSize: '1.1rem', color: '#1F2937' }}>Principal Details</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        
        {/* Principal Name */}
        <div className="form-group">
          <label style={labelStyle} htmlFor="addr-principalName">Principal Name</label>
          <div className="input-container">
            <User className="input-icon" style={{ color: '#9CA3AF' }} size={16} />
            <input
              id="addr-principalName"
              type="text"
              className="login-input"
              style={{
                ...inputStyle,
                paddingLeft: '38px'
              }}
              placeholder="Enter principal name"
              value={formData?.principalName || ''}
              onChange={(e) => onChange('principalName', e.target.value)}
            />
          </div>
        </div>

        {/* Telephone No. */}
        <div className="form-group">
          <label style={labelStyle} htmlFor="addr-telephone">Telephone No.</label>
          <input
            id="addr-telephone"
            type="text"
            className="login-input"
            style={inputStyle}
            placeholder="Enter telephone number"
            value={formData?.telephone || ''}
            onChange={(e) => onChange('telephone', e.target.value)}
          />
        </div>

        {/* Mobile No. */}
        <div className="form-group">
          <label style={labelStyle} htmlFor="addr-mobile">Mobile No.</label>
          <input
            id="addr-mobile"
            type="text"
            className="login-input"
            style={inputStyle}
            placeholder="Enter mobile number"
            value={formData?.mobile || ''}
            onChange={(e) => onChange('mobile', e.target.value)}
          />
        </div>

        {/* Fax No. */}
        <div className="form-group">
          <label style={labelStyle} htmlFor="addr-fax">Fax No.</label>
          <input
            id="addr-fax"
            type="text"
            className="login-input"
            style={inputStyle}
            placeholder="Enter fax number"
            value={formData?.fax || ''}
            onChange={(e) => onChange('fax', e.target.value)}
          />
        </div>

        {/* Email ID */}
        <div className="form-group">
          <label style={labelStyle} htmlFor="addr-email">Email ID</label>
          <input
            id="addr-email"
            type="text"
            className="login-input"
            style={inputStyle}
            placeholder="Enter email ID"
            value={formData?.email || ''}
            onChange={(e) => onChange('email', e.target.value)}
          />
        </div>

      </div>
    </div>
  );
}

export default PrincipalDetailsCard;
