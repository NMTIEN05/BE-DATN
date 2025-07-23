import qs from 'qs';
import crypto from 'crypto';
import moment from 'moment';
import Order from '../model/Order.js'; // Import mô hình Order

function sortObject(obj) {
  const sorted = {};
  const keys = Object.keys(obj).sort();
  for (const key of keys) {
    sorted[key] = String(obj[key]); // ✅ Ép mọi giá trị về string
  }
  return sorted;
}


// Config cố định (vì bạn không dùng .env)
const tmnCode = 'N36CAYQ6';
const secretKey = '0YFFZDTD723OSUD2NX80MZ7XWVILNA0K';
const vnp_Url = 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html';
const returnUrl = 'http://localhost:5173/payment-result';

export const createPaymentUrl = (req, res) => {
  const { amount, orderId } = req.query;
  const ipAddr = req.ip;
  const bankCode = req.query.bankCode || '';
  const createDate = moment().format('YYYYMMDDHHmmss');
  const orderInfo = 'Thanh_toan_don_hang';
  const locale = req.query.language || 'vn';
  const currCode = 'VND';

  const vnp_Params = {
    vnp_Version: '2.1.0',
    vnp_Command: 'pay',
    vnp_TmnCode: tmnCode,
    vnp_Locale: locale,
    vnp_CurrCode: currCode,
    vnp_TxnRef: orderId,
    vnp_OrderInfo: orderInfo,
    vnp_OrderType: 'billpayment',
    vnp_Amount: amount * 100,
    vnp_ReturnUrl: 'http://localhost:8888/api/payment/check_payment',
    vnp_IpAddr: ipAddr,
    vnp_CreateDate: createDate,
  };

  if (bankCode !== '') {
    vnp_Params['vnp_BankCode'] = bankCode;
  }

  const sortedParams = sortObject(vnp_Params);
  const signData = qs.stringify(sortedParams);
  const hmac = crypto.createHmac('sha512', secretKey);
  const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');
  vnp_Params['vnp_SecureHash'] = signed;

  const paymentUrl = vnp_Url + '?' + qs.stringify(vnp_Params);
  res.json({ paymentUrl });
};

export const handleVnpayReturn = async (req, res) => {
  const query = { ...req.query }; // Clone để tránh mutate req.query
  const vnp_SecureHash = query.vnp_SecureHash;

  // ❌ Xoá các trường không cần ký
  delete query.vnp_SecureHash;
  delete query.vnp_SecureHashType;

  // ✅ Sắp xếp và tạo lại chuỗi dữ liệu
  const sortedQuery = sortObject(query);
  const signData = qs.stringify(sortedQuery, { encode: false });

  // ✅ Tạo chữ ký phía server
  const hmac = crypto.createHmac("sha512", secretKey);
  const serverSignature = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");

  // 🐞 LOG CHI TIẾT
  console.log("======= 🔁 VNPay IPN Callback =======");
  console.log("📦 Full query:", req.query);
  console.log("🧾 Sorted data:", sortedQuery);
  console.log("🧾 signData:", signData);
  console.log("🔐 Client Hash:", vnp_SecureHash);
  console.log("🔐 Server Hash:", serverSignature);

  // ✅ So sánh chữ ký
  if (vnp_SecureHash === serverSignature) {
    const orderId = query.vnp_TxnRef;

    try {
      const order = await Order.findById(orderId);
      if (!order) {
        console.warn("⚠️ Không tìm thấy đơn hàng:", orderId);
        return res.redirect(`${returnUrl}?status=not_found`);
      }

      if (query.vnp_ResponseCode === "00") {
        order.paymentStatus = "paid";
        order.status = "processing";
        await order.save();

        console.log("✅ Cập nhật đơn hàng thành công:", orderId);
        return res.redirect(`${returnUrl}?status=success&orderId=${order._id}`);
      } else {
        console.warn("❌ Thanh toán thất bại:", query.vnp_ResponseCode);
        return res.redirect(`${returnUrl}?status=failed`);
      }
    } catch (err) {
      console.error("❌ Lỗi xử lý đơn hàng:", err);
      return res.redirect(`${returnUrl}?status=error`);
    }
  } else {
    console.warn("❌ Chữ ký không hợp lệ!");
    return res.redirect(`${returnUrl}?status=invalid_signature`);
  }
};

export const handleVnpayIPN = async (req, res) => {
  const query = { ...req.query };
  const vnp_SecureHash = query.vnp_SecureHash;

  // ❌ Xoá các trường không tham gia ký
  delete query.vnp_SecureHash;
  delete query.vnp_SecureHashType;

  // ✅ Sắp xếp tham số theo thứ tự alphabet
  const sortedQuery = sortObject(query);

  // ✅ Tạo chuỗi `signData`
  const signData = qs.stringify(sortedQuery, { encode: false });

  // ✅ Tạo hash từ signData với secretKey
  const hmac = crypto.createHmac('sha512', secretKey);
  const checkSum = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

  // 🐞 Log chi tiết để debug
  console.log("======= 🔁 VNPay IPN Callback =======");
  console.log("📦 Full query:", req.query);
  console.log("🧾 Sorted data:", sortedQuery);
  console.log("🧾 signData:", signData);
  console.log("🔐 Client Hash:", vnp_SecureHash);
  console.log("🔐 Server Hash:", checkSum);

  // ✅ So sánh chữ ký
  if (checkSum !== vnp_SecureHash) {
    console.warn("❌ Chữ ký không hợp lệ!");
    return res.status(400).json({ RspCode: '97', Message: 'Sai chữ ký' });
  }

  // ✅ Nếu chữ ký hợp lệ và thanh toán thành công
  if (query.vnp_ResponseCode === '00') {
    const orderId = query.vnp_TxnRef;

    try {
      await Order.findByIdAndUpdate(orderId, {
        paymentStatus: 'paid',
        status: 'processing',
      });

      console.log("✅ Đã cập nhật đơn hàng:", orderId);
      return res.status(200).json({ RspCode: '00', Message: 'Xác nhận thanh toán thành công' });
    } catch (err) {
      console.error("❌ Lỗi cập nhật đơn hàng:", err);
      return res.status(500).json({ RspCode: '99', Message: 'Lỗi hệ thống' });
    }
  }

  console.warn("❌ Thanh toán thất bại hoặc bị huỷ:", query.vnp_ResponseCode);
  return res.status(400).json({ RspCode: '01', Message: 'Thanh toán thất bại hoặc bị huỷ' });
};

