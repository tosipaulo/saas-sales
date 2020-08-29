const fs = require('fs');
const path = require('path');
const handlebars = require('handlebars');
const jwt = require('jsonwebtoken');

module.exports = {
  template: (data, _template) => {
    const template = handlebars.compile(
      fs.readFileSync(`${path.resolve('view')}/${_template}.html`).toString()
    );

    return template(data);
  },

  generateToken: (params = {}, expiresIn = '50000ms') => {
    return jwt.sign(params, process.env.AUTH_SECRET, {
      algorithm: 'HS256',
      expiresIn,
    });
  }, //86400

  verifyToken: (token, callback) => {
    jwt.verify(token, process.env.AUTH_SECRET, (err, decoded) => {
      callback(err, decoded);
    });
  },
};
