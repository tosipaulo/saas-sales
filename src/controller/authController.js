const express = require('express');
const bcrypt = require('bcryptjs');
const crypto = require('crypto-js');

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

    const userReq = req.body;
    userReq.passwordResetToken = crypto.AES.encrypt(
      email,
      process.env.HASH_SECRET
    ).toString();

    const user = await User.create(userReq);
    user.password = undefined;
    user.passwordResetToken = undefined;

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

router.get('/confirm/:token', async (req, res) => {
  const token = req.params.token;

  const bytes = crypto.AES.decrypt(token, process.env.HASH_SECRET);
  const originalText = bytes.toString(crypto.enc.Utf8);

  //const now = new Date();
  //console.log(now.getHours(), now.getDate());
  //now.setHours(now.getHours() + 1);
  //now.setDate(now.getDate() + 1);

  try {
    const user = await User.findOne({ email: originalText });

    if (!user) {
      return res
        .status(400)
        .send({ error: 'Ocorreu algum problema! Tente novamente mais tarde.' });
    }

    const userUpdate = await User.findByIdAndUpdate(user.id, {
      $set: { isConfirm: true },
    });

    if (userUpdate) {
      return res.send({
        message: 'Obrigado por confirma seu cadastro!',
      });
    }
  } catch (error) {
    return res
      .status(400)
      .send({ error: 'Ops! Erro ao confirmar seu cadastro' });
  }
});

module.exports = (app) => app.use('/auth', router);
