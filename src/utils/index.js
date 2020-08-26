const fs = require('fs');
const path = require('path');
const handlebars = require('handlebars');

module.exports = {
  template: (data, _template) => {
    const template = handlebars.compile(
      fs.readFileSync(`${path.resolve('view')}/${_template}.html`).toString()
    );

    return template(data);
  },
};
