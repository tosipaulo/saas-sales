const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp.umbler.com',
  port: 587,
  auth: {
    user: process.env.MAILER_USER,
    pass: process.env.MAILER_PASS,
  },
});

module.exports = transporter;
