const admin = require('firebase-admin');
const nodemailer = require('nodemailer');

// El valor guardado en Vercel puede venir con el JSON duplicado y/o con
// saltos de linea reales donde deberian ir \n escapados (de pegarlo mal
// en el formulario). En vez de intentar parsear el JSON completo (fragil
// ante esos daños), se extraen directamente los 3 campos que
// admin.credential.cert() realmente necesita con patrones de texto, que
// toman la primera coincidencia y listo.
function parseServiceAccount(raw) {
  var projectId = (/"project_id"\s*:\s*"([^"]*)"/.exec(raw) || [])[1];
  var clientEmail = (/"client_email"\s*:\s*"([^"]*)"/.exec(raw) || [])[1];
  var pkMatch = /"private_key"\s*:\s*"(-----BEGIN PRIVATE KEY-----[\s\S]*?-----END PRIVATE KEY-----)[^"]*"/.exec(raw);

  if (!projectId || !clientEmail || !pkMatch) {
    var err = new Error('No se pudo interpretar FIREBASE_SERVICE_ACCOUNT');
    err.diagnostico = {
      largo: raw.length,
      tieneProjectId: !!projectId,
      tieneClientEmail: !!clientEmail,
      tienePrivateKey: !!pkMatch
    };
    throw err;
  }

  var privateKey = pkMatch[1].replace(/\\n/g, '\n');
  if (privateKey.indexOf('\n') === -1) {
    privateKey = privateKey
      .replace('-----BEGIN PRIVATE KEY-----', '-----BEGIN PRIVATE KEY-----\n')
      .replace('-----END PRIVATE KEY-----', '\n-----END PRIVATE KEY-----') + '\n';
  }
  if (privateKey.slice(-1) !== '\n') privateKey += '\n';

  return { type: 'service_account', project_id: projectId, client_email: clientEmail, private_key: privateKey };
}

var adminInicializado = false;
function initAdmin() {
  if (adminInicializado) return;
  admin.initializeApp({
    credential: admin.credential.cert(parseServiceAccount(process.env.FIREBASE_SERVICE_ACCOUNT))
  });
  adminInicializado = true;
}

// Igual que FIREBASE_SERVICE_ACCOUNT, estos valores pueden haber quedado
// duplicados o con espacios/saltos de linea de mas por los reintentos al
// guardarlos en Vercel. Las contraseñas de aplicacion de Google son
// siempre 16 letras minusculas: se toma solo ese primer tramo.
function limpiarSmtpPass(raw) {
  var sinEspacios = (raw || '').replace(/\s+/g, '');
  var m = /[a-z]{16}/.exec(sinEspacios);
  return m ? m[0] : sinEspacios.slice(0, 16);
}
function limpiarSmtpUser(raw) {
  var m = /[^\s,"'{}]+@[^\s,"'{}]+\.[^\s,"'{}]+/.exec((raw || ''));
  return m ? m[0].replace(/[",}]+$/, '') : (raw || '').trim();
}

const SMTP_USER_LIMPIO = limpiarSmtpUser(process.env.SMTP_USER);

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: SMTP_USER_LIMPIO,
    pass: limpiarSmtpPass(process.env.SMTP_PASS)
  }
});

const APP_URL = 'https://atmas-tenis.vercel.app/';

function plantilla(cuerpo, link, textoBoton) {
  return (
    '<div style="font-family:-apple-system,Helvetica,Arial,sans-serif;max-width:480px;margin:0 auto;padding:24px 20px">' +
      '<div style="text-align:center;margin-bottom:20px">' +
        '<div style="font-size:24px;font-weight:900;font-style:italic;color:#2f6b1a">ATMAS</div>' +
        '<div style="font-size:12px;color:#6b7280">Academia de Tenis AT+ &middot; Club Las Avestruces</div>' +
      '</div>' +
      '<p style="font-size:15px;color:#1d2433">' + cuerpo + '</p>' +
      '<div style="text-align:center;margin:28px 0">' +
        '<a href="' + link + '" style="background:#c4f000;color:#121712;font-weight:800;font-size:15px;text-decoration:none;padding:14px 28px;border-radius:30px;display:inline-block">' + textoBoton + '</a>' +
      '</div>' +
      '<p style="font-size:12px;color:#9ca3af">Si no solicitaste esto, puedes ignorar este correo.</p>' +
      '<p style="font-size:12px;color:#9ca3af">&mdash; Equipo ATMAS</p>' +
    '</div>'
  );
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  try {
    const { tipo, email, nombre } = req.body || {};
    if (!tipo || !email || typeof email !== 'string') {
      res.status(400).json({ error: 'Faltan datos' });
      return;
    }

    initAdmin();

    const actionCodeSettings = { url: APP_URL, handleCodeInApp: false };
    let link, asunto, html;

    if (tipo === 'verificacion') {
      link = await admin.auth().generateEmailVerificationLink(email, actionCodeSettings);
      asunto = 'Verifica tu cuenta de ATMAS';
      html = plantilla(
        'Hola ' + (nombre || '') + ', para activar tu cuenta de ATMAS y poder iniciar sesión, confirma tu correo:',
        link,
        'Verificar mi cuenta'
      );
    } else if (tipo === 'reset') {
      link = await admin.auth().generatePasswordResetLink(email, actionCodeSettings);
      asunto = 'Recupera tu contraseña de ATMAS';
      html = plantilla(
        'Recibimos una solicitud para restablecer la contraseña de tu cuenta de ATMAS (' + email + '). Crea una nueva:',
        link,
        'Crear nueva contraseña'
      );
    } else {
      res.status(400).json({ error: 'Tipo inválido' });
      return;
    }

    await transporter.sendMail({
      from: '"ATMAS" <' + SMTP_USER_LIMPIO + '>',
      to: email,
      subject: asunto,
      html: html
    });

    res.status(200).json({ ok: true });
  } catch (e) {
    console.error('enviar-correo error:', e);
    res.status(500).json({
      error: e.message,
      diagnostico: e.diagnostico || {
        largoUserCrudo: (process.env.SMTP_USER || '').length,
        largoPassCrudo: (process.env.SMTP_PASS || '').length,
        largoUserLimpio: SMTP_USER_LIMPIO.length,
        largoPassLimpio: limpiarSmtpPass(process.env.SMTP_PASS).length
      }
    });
  }
};
