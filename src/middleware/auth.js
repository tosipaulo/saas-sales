const utils = require('../utils/index');

module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).send({
      message: 'Acho algo aconteceu com seu login.',
    });
  }

  const parts = authHeader.split(' ');

  if (!parts.length == 2) {
    return res.status(401).send({
      message: 'Acho algo aconteceu com seu login.',
    });
  } 

  const [scheme, token] = parts;

  if (!/^Bearer$/i.test(scheme)) {
    return res.status(401).send({
      message: 'Ops! Acho algo aconteceu com sua autenticação.',
    });
  }

  utils.verifyToken(token, (err, decoded) => {
    if (err) {
      return res
        .status(401)
        .send({ message: 'Ops! Acho algo aconteceu com sua autenticação.' });
    }
    req.userId = decoded.id;

    return next();
  });
};
