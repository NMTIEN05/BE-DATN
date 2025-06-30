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
// utils/emailTemplates.js
export const generatePasswordChangedEmail = () => {
  return `
     <div style="font-family: Arial, sans-serif; color: #333;">
      <h2 style="color: #1890ff;">🔐 HolaPhone - Thay đổi mật khẩu thành công</h2>
      <p>Xin chào,</p>
      <p>Mật khẩu tài khoản của bạn vừa được thay đổi thành công.</p>
      <p>Nếu bạn KHÔNG thực hiện thao tác này, vui lòng liên hệ với đội ngũ hỗ trợ của <strong>HolaPhone</strong> ngay lập tức để đảm bảo an toàn cho tài khoản của bạn.</p>
      <hr />
      <p style="font-size: 14px; color: #888;">Cảm ơn bạn đã tin tưởng sử dụng dịch vụ của HolaPhone!</p>
    </div>
  `;
};

export default sendEmail;
