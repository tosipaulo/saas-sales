const express = require('express');
const bcrypt = require('bcryptjs');

const mailer = require('../config/nodemailer');
const utils = require('../utils/index');
const User = require('../schema/User');

const router = express.Router();

router.post('/register', async (req, res) => {
  const { email } = req.body;

  try {
    if (await User.findOne({ email })) {
      return res.status(400).send({ error: 'Ops! e-mail já cadastrado' });
    }

    const userReq = req.body;
    const hashConfirm = utils.generateToken({ email });

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
    return res.send({ user, token: utils.generateToken({ email }, 86400) });
  } catch (error) {
    return res.status(400).send({ error: 'Ops! Erro ao cadastrar seu e-mail' });
  }
});

router.get('/confirm/:token', (req, res) => {
  const token = req.params.token;

  try {
    utils.verifyToken(token, async (err, decoded) => {
      if (err && err.name == 'TokenExpiredError') {
        return res.status(401).send({ error: 'Ops, link inválido' });
      }

      if (err && err.name == 'JsonWebTokenError') {
        return res
          .status(401)
          .send({ error: 'Ops, link quebrado', redirect: true });
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
