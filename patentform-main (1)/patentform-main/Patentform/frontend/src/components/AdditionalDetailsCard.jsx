import React from 'react';
import { User, Sparkles } from 'lucide-react';

function AdditionalDetailsCard({ formData, onChange }) {
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
    <div className="card additional-details-card" style={{ padding: '24px', backgroundColor: '#FFF', borderRadius: '12px', border: '1px solid #E5E7EB', display: 'flex', flexDirection: 'column' }}>
      <div className="card-header" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', borderBottom: '1px solid #F3F4F6', paddingBottom: '12px', flexShrink: 0 }}>
        <Sparkles className="card-header-icon" style={{ color: '#0052cc' }} size={20} />
        <span className="card-header-title" style={{ fontWeight: '600', fontSize: '1.1rem', color: '#1F2937' }}>Applicant Details</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {/* College Name */}
        <div className="form-group">
          <label style={labelStyle} htmlFor="details-name">
            College Name
          </label>
          <div className="input-container">
            <User className="input-icon" style={{ color: '#9CA3AF' }} size={16} />
            <input
              id="details-name"
              type="text"
              className="login-input"
              style={{
                ...inputStyle,
                paddingLeft: '38px'
              }}
              placeholder="Enter college name"
              value={formData?.collegeName || ''}
              onChange={(e) => onChange('collegeName', e.target.value)}
            />
          </div>
        </div>

        {/* House No */}
        <div className="form-group">
          <label style={labelStyle} htmlFor="addr-houseNo">House No.</label>
          <input
            id="addr-houseNo"
            type="text"
            className="login-input"
            style={inputStyle}
            placeholder="Enter house number"
            value={formData?.houseNo || ''}
            onChange={(e) => onChange('houseNo', e.target.value)}
          />
        </div>

        {/* Street */}
        <div className="form-group">
          <label style={labelStyle} htmlFor="addr-street">Street</label>
          <input
            id="addr-street"
            type="text"
            className="login-input"
            style={inputStyle}
            placeholder="Enter street"
            value={formData?.street || ''}
            onChange={(e) => onChange('street', e.target.value)}
          />
        </div>

        {/* City */}
        <div className="form-group">
          <label style={labelStyle} htmlFor="addr-city">City</label>
          <input
            id="addr-city"
            type="text"
            className="login-input"
            style={inputStyle}
            placeholder="Enter city"
            value={formData?.city || ''}
            onChange={(e) => onChange('city', e.target.value)}
          />
        </div>

        {/* State */}
        <div className="form-group">
          <label style={labelStyle} htmlFor="addr-state">State</label>
          <input
            id="addr-state"
            type="text"
            className="login-input"
            style={inputStyle}
            placeholder="Enter state"
            value={formData?.state || ''}
            onChange={(e) => onChange('state', e.target.value)}
          />
        </div>

        {/* Country */}
        <div className="form-group">
          <label style={labelStyle} htmlFor="addr-country">Country</label>
          <input
            id="addr-country"
            type="text"
            className="login-input"
            style={inputStyle}
            placeholder="Enter country"
            value={formData?.country || ''}
            onChange={(e) => onChange('country', e.target.value)}
          />
        </div>

        {/* Pin Code */}
        <div className="form-group">
          <label style={labelStyle} htmlFor="addr-pincode">Pincode</label>
          <input
            id="addr-pincode"
            type="text"
            className="login-input"
            style={inputStyle}
            placeholder="Enter pin code"
            value={formData?.pincode || ''}
            onChange={(e) => onChange('pincode', e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}

export default AdditionalDetailsCard;
