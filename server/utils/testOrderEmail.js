const { sendCustomerOrderEmail } = require('./email');

const mockOrder = {
  orderNumber: 'QSM-20261028-9182',
  createdAt: new Date(),
  customer: {
    name: 'Pooja Sharma',
    email: 'contactquesmdesign@gmail.com',
    phone: '+91 98765 43210',
    address: 'Flat 402, Lotus Residency, MG Road',
    city: 'Bhubaneswar',
    state: 'Odisha',
    pincode: '751001'
  },
  items: [
    {
      name: 'Gulabi Meenakari Silk Thread Bangles',
      variant: 'Size 2.6 • Set of 4',
      quantity: 1,
      total: 1299
    },
    {
      name: 'Zardosi Pearl Embroidered Hairband',
      variant: 'Antique Gold',
      quantity: 2,
      total: 1598
    }
  ],
  subtotal: 2897,
  shippingFee: 0,
  discount: 289,
  giftWrap: true,
  giftWrapFee: 49,
  giftMessage: 'Happy Birthday, Dear Sister! May you shine bright always.',
  couponApplied: { code: 'WELCOME10', discountAmount: 289 },
  totalAmount: 2657,
  paymentMethod: 'cod',
  paymentStatus: 'pending'
};

async function test() {
  console.log('Testing sendCustomerOrderEmail with mock order...');
  await sendCustomerOrderEmail(mockOrder);
  console.log('Test completed successfully!');
  process.exit(0);
}

test();

