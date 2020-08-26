const express = require('express');
const bcrypt = require('bcryptjs');
const mailer = require('../config/nodemailer');
const utils = require('../utils/index');
const User = require('../schema/User');

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

router.post('/register', async (req, res) => {
  const { email } = req.body;

  try {
    if (await User.findOne({ email })) {
      return res.status(400).send({ error: 'Ops! e-mail já cadastrado' });
    }

    const user = await User.create(req.body);
    user.password = undefined;

    return res.send({
      user,
    });
  } catch (error) {
    return res.status(400).send({ error: 'Ops! Erro ao cadastrar seu e-mail' });
  }
});

router.post('/authenticate', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(400).send({ error: 'Senha ou e-mail inválido' });
    }

    if (!(await bcrypt.compare(password, user.password))) {
      return res.status(400).send({ error: 'Senha ou e-mail inválido' });
    }

    user.password = undefined;

    return res.send({ user });
  } catch (error) {
    return res.status(400).send({ error: 'Ops! Erro ao cadastrar seu e-mail' });
  }
});

module.exports = (app) => app.use('/auth', router);
