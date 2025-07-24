import Voucher from "../model/voucher.js";

export const createVoucher = async (req, res, next) => {
  try {
    const voucher = await Voucher.create(req.body);
    res.status(201).json(voucher);
  } catch (err) {
    next(err);
  }
};

export const getAllVouchers = async (req, res, next) => {
  try {
    const vouchers = await Voucher.find();
    res.json(vouchers);
  } catch (err) {
    next(err);
  }
};

export const deleteVoucher = async (req, res, next) => {
  try {
    const deleted = await Voucher.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Voucher không tồn tại" });
    res.json({ message: "Xoá thành công" });
  } catch (err) {
    next(err);
  }
};

// Áp dụng voucher
export const applyVoucher = async (req, res, next) => {
  try {
    const { code, total } = req.body;
    const now = new Date();
    const voucher = await Voucher.findOne({ code });

    if (!voucher) return res.status(404).json({ message: "Mã không tồn tại" });
    if (voucher.usedCount >= voucher.usageLimit)
      return res.status(400).json({ message: "Mã đã hết lượt dùng" });
    if (now < voucher.startDate || now > voucher.endDate)
      return res.status(400).json({ message: "Mã không còn hiệu lực" });
    if (total < voucher.minOrderValue)
      return res.status(400).json({ message: `Đơn hàng phải từ ${voucher.minOrderValue} VNĐ` });

    let discount = 0;
    if (voucher.discountType === "percentage") {
      discount = (voucher.discountValue / 100) * total;
      if (voucher.maxDiscount) discount = Math.min(discount, voucher.maxDiscount);
    } else if (voucher.discountType === "fixed") {
      discount = voucher.discountValue;
    }

    res.json({
      valid: true,
      discount,
      finalTotal: total - discount,
      message: `Áp dụng mã thành công, giảm ${discount} VNĐ`,
    });
  } catch (err) {
    next(err);
  }
};