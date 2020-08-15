const port = process.env.PORT || 3000;

const bodyParser = require("body-parser");

const express = require("express");
const cors = require("cors");
const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());

require("../controller/index")(app);

app.listen(port, () => console.log(`🚀 Server running in port: ${port} 🚀`));
