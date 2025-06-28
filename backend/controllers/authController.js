const User = require("../models/userModel");
const bcrypt = require("bcryptjs");

const jwt = require("jsonwebtoken");

const loginUser = async (req, res) => {
  try {
    const { email, password, captchaInput, captchaServer } = req.body;

    if (captchaInput !== captchaServer) {
      return res.status(400).json({ message: "Invalid captcha" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // ✅ Check account status
    if (user.status !== "accepted") {
      return res.status(403).json({
        message:
          "Your account is not approved. Please contact the administrator.",
      });
    }

    const token = jwt.sign(
      {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        centerId: user.centerId,
        designation: user.designation,
        status: user.status,
        role: "user",
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 1000, // 1 hour
    });

    res.status(200).json({
      message: "Login successful",
      user: { email: user.email, fullName: user.fullName },
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

module.exports = { loginUser };
