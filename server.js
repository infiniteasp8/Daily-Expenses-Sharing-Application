const express = require("express");
const connectDB = require("./config/db");
const transaction = require('./routes/transaction');
const user = require('./routes/user');
require('dotenv').config();
connectDB();
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());
const PORT = process.env.PORT || 5000;
const errorHandler = require('./middlewares/errorHandler');
app.use("/api", user);
app.use("/api", transaction);


app.get("/", (req, res) => {
  res.send("Daily Expenses Sharing Application API");
});

const server = app.listen(
  PORT,
  console.log(`Server running on port ${PORT}`)
);

process.on("unhandledRejection", (err, promise) => {
  console.log(`Error: ${err.message}`);
  server.close(() => process.exit(1));
});

app.use(errorHandler);

module.exports = app;