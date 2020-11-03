const express = require('express');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const mailer = require('../config/nodemailer');
const utils = require('../utils/index');
const User = require('../schema/User');

const router = express.Router();

router.post('/register', async (req, res) => {
  const { email, name } = req.body;

  try {
    if (await User.findOne({ email })) {
      return res.status(400).send({ message: 'Ops! e-mail já cadastrado' });
    }

    const tokenJWT = utils.generateTokenJWT({ email });

    const user = await User.create(req.body);
    user.password = undefined;
    user.passwordConfirmToken = undefined;

    /* const htmlToSend = utils.template(
      {
        token: tokenJWT,
        name,
        base_url: `${process.env.BASE_URL}/auth/confirm/`,
      },
      'confirm_password'
    );
    mailer.sendMail(
      {
        to: email,
        from: 'APP - Consultora Online <ola@consultoraonline.app.br>',
        subject: `🥰 Olá, ${name} ! Bem vind...`,
        html: htmlToSend,
      },
      (err) => console.log(err)
    ); */

    return res.send({
      message:
        'Legal! Falta apenas confirmar o e-mail que acabamos de enviar para você.',
        tokenJWT
    });
  } catch (error) {
    return res.status(400).send({ message: 'Ops! Erro ao cadastrar seu e-mail' });
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
    return res.send({ user, token: utils.generateTokenJWT({ email, id: user.id  }, 86400) });
  } catch (error) {
    return res.status(400).send({ error: 'Ops! Erro ao cadastrar seu e-mail' });
  }
});

router.get('/confirm/:token', (req, res) => {
  const token = req.params.token;

  try {
    utils.verifyToken(token, async (err, decoded) => {
      if (err && err.name == 'TokenExpiredError') {
        return res.status(401).send({ message: 'Ops, link inválido', error: err});
      }

      if (err && err.name == 'JsonWebTokenError') {
        return res
          .status(401)
          .send({ message: 'Ops, link quebrado', redirect: true });
      }

      const { email } = decoded;
      const user = await User.findOne({ email });

      if (!user) {
        return res.status(400).send({
          message: 'Ocorreu algum problema! Tente novamente mais tarde.',
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
      .send({ message: 'Ops! Erro ao confirmar seu cadastro' });
  }
});

router.post('/forgot_password', async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).send({ error: 'Usuário ou senha inválido' });
    }

    const token = crypto.randomBytes(20).toString('hex');

    const now = new Date();
    now.setHours(now.getHours() + 1);

    await User.findByIdAndUpdate(user.id, {
      $set: {
        passwordResetToken: token,
        passwordResetExpires: now,
      },
    });
    const htmlToSend = utils.template({ token }, 'forgot_password');

    mailer.sendMail(
      {
        to: 'tosi.paulo@gmail.com',
        from: ':: TOSI :: <tosi.paulo@gmail.com>',
        subject: '🚀 testando reset 🚀',
        html: htmlToSend,
      },
      (err) => {
        if (err) {
          return res
            .status(400)
            .send({ error: 'Não foi possível enviar recuperação por e-mail.' });
        }
      }
    );
    return res.send({
      message: 'Legal, agora falta confirmar um e-mail que acabamos de enviar!',
    });
  } catch (error) {
    return res.status(400).send({ error: 'Ops! Erro ao resetar sua senha' });
  }
});

router.post('/reset_password', async (req, res) => {
  const { email, token, password } = req.body;

  try {
    const user = await User.findOne({ email }).select(
      '+passwordResetToken passwordResetExpires'
    );

    if (!user) {
      return res.status(400).send({ error: 'Ops! Usuário ou senha inválida' });
    }

    if (token !== user.passwordResetToken) {
      return res.status(400).send({
        error: 'Ops! Token experidado, por favor solicite outro reset de senha',
      });
    }

    const now = new Date();

    if (now > user.passwordResetExpires) {
      return res.status(400).send({
        error: 'Ops! Link experidado, por favor solicite outro reset de senha',
      });
    }

    user.password = password;

    await user.save();

    res.send({ message: 'Legal! Senha cadastrado com sucesso.' });
  } catch (err) {
    return res.status(400).send({
      error: 'Ops! Aconteceu algum problema ao registrar sua nova senha.',
    });
  }
});

module.exports = (app) => app.use('/auth', router);
