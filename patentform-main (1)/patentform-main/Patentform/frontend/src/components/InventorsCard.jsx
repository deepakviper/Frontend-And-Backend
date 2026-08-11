import React, { useRef } from 'react';
import { Users, Plus } from 'lucide-react';

function InventorsCard({ formData, onInventorChange, onAddInventor, onRemoveInventor }) {
  const listEndRef = useRef(null);
  const inventors = formData?.inventors || ['', '', ''];

  const handleAdd = () => {
    if (inventors.length >= 8) {
      alert("You can add up to 8 inventors.");
      return;
    }
    onAddInventor();
    setTimeout(() => {
      listEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 100);
  };

  return (
    <div className="card inventors-card" style={{ padding: '24px', backgroundColor: '#FFF', borderRadius: '12px', border: '1px solid #E5E7EB', display: 'flex', flexDirection: 'column', minHeight: '340px', maxHeight: '420px', overflow: 'hidden' }}>
      <div className="card-header" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', borderBottom: '1px solid #F3F4F6', paddingBottom: '12px', flexShrink: 0 }}>
        <Users className="card-header-icon" style={{ color: '#0052cc' }} size={20} />
        <span className="card-header-title" style={{ fontWeight: '600', fontSize: '1.1rem', color: '#1F2937' }}>Inventors</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1, overflowY: 'auto', paddingRight: '4px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {inventors.map((name, index) => {
            const isAdditional = index >= 3;
            return (
              <div 
                key={index} 
                className="form-group"
                style={{ 
                  animation: isAdditional ? 'slideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1)' : 'none',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label className="form-label" htmlFor={`member-name-${index}`} style={{ fontSize: '12px', color: '#4B5563', fontWeight: '600' }}>
                    Inventor #{index + 1} {index === 0 ? '' : isAdditional ? '' : '(Optional)'}
                  </label>
                  {isAdditional && (
                    <button
                      type="button"
                      onClick={() => onRemoveInventor(index)}
                      style={{
                        background: 'transparent',
                        color: '#EF4444',
                        border: 'none',
                        fontSize: '11px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        transition: 'background 0.2s'
                      }}
                    >
                      Remove
                    </button>
                  )}
                </div>
                <input
                  id={`member-name-${index}`}
                  type="text"
                  className="login-input"
                  style={{
                    background: '#F9FAFB',
                    border: '1px solid #D1D5DB',
                    color: '#1F2937',
                    paddingLeft: '12px',
                    paddingRight: '12px',
                    height: '36px',
                    fontSize: '13px',
                    borderRadius: '6px',
                    width: '100%'
                  }}
                  placeholder={`Enter inventor #${index + 1} name`}
                  value={name || ''}
                  onChange={(e) => onInventorChange(index, e.target.value)}
                />
              </div>
            );
          })}
          <div ref={listEndRef} />
        </div>

        {inventors.length < 8 && (
          <button
            type="button"
            onClick={handleAdd}
            style={{
              background: '#0052cc',
              color: '#FFF',
              border: 'none',
              padding: '10px 16px',
              borderRadius: '6px',
              fontSize: '13px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
              transition: 'background 0.2s',
              marginTop: '8px',
              width: '100%',
              flexShrink: 0
            }}
          >
            <Plus size={14} /> Add Inventor
          </button>
        )}
      </div>
    </div>
  );
}

export default InventorsCard;
