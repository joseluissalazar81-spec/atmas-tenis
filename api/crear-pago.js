export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', 'https://atmas-tenis.vercel.app');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { MP_ACCESS_TOKEN } = process.env;
  if (!MP_ACCESS_TOKEN) return res.status(500).json({ error: 'MP_ACCESS_TOKEN no configurado en Vercel' });

  try {
    const { titulo, monto, reservaId } = req.body;
    if (!monto || !reservaId) return res.status(400).json({ error: 'Faltan datos' });

    const mpRes = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${MP_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
        'X-Idempotency-Key': reservaId
      },
      body: JSON.stringify({
        items: [{ title: titulo || 'Reserva cancha ATMAS', quantity: 1, unit_price: Number(monto), currency_id: 'CLP' }],
        back_urls: {
          success: `https://atmas-tenis.vercel.app/?pago=ok&rid=${reservaId}`,
          failure: `https://atmas-tenis.vercel.app/?pago=error&rid=${reservaId}`,
          pending: `https://atmas-tenis.vercel.app/?pago=pendiente&rid=${reservaId}`
        },
        auto_return: 'approved',
        external_reference: reservaId,
        notification_url: `https://atmas-tenis.vercel.app/api/webhook-mp`
      })
    });

    if (!mpRes.ok) {
      const raw = await mpRes.text();
      let msg = raw;
      try { msg = JSON.parse(raw).message || raw; } catch (_) {}
      return res.status(500).json({ error: msg || `Error MercadoPago (HTTP ${mpRes.status})` });
    }
    const data = await mpRes.json();
    return res.json({ preference_id: data.id, init_point: data.init_point, sandbox_init_point: data.sandbox_init_point });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
