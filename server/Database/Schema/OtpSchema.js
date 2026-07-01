const mongoose = require('mongoose');

const OtpSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    purpose: {
      type: String,
      required: true,
      enum: ['signup', 'login', 'resend', 'forgot-password'],
      default: 'signup',
      index: true,
    },
    code: {
      type: String,
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

OtpSchema.index({ email: 1, purpose: 1 });
OtpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('Otp', OtpSchema);