export const generateOrderConfirmationEmail = (userName, orderId, totalAmount) => {
  return `
  <div style="font-family: 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: auto; padding: 24px; background-color: #f9f9f9; border: 1px solid #e0e0e0; border-radius: 8px;">
    <div style="text-align: center;">
      <h2 style="color: #1890ff; margin-bottom: 4px;">📦 HolaPhone</h2>
      <h3 style="color: #52c41a; margin-top: 0;">Cảm ơn bạn đã đặt hàng!</h3>
    </div>

    <p>Xin chào <strong>${userName}</strong>,</p>
    
    <p>Chúng tôi đã nhận được đơn hàng của bạn.</p>
    
    <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
      <tr>
        <td style="padding: 8px 0;">🧾 <strong>Mã đơn hàng:</strong></td>
        <td style="padding: 8px 0;">${orderId}</td>
      </tr>
      <tr>
        <td style="padding: 8px 0;">💰 <strong>Tổng tiền:</strong></td>
        <td style="padding: 8px 0; color: #fa541c;"><strong>${totalAmount.toLocaleString()} VND</strong></td>
      </tr>
    </table>

    <p>Đơn hàng của bạn đang được xử lý và sẽ sớm được giao đến bạn.</p>

    <div style="margin-top: 24px; text-align: center;">
      <a href="https://holaphone.vn" style="display: inline-block; padding: 10px 20px; background-color: #1890ff; color: white; text-decoration: none; border-radius: 4px;">Xem đơn hàng</a>
    </div>

    <hr style="margin: 32px 0; border: none; border-top: 1px solid #ddd;" />

    <p style="font-size: 14px; color: #888888; text-align: center;">
      Nếu bạn có bất kỳ thắc mắc nào, vui lòng liên hệ với chúng tôi tại <a href="mailto:support@holaphone.vn">support@holaphone.vn</a>.
      <br />
      Cảm ơn bạn đã mua sắm tại <strong>HolaPhone</strong> 💙
    </p>
  </div>
  `;
};
export const generateOrderStatusEmail = (name, orderId, status) => `
  <div style="font-family: Arial, sans-serif; color: #333;">
    <h2 style="color: #1677ff;">📦 Đơn hàng của bạn đã cập nhật trạng thái</h2>
    <p>Xin chào <strong>${name}</strong>,</p>
    <p>Đơn hàng <strong>#${orderId}</strong> của bạn hiện có trạng thái:</p>
    <p><strong style="color: green;">${status.toUpperCase()}</strong></p>
    <hr />
    <p style="font-size: 14px; color: #888;">Cảm ơn bạn đã mua sắm tại HolaPhone!</p>
  </div>
`;
