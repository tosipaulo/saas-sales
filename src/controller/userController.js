const express = require('express');
const User = require('../schema/User');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

router.use(authMiddleware);

router.get('/', async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).send({
        error: 'Ocorreu algum problema ao tentar recuperar seus dados',
      });
    }

    return res.send({ user });
  } catch (error) {
    return res.status(400).send({
      error: 'Não conseguimos recuperar os seus dados pessoais.',
    });
  }
});

module.exports = (app) => app.use('/user', router);
