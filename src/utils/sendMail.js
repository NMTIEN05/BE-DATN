import nodemailer from "nodemailer";
import { EMAIL_PASSWORD, EMAIL_USERNAME } from "../configs/enviroments.js";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: EMAIL_USERNAME,
    pass: EMAIL_PASSWORD,
  },
});

// ✅ CHUẨN: nhận options.text và options.html
const sendEmail = async (email, subject, options = {}) => {
  const { text, html } = options;

  const mailOptions = {
    from: `"Website" <${EMAIL_USERNAME}>`,
    to: email,
    subject,
    text: text || "Email này yêu cầu trình duyệt hỗ trợ HTML.",
    html: html || text,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    throw new Error("Error sending email: " + error.message);
  }
};

export default sendEmail;
