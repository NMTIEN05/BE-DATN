import Wishlist from '../model/wishlist.js';

/* Lấy tất cả wishlist của user hiện tại */
export const getWishlist = async (req, res, next) => {
  try {
    const items = await Wishlist.find({ user: req.user.id })
                                .populate('product'); // hoặc 'blog'
    res.json(items);
  } catch (err) {
    next(err);
  }
};

/* Thêm item vào wishlist */
export const addToWishlist = async (req, res, next) => {
  try {
    const { productId } = req.params;

    // Kiểm tra nếu sản phẩm đã có trong wishlist
    const existed = await Wishlist.findOne({
      user: req.user.id,
      product: productId,
    });

    if (existed) {
      return res.status(400).json({ message: 'Already in wishlist' });
    }

    // Tạo wishlist mới
    const item = await Wishlist.create({
      user: req.user.id,
      product: productId,
    });

    res.status(201).json(item);
  } catch (err) {
    next(err);
  }
};

/* Xoá item khỏi wishlist */
export const removeFromWishlist = async (req, res, next) => {
  try {
    const { productId } = req.params;

    const removed = await Wishlist.findOneAndDelete({
      user: req.user.id,
      product: productId,
    });

    if (!removed) {
      return res.status(404).json({ message: 'Not in wishlist' });
    }

    res.json({ message: 'Removed' });
  } catch (err) {
    next(err);
  }
};
