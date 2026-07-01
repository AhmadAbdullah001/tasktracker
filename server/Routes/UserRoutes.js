const express = require("express");
const crypto = require("crypto");
const router = express.Router();
const User = require("../Database/Schema/UserSchema");
const Otp = require("../Database/Schema/OtpSchema");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const SECRET_KEY = process.env.SECRET_KEY;
const transporter = require("../config/Mailer");

const normalizeEmail = (email) => (email || "").toLowerCase().trim();
const generateOtpCode = () => Math.floor(100000 + Math.random() * 900000).toString();
const OTP_TTL_MS = 5 * 60 * 1000;

const sendOtpEmail = async (email, otp) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Your OTP Code",
      text: `Your OTP code is ${otp}`,
    });
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("OTP email failed, continuing in development:", error.message);
      return;
    }
    throw error;
  }
};

const storeOtpForEmail = async (email, purpose, otp) => {
  await Otp.deleteMany({ email, purpose });
  await Otp.create({
    email,
    purpose,
    code: otp.toString(),
    expiresAt: new Date(Date.now() + OTP_TTL_MS),
  });
};

const verifyOtpForEmail = async (email, purpose, otp) => {
  const storedOtp = await Otp.findOne({
    email,
    purpose,
    code: otp.toString(),
    expiresAt: { $gt: new Date() },
  });

  return Boolean(storedOtp);
};

const consumeOtpForEmail = async (email, purpose, otp) => {
  const isValid = await verifyOtpForEmail(email, purpose, otp);
  if (!isValid) return false;

  await Otp.deleteMany({ email, purpose, code: otp.toString() });
  return true;
};

router.post("/signup", async (req, res) => {
  const { name, email, password, otp } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }
  if (!otp) {
    return res.status(400).json({ message: "OTP is required" });
  }

  const normalizedEmail = normalizeEmail(email);
  const existingUser = await User.findOne({ email: normalizedEmail });
  if (existingUser) return res.status(400).json({ message: "User already exists" });

  const isOtpValid = await consumeOtpForEmail(normalizedEmail, "signup", otp);
  if (!isOtpValid) return res.status(400).json({ message: "Invalid or expired OTP" });

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const newUser = await User.create({
    name: name.trim(),
    email: normalizedEmail,
    password: hashedPassword,
  });

  const token = jwt.sign({ id: newUser._id }, SECRET_KEY, { expiresIn: "7d" });
  res.status(201).json({ message: "User created successfully", token });
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  const normalizedEmail = normalizeEmail(email);
  const user = await User.findOne({ email: normalizedEmail });
  if (!user) return res.status(400).json({ message: "Invalid credentials" });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

  const token = jwt.sign({ id: user._id }, SECRET_KEY, { expiresIn: "7d" });
  res.status(200).json({ message: "Login successful", token });
});

router.post("/generate-otp", async (req, res) => {
  const { email, purpose = "signup" } = req.body;
  if (!email) return res.status(400).json({ message: "Email is required" });

  const normalizedEmail = normalizeEmail(email);
  if (purpose === "login") {
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) return res.status(400).json({ message: "User not found" });
  }

  const otp = generateOtpCode();
  await storeOtpForEmail(normalizedEmail, purpose, otp);
  await sendOtpEmail(normalizedEmail, otp);

  const response = { message: "OTP sent successfully" };
  if (process.env.NODE_ENV !== "production") {
    response.otp = otp;
  }
  res.status(200).json(response);
});

router.post("/verify-otp", async (req, res) => {
  const { email, otp, purpose = "signup" } = req.body;
  if (!email || !otp) {
    return res.status(400).json({ message: "Email and OTP are required" });
  }

  const normalizedEmail = normalizeEmail(email);
  const isOtpValid = await verifyOtpForEmail(normalizedEmail, purpose, otp);
  if (!isOtpValid) return res.status(400).json({ message: "Invalid or expired OTP" });

  res.status(200).json({ message: "OTP verified successfully" });
});

router.post("/resend-OTP", async (req, res) => {
  const { email, purpose = "signup" } = req.body;
  if (!email) return res.status(400).json({ message: "Email is required" });

  const normalizedEmail = normalizeEmail(email);
  if (purpose === "login") {
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) return res.status(400).json({ message: "User not found" });
  }

  const otp = generateOtpCode();
  await storeOtpForEmail(normalizedEmail, purpose, otp);
  await sendOtpEmail(normalizedEmail, otp);

  const response = { message: "OTP sent successfully" };
  if (process.env.NODE_ENV !== "production") {
    response.otp = otp;
  }
  res.status(200).json(response);
});

router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    const normalizedEmail = normalizeEmail(email);
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

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: normalizedEmail,
      subject: "Reset your password",
      text: `Use the following link to reset your password: ${resetURL}`,
      html: `<p>Use the following link to reset your password:</p><p><a href="${resetURL}">${resetURL}</a></p>`,
    });

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