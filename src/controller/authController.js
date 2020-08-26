const express = require('express');
const mailer = require('../config/nodemailer');
const handlebars = require('handlebars');
const fs = require('fs');
const path = require('path');
const utils = require('../utils/index');
const router = express.Router();

router.get('/', (req, res) => {
  const htmlToSend = utils.template({ name: '::Tosi::' }, 'confirm_password');

  mailer.sendMail(
    {
      to: 'Tosi <tosi.paulo@gmail.com>',
      from: 'tosi.paulo@gmail.com',
      subject: '🚀 testando utils 🚀',
      html: htmlToSend,
    },
    (err) => console.log(err)
  );
});

module.exports = (app) => app.use('/auth', router);
