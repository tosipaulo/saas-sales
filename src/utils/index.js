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

  generateToken: (params = {}, secret) => {
    return jwt.sign(params, secret, {
      algorithm: 'HS256',
      expiresIn: '50000ms',
    });
  }, //86400

  verifyToken: (token, secret, callback) => {
    jwt.verify(token, secret, (err, decoded) => {
      callback(err, decoded);
    });
  },
};
