const express = require("express");
const { signup, signin } = require("../controllers/authController");
const {validateUserMiddleware, validateNewUserMiddleware} = require("../validator/authValidator");
const router = express.Router();

router.get("/signup", (req, res) => {
  res.render("signup");
});

router.get("/signin", (req, res) => {
  res.render("signin");
});

router.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.redirect("/author/:authorId");
    }
    res.clearCookie("connect.sid"); // Clear the session cookie
    return res.redirect("/api/auth/signin");
  });
});

router.post("/signup",validateNewUserMiddleware, signup);
router.post("/signin", validateUserMiddleware, signin);

module.exports = router;
