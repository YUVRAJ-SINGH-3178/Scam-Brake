export const CHECKOUT_CATALOG = {
  gift_cards: {
    name: 'Apex Digital Voucher Multi-Pack ($500 x 3)',
    category: 'Stored Value Digital Cards',
    amount: 1500,
  },
  camera: {
    name: 'Sony Alpha 7R V Full-Frame Camera Kit',
    category: 'Photography Equipment',
    amount: 3899,
  },
  tokens: {
    name: 'YubiKey 5C NFC Enterprise Bundle (10 Units)',
    category: 'Hardware Security Keys',
    amount: 700,
  },
} as const;

export type CheckoutSku = keyof typeof CHECKOUT_CATALOG;
