const mongoose = require("mongoose");
mongoose.Promise = global.Promise;
mongoose.set("useCreateIndex", true);
mongoose.set("useFindAndModify", false);

const url = process.env.MONGOLAB_URL
  ? process.env.MONGOLAB_URL
  : "mongodb://localhost/saas-sales";
module.exports = mongoose.connect(url, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
