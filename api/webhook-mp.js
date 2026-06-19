export default async function handler(req, res) {
  // Webhook de MercadoPago — solo acuse de recibo
  // La verificación real ocurre en el frontend via /api/verificar-pago
  res.status(200).json({ ok: true });
}
