import React from 'react';

interface PaymentStatusBadgeProps {
  status: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function PaymentStatusBadge({ status, size = 'md' }: PaymentStatusBadgeProps) {
  const statusConfig = {
    pending_verification: { 
      color: '#f59e0b', 
      text: 'Chờ xác thực', 
      icon: '⏳',
      bgColor: '#fef3c7',
      borderColor: '#f59e0b'
    },
    paid: { 
      color: '#22c55e', 
      text: 'Đã thanh toán', 
      icon: '✅',
      bgColor: '#dcfce7',
      borderColor: '#22c55e'
    },
    failed: { 
      color: '#ef4444', 
      text: 'Thanh toán thất bại', 
      icon: '❌',
      bgColor: '#fee2e2',
      borderColor: '#ef4444'
    },
    pending: { 
      color: '#6b7280', 
      text: 'Chờ thanh toán', 
      icon: '⏸️',
      bgColor: '#f3f4f6',
      borderColor: '#6b7280'
    }
  };
  
  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
  
  const sizeStyles = {
    sm: {
      padding: '2px 8px',
      fontSize: '11px',
      gap: '4px'
    },
    md: {
      padding: '4px 12px',
      fontSize: '12px',
      gap: '6px'
    },
    lg: {
      padding: '6px 16px',
      fontSize: '14px',
      gap: '8px'
    }
  };

  const currentSizeStyle = sizeStyles[size];
  
  return (
    <span style={{
      background: config.bgColor,
      color: config.color,
      border: `1px solid ${config.borderColor}`,
      padding: currentSizeStyle.padding,
      borderRadius: '20px',
      fontSize: currentSizeStyle.fontSize,
      fontWeight: '600',
      display: 'inline-flex',
      alignItems: 'center',
      gap: currentSizeStyle.gap,
      whiteSpace: 'nowrap'
    }}>
      <span>{config.icon}</span>
      <span>{config.text}</span>
    </span>
  );
}
