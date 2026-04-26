import { useEffect } from 'react';
import { X } from 'lucide-react';

export default function Modal({ isOpen, onClose, title, children, maxWidth = '500px' }) {
  // Handle ESC key to close
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden'; // Prevent background scrolling
    }
    return () => {
      window.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      className="modal-overlay" 
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        animation: 'fadeIn 0.2s ease-out'
      }}
    >
      <div 
        className="modal-content glass-card"
        onClick={e => e.stopPropagation()} // Prevent clicks inside modal from closing it
        style={{
          width: '100%',
          maxWidth: maxWidth,
          backgroundColor: 'var(--bg-surface)',
          borderRadius: '24px', // Rounded corners rule
          boxShadow: '0 24px 48px rgba(0,0,0,0.1)', // Soft shadow
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '90vh',
          animation: 'scaleUp 0.2s ease-out'
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4" style={{ borderBottom: '1px solid var(--border-light)' }}>
          <h2 className="text-navy" style={{ fontSize: '1.25rem', margin: 0 }}>{title}</h2>
          <button 
            onClick={onClose}
            className="clickable text-secondary hover-bg flex items-center justify-center"
            style={{ 
              background: 'none', 
              border: 'none', 
              padding: '8px', 
              borderRadius: '50%',
              transition: 'background-color 0.2s'
            }}
          >
            <X size={20} />
          </button>
        </div>
        
        {/* Body */}
        <div style={{ overflowY: 'auto', padding: '24px' }}>
          {children}
        </div>
      </div>
    </div>
  );
}
