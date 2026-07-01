const express = require("express");
const crypto = require("crypto");
const router = express.Router();
const User = require("../Database/Schema/UserSchema");
const Otp = require("../Database/Schema/OtpSchema");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const SECRET_KEY = process.env.SECRET_KEY;
const transporter = require("../config/Mailer");

const OTP_TTL_MS = 5 * 60 * 1000;

router.post("/signup", async (req, res) => {
  try {
    const { name, email, password, otp } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (!otp) {
      return res.status(400).json({ message: "OTP is required" });
    }

    const normalizedEmail = (email || "").toLowerCase().trim();
    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const validOtp = await Otp.findOne({
      email: normalizedEmail,
      purpose: "signup",
      code: otp.toString(),
      expiresAt: { $gt: new Date() },
    });

    if (!validOtp) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    await Otp.deleteMany({
      email: normalizedEmail,
      purpose: "signup",
      code: otp.toString(),
    });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
    });

    const token = jwt.sign({ id: newUser._id }, SECRET_KEY, { expiresIn: "7d" });
    return res.status(201).json({ message: "User created successfully", token });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const normalizedEmail = (email || "").toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user._id }, SECRET_KEY, { expiresIn: "7d" });
    return res.status(200).json({ message: "Login successful", token });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

router.post("/generate-otp", async (req, res) => {
  try {
    const { email, purpose = "signup" } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const normalizedEmail = (email || "").toLowerCase().trim();

    if (purpose === "login") {
      const user = await User.findOne({ email: normalizedEmail });
      if (!user) {
        return res.status(400).json({ message: "User not found" });
      }
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    await Otp.deleteMany({ email: normalizedEmail, purpose });
    await Otp.create({
      email: normalizedEmail,
      purpose,
      code: otp,
      expiresAt: new Date(Date.now() + OTP_TTL_MS),
    });

    try {
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: normalizedEmail,
        subject: "Your OTP Code",
        text: `Your OTP code is ${otp}`,
      });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }

    const response = { message: "OTP sent successfully" };
    if (process.env.NODE_ENV !== "production") {
      response.otp = otp;
    }

    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

router.post("/verify-otp", async (req, res) => {
  try {
    const { email, otp, purpose = "signup" } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP are required" });
    }

    const normalizedEmail = (email || "").toLowerCase().trim();
    const validOtp = await Otp.findOne({
      email: normalizedEmail,
      purpose,
      code: otp.toString(),
      expiresAt: { $gt: new Date() },
    });

    if (!validOtp) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    return res.status(200).json({ message: "OTP verified successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

router.post("/resend-OTP", async (req, res) => {
  try {
    const { email, purpose = "signup" } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const normalizedEmail = (email || "").toLowerCase().trim();

    if (purpose === "login") {
      const user = await User.findOne({ email: normalizedEmail });
      if (!user) {
        return res.status(400).json({ message: "User not found" });
      }
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    await Otp.deleteMany({ email: normalizedEmail, purpose });
    await Otp.create({
      email: normalizedEmail,
      purpose,
      code: otp,
      expiresAt: new Date(Date.now() + OTP_TTL_MS),
    });

    try {
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: normalizedEmail,
        subject: "Your OTP Code",
        text: `Your OTP code is ${otp}`,
      });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }

    const response = { message: "OTP sent successfully" };
    if (process.env.NODE_ENV !== "production") {
      response.otp = otp;
    }

    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    const normalizedEmail = (email || "").toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(200).json({
        success: true,
        message: "If an account exists, a reset link has been sent.",
      });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

    user.passwordResetToken = hashedToken;
    user.passwordResetExpires = Date.now() + 10 * 60 * 1000;
    await user.save();

    const resetURL = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      if (process.env.NODE_ENV !== "production") {
        return res.status(200).json({
          success: true,
          message: "Reset link generated successfully.",
          resetUrl: resetURL,
        });
      }
      return res.status(500).json({ success: false, message: "Email credentials are not configured" });
    }

    try {
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: normalizedEmail,
        subject: "Reset your password",
        text: `Use the following link to reset your password: ${resetURL}`,
        html: `<p>Use the following link to reset your password:</p><p><a href="${resetURL}">${resetURL}</a></p>`,
      });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }

    res.status(200).json({
      success: true,
      message: "If an account exists, a reset link has been sent.",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post("/reset-password", async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) {
      return res.status(400).json({ success: false, message: "Token and password are required" });
    }

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid or expired reset token" });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    res.status(200).json({ success: true, message: "Password updated successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;