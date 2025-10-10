// Payment configuration loaded from environment variables
export const paymentConfig = {
  bank: {
    name: process.env.BANK_NAME || 'TMCP Phương Đông (OCB)',
    accountNumber: process.env.BANK_ACCOUNT_NUMBER || '0004100026206005',
    accountHolder: process.env.BANK_ACCOUNT_HOLDER || 'Nguyễn Phương Nam'
  },
  momo: {
    phone: process.env.MOMO_PHONE || '0339830128',
    accountHolder: process.env.MOMO_ACCOUNT_HOLDER || 'Nguyễn Phương Nam'
  }
};

// Payment methods configuration
export const paymentMethods = [
  {
    value: 'bank_transfer',
    label: '🏦 Chuyển khoản ngân hàng',
    instructions: {
      title: 'Thông tin chuyển khoản ngân hàng',
      details: [
        `Ngân hàng: ${paymentConfig.bank.name}`,
        `Số tài khoản: ${paymentConfig.bank.accountNumber}`,
        `Chủ tài khoản: ${paymentConfig.bank.accountHolder}`,
        'Nội dung: DK [Tên sự kiện] - [Họ tên]'
      ]
    }
  },
  {
    value: 'momo',
    label: '📱 MoMo',
    instructions: {
      title: 'Thông tin chuyển MoMo',
      details: [
        `Số điện thoại: ${paymentConfig.momo.phone}`,
        `Chủ tài khoản: ${paymentConfig.momo.accountHolder}`,
        'Nội dung: DK [Tên sự kiện] - [Họ tên]'
      ]
    }
  }
];

// Helper function to generate payment instructions for a specific event
export function generatePaymentInstructions(eventTitle: string, participantName: string, paymentMethod: string) {
  const method = paymentMethods.find(m => m.value === paymentMethod);
  if (!method) return null;

  const content = `DK ${eventTitle.substring(0, 30)} - ${participantName}`;
  
  return {
    ...method.instructions,
    details: method.instructions.details.map(detail => 
      detail.includes('Nội dung:') ? `Nội dung: ${content}` : detail
    )
  };
}
