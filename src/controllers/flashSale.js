import mongoose from 'mongoose';
import FlashSale from '../model/flashSale.js';
import Product from '../model/Product.js';

// [POST] /api/flashsales
export const createFlashSale = async (req, res) => {
  try {
    const {
      title,
      products,
      discountPercent,
      startTime,
      endTime,
      limitQuantity
    } = req.body;

    console.log('📥 Body nhận được:', req.body);

    // Kiểm tra thiếu trường nào
    if (!title) console.warn('⚠️ Thiếu trường: title');
    if (!products || !Array.isArray(products)) console.warn('⚠️ products không hợp lệ');
    if (!discountPercent) console.warn('⚠️ Thiếu trường: discountPercent');
    if (!startTime) console.warn('⚠️ Thiếu trường: startTime');
    if (!endTime) console.warn('⚠️ Thiếu trường: endTime');
    if (limitQuantity === undefined) console.warn('⚠️ Thiếu trường: limitQuantity');

    // Bỏ comment để bật validate đầu vào
    if (!title || !Array.isArray(products) || products.length === 0 || !discountPercent || !startTime || !endTime || limitQuantity === undefined) {
      return res.status(400).json({ message: 'Thiếu thông tin bắt buộc hoặc định dạng sai' });
    }

    // Kiểm tra ObjectId hợp lệ
    const invalidIds = products.filter(id => !mongoose.Types.ObjectId.isValid(id));
    if (invalidIds.length > 0) {
      console.warn('⚠️ Các ID không hợp lệ:', invalidIds);
      return res.status(400).json({ message: 'Một số ID sản phẩm không hợp lệ', invalidIds });
    }

    // Kiểm tra sản phẩm có tồn tại không
    const existedProducts = await Product.find({ _id: { $in: products } });
    console.log('✅ Sản phẩm tìm thấy:', existedProducts.map(p => p._id.toString()));

    if (existedProducts.length !== products.length) {
      const existedIds = existedProducts.map(p => p._id.toString());
      const notFound = products.filter(id => !existedIds.includes(id));
      console.warn('❌ Một số sản phẩm không tồn tại:', notFound);
      return res.status(404).json({ message: 'Một số sản phẩm không tồn tại', notFound });
    }

    // Kiểm tra trùng flash sale thời gian
    const overlapped = await FlashSale.find({
      products: { $in: products },
      startTime: { $lte: endTime },
      endTime: { $gte: startTime },
      isActive: true,
    });

    if (overlapped.length > 0) {
      const conflictIds = overlapped.flatMap(fs => fs.products.map(id => id.toString()));
      console.warn('⚠️ Có sản phẩm đã nằm trong flash sale đang hoạt động:', conflictIds);
      return res.status(400).json({
        message: 'Một số sản phẩm đã có flash sale trong thời gian này',
        conflictProductIds: conflictIds,
      });
    }

    // Tạo mới flash sale
    const flashSale = await FlashSale.create({
      title,
      products,
      discountPercent,
      startTime,
      endTime,
      limitQuantity,
      isActive: true,
    });

    console.log('✅ Flash sale được tạo:', flashSale);
    res.status(201).json({ message: 'Tạo flash sale thành công', data: flashSale });
  } catch (error) {
    console.error('❌ Lỗi khi tạo flash sale:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// [GET] /api/flashsales
export const getAllFlashSales = async (req, res) => {
  try {
    const flashSales = await FlashSale.find().populate('products');
    res.json({ data: flashSales });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// [GET] /api/flashsales/:id
export const getFlashSaleById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ message: 'ID không hợp lệ' });

    const flashSale = await FlashSale.findById(id).populate('products');
    if (!flashSale) return res.status(404).json({ message: 'Không tìm thấy flash sale' });

    res.json({ data: flashSale });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// [PUT] /api/flashsales/:id
export const updateFlashSale = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ message: 'ID không hợp lệ' });

    const flashSale = await FlashSale.findByIdAndUpdate(id, updates, { new: true }).populate('products');
    if (!flashSale) return res.status(404).json({ message: 'Không tìm thấy flash sale để cập nhật' });

    res.json({ message: 'Cập nhật thành công', data: flashSale });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// [DELETE] /api/flashsales/:id
export const deleteFlashSale = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ message: 'ID không hợp lệ' });

    const deleted = await FlashSale.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: 'Không tìm thấy flash sale để xoá' });

    res.json({ message: 'Xoá flash sale thành công', data: deleted });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};
