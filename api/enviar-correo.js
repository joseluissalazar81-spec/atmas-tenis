const admin = require('firebase-admin');
const nodemailer = require('nodemailer');

// Pegar JSON multilinea en algunos formularios de variables de entorno
// convierte los \n escapados dentro de los strings en saltos de linea
// reales, lo que rompe JSON.parse. Esto repara ese caso reescapando los
// saltos de linea que quedan DENTRO de un string, sin tocar el resto.
function repararJSON(raw) {
  var out = '';
  var dentroString = false;
  var escapando = false;
  for (var i = 0; i < raw.length; i++) {
    var ch = raw[i];
    if (dentroString) {
      if (escapando) {
        out += ch;
        escapando = false;
      } else if (ch === '\\') {
        out += ch;
        escapando = true;
      } else if (ch === '"') {
        out += ch;
        dentroString = false;
      } else if (ch === '\n') {
        out += '\\n';
      } else if (ch === '\r') {
        // omitir
      } else {
        out += ch;
      }
    } else {
      if (ch === '"') dentroString = true;
      out += ch;
    }
  }
  return out;
}

function diagnosticoError(raw, e) {
  var m = /position (\d+)/.exec(e.message || '');
  var pos = m ? parseInt(m[1], 10) : -1;
  var codigos = [];
  if (pos >= 0) {
    for (var i = Math.max(0, pos - 5); i < Math.min(raw.length, pos + 5); i++) {
      codigos.push(raw.charCodeAt(i));
    }
  }
  return { mensaje: e.message, largo: raw.length, posicion: pos, codigosAlrededor: codigos };
}

function parseServiceAccount(raw) {
  try {
    return JSON.parse(raw);
  } catch (e1) {
    try {
      return JSON.parse(repararJSON(raw));
    } catch (e2) {
      var err = new Error('No se pudo interpretar FIREBASE_SERVICE_ACCOUNT');
      err.diagnostico = diagnosticoError(raw, e1);
      throw err;
    }
  }
}

var adminInicializado = false;
function initAdmin() {
  if (adminInicializado) return;
  admin.initializeApp({
    credential: admin.credential.cert(parseServiceAccount(process.env.FIREBASE_SERVICE_ACCOUNT))
  });
  adminInicializado = true;
}

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
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
      from: '"ATMAS" <' + process.env.SMTP_USER + '>',
      to: email,
      subject: asunto,
      html: html
    });

    res.status(200).json({ ok: true });
  } catch (e) {
    console.error('enviar-correo error:', e);
    res.status(500).json({ error: e.message, diagnostico: e.diagnostico || null });
  }
};
