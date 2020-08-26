const nodemailer = require('nodemailer');
const path = require('path');

const transporter = nodemailer.createTransport({
  host: 'smtp.mailtrap.io',
  port: 2525,
  auth: {
    user: 'e8ad5bc25b9581',
    pass: 'd1f079afa7b9a9',
  },
});

module.exports = transporter;
