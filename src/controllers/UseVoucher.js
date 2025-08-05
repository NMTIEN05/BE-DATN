import UserVoucher from '../model/UseVoucher.js';
import Voucher from '../model/Voucher.js';

export const claimVoucher = async (req, res) => {
  try {
    const userId = req.user.id;
    const { voucherId } = req.body;
console.log("🔍 req.user:", req.user); // 👈 kiểm tra có undefined không

    const existed = await UserVoucher.findOne({ userId, voucherId });
    if (existed) {
      return res.status(400).json({ message: 'Bạn đã lưu mã này rồi.' });
    }

    const voucher = await Voucher.findById(voucherId);
    if (!voucher || !voucher.isActive) {
      return res.status(404).json({ message: 'Mã không tồn tại hoặc đã bị vô hiệu hóa.' });
    }

    const now = new Date();
    if (now < voucher.startDate || now > voucher.endDate) {
      return res.status(400).json({ message: 'Mã không còn hiệu lực.' });
    }

    const newClaim = await UserVoucher.create({ userId, voucherId });
    res.json({ success: true, data: newClaim });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getMyVouchers = async (req, res) => {
  try {
    const userId = req.user.id;
    const data = await UserVoucher.find({ userId }).populate('voucherId');
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }

};

