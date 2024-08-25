import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const transporter = nodemailer.createTransport({
  service: "Gmail", // or another email provider
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendVerificationEmail = (email: string, code: any) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Email Verification",
    text: `Your verification code is ${code}`,
  };

  return transporter.sendMail(mailOptions);
};

export const sendWelcomeEmail = (email: any) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Welcome!",
    text: "Welcome to our platform!",
  };

  return transporter.sendMail(mailOptions);
};

export const sendPasswordResetEmail = (email: any, resetToken: any) => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Password Reset Request",
    text: `You are receiving this email because you (or someone else) have requested a password reset for your account.\n\n
    Please click on the following link, or paste it into your browser to complete the process:\n\n
    ${resetUrl}\n\n
    If you did not request this, please ignore this email and your password will remain unchanged.\n`,
    html: `<p>You are receiving this email because you (or someone else) have requested a password reset for your account.</p>
    <p>Please click on the following link, or paste it into your browser to complete the process:</p>
    <a href="${resetUrl}">${resetUrl}</a>
    <p>If you did not request this, please ignore this email and your password will remain unchanged.</p>`,
  };

  return transporter.sendMail(mailOptions);
};
