import React from 'react';

interface PaymentActionButtonsProps {
  registrationId: string;
  paymentStatus: string;
  processing: string | null;
  onUpdatePaymentStatus: (id: string, status: 'paid' | 'failed') => Promise<void>;
  size?: 'sm' | 'md' | 'lg';
}

export default function PaymentActionButtons({ 
  registrationId, 
  paymentStatus, 
  processing, 
  onUpdatePaymentStatus,
  size = 'md'
}: PaymentActionButtonsProps) {
  if (paymentStatus !== 'pending_verification') {
    return null;
  }

  const sizeStyles = {
    sm: {
      padding: '4px 8px',
      fontSize: '11px',
      gap: '4px'
    },
    md: {
      padding: '6px 12px',
      fontSize: '12px',
      gap: '6px'
    },
    lg: {
      padding: '8px 16px',
      fontSize: '14px',
      gap: '8px'
    }
  };

  const currentSizeStyle = sizeStyles[size];
  const isLoading = processing === registrationId;

  return (
    <div style={{ 
      display: 'flex', 
      gap: '6px', 
      justifyContent: 'center',
      flexWrap: 'wrap'
    }}>
      <button
        onClick={() => onUpdatePaymentStatus(registrationId, 'paid')}
        disabled={isLoading}
        style={{
          background: '#22c55e',
          color: 'white',
          border: 'none',
          padding: currentSizeStyle.padding,
          borderRadius: '6px',
          cursor: isLoading ? 'not-allowed' : 'pointer',
          fontSize: currentSizeStyle.fontSize,
          fontWeight: '600',
          opacity: isLoading ? 0.6 : 1,
          display: 'flex',
          alignItems: 'center',
          gap: currentSizeStyle.gap,
          transition: 'all 0.2s ease'
        }}
        onMouseEnter={(e) => {
          if (!isLoading) {
            e.currentTarget.style.background = '#16a34a';
            e.currentTarget.style.transform = 'translateY(-1px)';
          }
        }}
        onMouseLeave={(e) => {
          if (!isLoading) {
            e.currentTarget.style.background = '#22c55e';
            e.currentTarget.style.transform = 'translateY(0)';
          }
        }}
      >
        {isLoading ? (
          <i className="fas fa-spinner fa-spin"></i>
        ) : (
          <>
            <i className="fas fa-check"></i>
            <span>Xác nhận</span>
          </>
        )}
      </button>
      <button
        onClick={() => onUpdatePaymentStatus(registrationId, 'failed')}
        disabled={isLoading}
        style={{
          background: '#ef4444',
          color: 'white',
          border: 'none',
          padding: currentSizeStyle.padding,
          borderRadius: '6px',
          cursor: isLoading ? 'not-allowed' : 'pointer',
          fontSize: currentSizeStyle.fontSize,
          fontWeight: '600',
          opacity: isLoading ? 0.6 : 1,
          display: 'flex',
          alignItems: 'center',
          gap: currentSizeStyle.gap,
          transition: 'all 0.2s ease'
        }}
        onMouseEnter={(e) => {
          if (!isLoading) {
            e.currentTarget.style.background = '#dc2626';
            e.currentTarget.style.transform = 'translateY(-1px)';
          }
        }}
        onMouseLeave={(e) => {
          if (!isLoading) {
            e.currentTarget.style.background = '#ef4444';
            e.currentTarget.style.transform = 'translateY(0)';
          }
        }}
      >
        {isLoading ? (
          <i className="fas fa-spinner fa-spin"></i>
        ) : (
          <>
            <i className="fas fa-times"></i>
            <span>Từ chối</span>
          </>
        )}
      </button>
    </div>
  );
}
