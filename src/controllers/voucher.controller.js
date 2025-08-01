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
    if (!deleted) {
      return res.status(404).json({ message: "Voucher không tồn tại" });
    }
    res.json({ message: "Xoá thành công" });
  } catch (err) {
    next(err);
  }
};

// ✅ Áp dụng voucher
export const applyVoucher = async (req, res, next) => {
  try {
    const { code, total } = req.body;

    if (!code || !total) {
      return res.status(400).json({ message: "Thiếu mã voucher hoặc tổng đơn hàng" });
    }

    const normalizedCode = code.trim().toUpperCase();
    const now = new Date();

    const voucher = await Voucher.findOne({ code: normalizedCode });

    if (!voucher) {
      return res.status(404).json({ message: "Mã không tồn tại" });
    }

    if (voucher.usedCount >= voucher.usageLimit) {
      return res.status(400).json({ message: "Mã đã hết lượt dùng" });
    }

    if (voucher.isActive === false) {
      return res.status(400).json({ message: "Mã đã bị vô hiệu hoá" });
    }

    if (now < voucher.startDate || now > voucher.endDate) {
      return res.status(400).json({ message: "Mã không còn hiệu lực" });
    }

    if (total < voucher.minOrderValue) {
      return res.status(400).json({
        message: `Đơn hàng phải từ ${voucher.minOrderValue.toLocaleString("vi-VN")} VNĐ`,
      });
    }

    let discount = 0;

    if (voucher.discountType === "percentage") {
      discount = (voucher.discountValue / 100) * total;
      if (voucher.maxDiscount) {
        discount = Math.min(discount, voucher.maxDiscount);
      }
    } else if (voucher.discountType === "fixed") {
      discount = voucher.discountValue;
    }

    const finalTotal = Math.max(total - discount, 0);

    res.json({
      valid: true,
      discount,
      finalTotal,
      voucher: {
        code: voucher.code,
        discountType: voucher.discountType,
        discountValue: voucher.discountValue,
        maxDiscount: voucher.maxDiscount,
        minOrderValue: voucher.minOrderValue,
        endDate: voucher.endDate,
        usageLimit: voucher.usageLimit,
        usedCount: voucher.usedCount,
        description: voucher.description || "",
      },
      message: `Áp dụng mã thành công, giảm ${discount.toLocaleString("vi-VN")} VNĐ`,
    });
  } catch (err) {
    console.error("❌ Lỗi áp dụng voucher:", err);
    next(err);
  }
};
