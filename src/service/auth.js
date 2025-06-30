// modules/auth/auth.service.js
import sendEmail from "../utils/sendMail.js";
import {
 generatePasswordResetSuccessEmail,
 generateResetPasswordEmail,
} from "./auth.view";
export const sendResetPasswordEmail = async (
 email,
 resetLink,
 expiresIn = "15 phút"
) => {
 const subject = "Đặt lại mật khẩu cho tài khoản của bạn";
 const html = generateResetPasswordEmail(resetLink, expiresIn);
 await sendEmail(email, subject, { html });
};
export const sendPasswordResetSuccessEmail = async (email) => {
 const subject = "Mật khẩu đã được đặt lại";
 const html = generatePasswordResetSuccessEmail();
 await sendEmail(email, subject, { html });
};
