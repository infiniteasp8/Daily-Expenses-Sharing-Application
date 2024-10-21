const express = require("express");
const {
  createTransaction,
  getAllTransaction,
  getTransaction,
  getUserExpenses,
  getOverallExpenses,
  downloadBalanceSheet,
} = require("../controllers/transaction");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");
router.use(authMiddleware);
router.route("/transactions").post(createTransaction);
router.route("/expenses/:userEmailId").get(getUserExpenses);
router.route("/expenses/overall").get(getOverallExpenses);
router.route("/balance-sheet").get(downloadBalanceSheet);

module.exports = router;


// eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3MTYxNmVjNTYzNzFlNmU3MjgxZWJiZCIsImVtYWlsIjoidXNlcjFAZXhhbXBsZS5jb20iLCJpYXQiOjE3Mjk1MDEwNjIsImV4cCI6MTcyOTUwNDY2Mn0.Sg-8Agu0_nYidM1SAbba_x9HDE0wbR3m3QDXkCa9Ifo