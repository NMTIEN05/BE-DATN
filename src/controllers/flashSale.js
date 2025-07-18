import FlashSale from '../model/flashSale.js';

/**
 * [POST] /api/flashsales
 * Tạo Flash Sale mới
 */
export const createFlashSale = async (req, res) => {
  try {
    const { product, discountPercent, startTime, endTime, limitQuantity } = req.body;

    const existed = await FlashSale.findOne({ product });
    if (existed) {
      return res.status(400).json({ message: 'Sản phẩm đã có flash sale' });
    }

    const flash = await FlashSale.create({
      product,
      discountPercent,
      startTime,
      endTime,
      limitQuantity,
    });

    res.status(201).json({ message: 'Tạo flash sale thành công', data: flash });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

/**
 * [GET] /api/flashsales/active
 * Lấy danh sách flash sale đang hoạt động
 */
export const getActiveFlashSales = async (req, res) => {
  try {
    const now = new Date();

    const flashSales = await FlashSale.find({
      isActive: true,
      startTime: { $lte: now },
      endTime: { $gte: now },
    }).populate('product');

    res.status(200).json(flashSales);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

/**
 * [GET] /api/flashsales
 * Lấy tất cả flash sale (admin xem)
 */
export const getAllFlashSales = async (req, res) => {
  try {
    const flashSales = await FlashSale.find().populate('product');
    res.status(200).json(flashSales);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

/**
 * [PUT] /api/flashsales/:id
 * Cập nhật flash sale
 */
export const updateFlashSale = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const flashSale = await FlashSale.findByIdAndUpdate(id, updateData, { new: true });
    if (!flashSale) {
      return res.status(404).json({ message: 'Không tìm thấy flash sale' });
    }

    res.json({ message: 'Cập nhật thành công', data: flashSale });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

/**
 * [DELETE] /api/flashsales/:id
 * Xoá flash sale
 */
export const deleteFlashSale = async (req, res) => {
  try {
    const { id } = req.params;
    const flashSale = await FlashSale.findByIdAndDelete(id);

    if (!flashSale) {
      return res.status(404).json({ message: 'Không tìm thấy flash sale' });
    }

    res.json({ message: 'Xoá flash sale thành công' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};
