export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', 'https://atmas-tenis.vercel.app');
  const { MP_ACCESS_TOKEN } = process.env;
  if (!MP_ACCESS_TOKEN) return res.status(500).json({ error: 'MP no configurado' });

  const { payment_id } = req.query;
  if (!payment_id) return res.status(400).json({ error: 'Falta payment_id' });

  try {
    const mpRes = await fetch(`https://api.mercadopago.com/v1/payments/${payment_id}`, {
      headers: { 'Authorization': `Bearer ${MP_ACCESS_TOKEN}` }
    });
    const data = await mpRes.json();
    return res.json({ estado: data.status, monto: data.transaction_amount, reservaId: data.external_reference });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
