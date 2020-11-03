const express = require('express');

const Client = require('../schema/Client');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

router.use(authMiddleware);

router.get('/list', async (req, res) => {
  try {
    const tenant = Client.byTenant(req.userId)
    const client = await tenant.find();
    if (!client) {
      return res.status(400).send({
        error: 'Ocorreu algum problema ao tentar recuperar seus dados',
      });
    }
    return res.send([...client]);
  } catch (error) {
    return res.status(400).send({
      error: 'Não conseguimos recuperar os seus dados pessoais.',
    });
  }
});

router.post('/add', async (req, res) => {
  const { email } = req.body;

  try {
    const tenant = Client.byTenant(req.userId)
    const findClient = await tenant.findOne({email});
    
    if (findClient) { 
      return res.status(400).send({
        message: 'Esse cliente já foi cadastrado',
      });
    }
 
    const client = await Client.create({ ...req.body, tenantId: req.userId });
    
    return res.send({
      client,
      success: true,
      message: 'Legal! Seu cliente foi adicionado com sucesso.',
    });
  } catch (error) {
    return res.status(400).send({
      message: 'Não conseguimos adicionar novo cliente.',
      errors: error,
    });
  }
});

module.exports = (app) => app.use('/client', router);
