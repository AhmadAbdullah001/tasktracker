const nodemailer = require('nodemailer');
const dns = require('dns');

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  connectionTimeout: 5000,
  greetingTimeout: 5000,
  socketTimeout: 5000,
  tls: {
    servername: 'smtp.gmail.com',
  },
  auth: {
    user: process.env.EMAIL_USER || '',
    pass: process.env.EMAIL_PASS || '',
  },
  requireTLS: true,
  dns: {
    lookup(hostname, options, callback) {
      return dns.lookup(hostname, { ...options, family: 4 }, callback);
    },
  },
  logger: false,
  debug: false,
});

module.exports = transporter;
