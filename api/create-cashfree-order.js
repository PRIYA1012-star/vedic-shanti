export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { amount, customerName, customerEmail, customerPhone, serviceName } = req.body || {};

    if (!process.env.CASHFREE_APP_ID || !process.env.CASHFREE_SECRET_KEY) {
      return res.status(500).json({ error: 'Missing CASHFREE_APP_ID or CASHFREE_SECRET_KEY in Vercel Environment Variables.' });
    }

    const orderId = `VS_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const cleanPhone = (customerPhone || '9999999999').replace(/\D/g, '').slice(-10) || '9999999999';
    const originUrl = req.headers.origin || 'https://vedic-shanti-lovat.vercel.app';

    // Use 'https://api.cashfree.com/pg/orders' for Production (Live) keys
    // Change to 'https://sandbox.cashfree.com/pg/orders' only if using Test (Sandbox) keys
    const response = await fetch('https://api.cashfree.com/pg/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-version': '2023-08-01',
        'x-client-id': process.env.CASHFREE_APP_ID,
        'x-client-secret': process.env.CASHFREE_SECRET_KEY,
      },
      body: JSON.stringify({
        order_id: orderId,
        order_amount: Number(amount),
        order_currency: 'INR',
        customer_details: {
          customer_id: `cust_${Date.now()}`,
          customer_name: customerName || 'Seeker',
          customer_email: customerEmail || 'vedicshanti.seva@gmail.com',
          customer_phone: cleanPhone,
        },
        order_meta: {
          return_url: `${originUrl}/?order_id={order_id}`,
        },
        order_note: serviceName || 'Vedic Shanti Sankalp Seva',
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ error: data.message || 'Cashfree order creation failed', details: data });
    }

    return res.status(200).json({
      payment_session_id: data.payment_session_id,
      order_id: data.order_id,
    });
  } catch (err) {
    return res.status(500).json({ error: 'Internal Server Error', message: err.message });
  }
}
