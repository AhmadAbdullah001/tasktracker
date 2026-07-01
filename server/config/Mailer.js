const nodemailer = require("nodemailer");
const dns = require("dns");

const SMTP_HOST = process.env.SMTP_HOST || "smtp.gmail.com";
const SMTP_PORT = Number(process.env.SMTP_PORT) || 587;
const SMTP_SECURE = SMTP_PORT === 465;

const getIPv4SocketOptions = (options, callback) => {
  dns.resolve4(SMTP_HOST, (error, addresses) => {
    if (error) {
      return callback(error);
    }

    return callback(null, {
      host: addresses[0],
      port: SMTP_PORT,
      servername: SMTP_HOST,
      tls: {
        servername: SMTP_HOST,
      },
    });
  });
};

const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: SMTP_PORT,
  secure: SMTP_SECURE,
  requireTLS: !SMTP_SECURE,
  connectionTimeout: 15000,
  greetingTimeout: 15000,
  socketTimeout: 20000,
  getSocket: getIPv4SocketOptions,
  tls: {
    servername: SMTP_HOST,
  },
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

module.exports = transporter;
