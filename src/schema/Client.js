const mongoose = require('mongoose');
const montoTenant = require('mongo-tenant');

const ClientSchema = new mongoose.Schema({
  name: {
    type: String,
    require: true,
  },
  email: {
    type: String,
    require: true,
    lowercase: true,
    unique: false
  },
  birthday: {
    type: String,
    require: false,
  },
  skin: {
    type: {
      type: String,
    },
    base: {
      type: String,
    },
    line: {
      type: String,
    },
  },
  fragrance: [
    {
      name: {
        type: String,
      },
    },
  ],
  dates: [
    {
      data: {
        type: String,
      },
      reason: {
        type: String,
      },
    },
  ],
  createAt: {
    type: Date,
    default: Date.now,
  },
  owner: {
    type: mongoose.Types.ObjectId,
    ref: 'User',
    require: true
  }
});

ClientSchema.plugin(montoTenant);

const Client = mongoose.model('Client', ClientSchema);

module.exports = Client;
