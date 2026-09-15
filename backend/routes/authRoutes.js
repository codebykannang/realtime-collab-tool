const express = require("express");
const router = express.Router();
const { register, login, me, searchUsers } = require("../controllers/authController");
const { protect } = require("../middleware/auth");

router.post("/register", register);
router.post("/login", login);
router.get("/me", protect, me);
router.get("/users", protect, searchUsers);

module.exports = router;
