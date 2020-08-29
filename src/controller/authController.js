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

    const userReq = req.body;
    const hashConfirm = utils.generateToken({ email }, process.env.HASH_SECRET);

    userReq.passwordConfirmToken = hashConfirm;
    const user = await User.create(userReq);
    user.password = undefined;
    user.passwordConfirmToken = undefined;

    const htmlToSend = utils.template(
      { token: userReq.passwordConfirmToken },
      'confirm_password'
    );
    mailer.sendMail(
      {
        to: 'Tosi <tosi.paulo@gmail.com>',
        from: 'tosi.paulo@gmail.com',
        subject: '🚀 testando utils 🚀',
        html: htmlToSend,
      },
      (err) => console.log(err)
    );

    return res.send({
      message:
        'Legal! Falta apenas confirmar o e-mail que acabamos de enviar para você.',
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

router.get('/confirm/:token', (req, res) => {
  const token = req.params.token;

  try {
    utils.verifyToken(token, process.env.HASH_SECRET, async (err, decoded) => {
      if (err) {
        return res.status(401).send({ error: 'Ops, link inválido' });
      }

      const { email } = decoded;
      const user = await User.findOne({ email });

      if (!user) {
        return res.status(400).send({
          error: 'Ocorreu algum problema! Tente novamente mais tarde.',
        });
      }

      const userUpdate = await User.findByIdAndUpdate(user.id, {
        $set: { isConfirm: true },
      });

      if (userUpdate) {
        return res.send({
          message: 'Obrigado por confirma seu cadastro!',
        });
      }
    });
  } catch (error) {
    return res
      .status(400)
      .send({ error: 'Ops! Erro ao confirmar seu cadastro' });
  }
});

module.exports = (app) => app.use('/auth', router);
