const express = require("express");
const {
  createUser,
  getUser,
  updateUser,
  sendinvite
} = require("../controllers/user");
const authMiddleware = require("../middlewares/authMiddleware");
const router = express.Router();

router.route("/users").post(createUser);
router.route("/users/login").post(getUser);

// Protected routes
router.use(authMiddleware);
router.route("/users").put(updateUser);

//this is for sending invite to the user (OPTIONAL)
// router.route("/sendmail").post(sendinvite);

module.exports = router;