export const generateResetPasswordEmail = (resetLink, expiresIn) => {
  return /*html*/ `
  <!DOCTYPE html>
  <html lang="vi">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Đặt lại mật khẩu</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          background-color: #f4f4f4;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 600px;
          margin: 20px auto;
          background-color: #ffffff;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        .header {
          background-color: #007bff;
          color: #ffffff;
          padding: 20px;
          text-align: center;
        }
        .header img {
          max-width: 150px;
        }
        .content {
          padding: 30px;
          color: #333333;
        }
        .content h2 {
          font-size: 24px;
          margin-top: 0;
        }
        .content p {
          font-size: 16px;
          line-height: 1.6;
        }
        .button {
          display: inline-block;
          padding: 12px 24px;
          background-color: #007bff;
          color: #ffffff;
          text-decoration: none;
          border-radius: 4px;
          font-size: 16px;
          margin: 20px 0;
        }
        .button:hover {
          background-color: #0056b3;
        }
        .footer {
          background-color: #f8f9fa;
          padding: 20px;
          text-align: center;
          font-size: 14px;
          color: #666666;
        }
        .footer a {
          color: #007bff;
          text-decoration: none;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <img src="https://via.placeholder.com/150x50?text=Your+Logo" alt="Logo" />
          <h1>Đặt lại mật khẩu</h1>
        </div>
        <div class="content">
          <h2>Xin chào,</h2>
          <p>Bạn đã yêu cầu đặt lại mật khẩu cho tài khoản của mình. Vui lòng nhấn vào nút dưới đây để tiếp tục:</p>
          <a href="${resetLink}" class="button">Đặt lại mật khẩu</a>
          <p>
            Link này sẽ hết hạn sau <strong>${expiresIn}</strong>. Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.
          </p>
          <p>Trân trọng,<br />Đội ngũ hỗ trợ</p>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} CodeFarm. All rights reserved.</p>
          <p>
            <a href="https://codefarm.edu.vn">Trang chủ</a> |
            <a href="mailto:support@codefarm.edu.vn">Liên hệ</a> |
            <a href="https://codefarm.edu.vn/privacy">Chính sách bảo mật</a>
          </p>
          <p>Tòa 7F, Kim Hoàng, Vân Canh, Hoài Đức, Hà Nội</p>
        </div>
      </div>
    </body>
  </html>
  `;
};
export const generatePasswordResetSuccessEmail = () => {
  return /*html*/ `
  <!DOCTYPE html>
  <html lang="vi">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Đặt lại mật khẩu thành công</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          background-color: #f4f4f4;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 600px;
          margin: 20px auto;
          background-color: #ffffff;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        .header {
          background-color: #28a745;
          color: #ffffff;
          padding: 20px;
          text-align: center;
        }
        .header img {
          max-width: 150px;
        }
        .content {
          padding: 30px;
          color: #333333;
        }
        .content h2 {
          font-size: 24px;
          margin-top: 0;
        }
        .content p {
          font-size: 16px;
          line-height: 1.6;
        }
        .footer {
          background-color: #f8f9fa;
          padding: 20px;
          text-align: center;
          font-size: 14px;
          color: #666666;
        }
        .footer a {
          color: #007bff;
          text-decoration: none;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <img src="https://via.placeholder.com/150x50?text=Your+Logo" alt="Logo" />
          <h1>Mật khẩu đã được đặt lại</h1>
        </div>
        <div class="content">
          <h2>Xin chào,</h2>
          <p>Mật khẩu của bạn đã được đặt lại thành công. Bạn có thể đăng nhập với mật khẩu mới.</p>
          <p>Nếu bạn không thực hiện hành động này, vui lòng liên hệ với chúng tôi ngay:</p>
          <p>
            <a href="mailto:support@codefarm.edu.vn">support@codefarm.edu.vn</a>
          </p>
          <p>Trân trọng,<br />Đội ngũ hỗ trợ</p>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} CodeFarm. All rights reserved.</p>
          <p>
            <a href="https://codefarm.edu.vn">Trang chủ</a> |
            <a href="mailto:support@codefarm.edu.vn">Liên hệ</a> |
            <a href="https://codefarm.edu.vn/privacy">Chính sách bảo mật</a>
          </p>
          <p>Tòa 7F, Kim Hoàng, Vân Canh, Hoài Đức, Hà Nội</p>
        </div>
      </div>
    </body>
  </html>
  `;
};
export const generateVerifyEmailView = (verifyLink) => /*html*/ `
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Xác thực tài khoản</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      background-color: #f4f4f4;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 20px auto;
      background-color: #ffffff;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
    .header {
      background-color: #17a2b8;
      color: #ffffff;
      padding: 20px;
      text-align: center;
    }
    .content {
      padding: 30px;
      color: #333333;
    }
    .button {
      display: inline-block;
      padding: 12px 24px;
      background-color: #17a2b8;
      color: #ffffff;
      text-decoration: none;
      border-radius: 4px;
      font-size: 16px;
      margin: 20px 0;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Xác thực tài khoản</h1>
    </div>
    <div class="content">
      <p>Chào bạn,</p>
      <p>Bạn đã đăng ký tài khoản. Nhấn nút bên dưới để xác thực:</p>
      <a href="${verifyLink}" class="button">Xác thực tài khoản</a>
      <p>Nếu bạn không đăng ký, vui lòng bỏ qua email này.</p>
    </div>
  </div>
</body>
</html>
`;
// views/auth.js
export const generateEmailVerificationCodeView = (code) => /*html*/ `
  <div style="font-family: Arial; padding: 20px;">
    <h2>Xác thực tài khoản</h2>
    <p>Mã xác thực của bạn là:</p>
    <h1 style="color: #007bff;">${code}</h1>
    <p>Mã sẽ hết hạn sau 15 phút.</p>
  </div>
`;

