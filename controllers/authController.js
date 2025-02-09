const User = require("../models/user");
const Blog = require("../models/blog");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.signup = async (req, res) => {
  const { firstname, lastname, username, email, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      firstname,
      lastname,
      username,
      email,
      password: hashedPassword,
    });
    await user.save();
    res.redirect("/api/auth/signin");
  } catch (err) {
    // Check if user already exists
    const emailExists = await User.findOne({ email: req.body.email });
    if (emailExists) return res.json("Email already exists");

    if (!firstname || !lastname || !username || !email || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    if (err.code === 11000) {
      return res.status(400).json({
        success: false,
        message:
          "A record with this details already exists.",
      });
    }
  }
};

exports.signin = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });

  res.cookie("access_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Strict",
  });

  try {
    // Fetch all blog posts from the database
    const blog = await Blog.find();

    res.render("index", { blog });
  } catch (error) {
    logger.error(error);
    res.status(500).send("Internal Server Error");
  }
};
