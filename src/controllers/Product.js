import Product from '../model/Product.js';

export const createProduct = async (req, res) => {
  try {
    const { name, description, categoryId, variants } = req.body;

    // Kiểm tra tối thiểu 1 biến thể
    if (!variants || !Array.isArray(variants) || variants.length === 0) {
      return res.status(400).json({ message: 'Phải có ít nhất một biến thể sản phẩm.' });
    }

    const newProduct = new Product({
      name,
      description,
      categoryId,
      variants
    });

    await newProduct.save();

    res.status(201).json({
      message: 'Thêm sản phẩm thành công!',
      product: newProduct
    });
  } catch (error) {
    console.error('Lỗi thêm sản phẩm:', error);
    res.status(500).json({ message: 'Lỗi server khi thêm sản phẩm.' });
  }
};
export const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find().populate('categoryId', 'name').sort({ createdAt: -1 });
    res.status(200).json(products);
  } catch (error) {
    console.error('Lỗi khi lấy danh sách sản phẩm:', error);
    res.status(500).json({ message: 'Lỗi server khi lấy danh sách sản phẩm.' });
  }
};
export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id).populate('categoryId', 'name');

    if (!product) {
      return res.status(404).json({ message: 'Sản phẩm không tồn tại.' });
    }

    res.status(200).json(product);
  } catch (error) {
    console.error('Lỗi khi lấy sản phẩm theo ID:', error);
    res.status(500).json({ message: 'Lỗi server khi lấy sản phẩm theo ID.' });
  }
};
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, categoryId, variants } = req.body;

    // Kiểm tra tối thiểu 1 biến thể
    if (!variants || !Array.isArray(variants) || variants.length === 0) {
      return res.status(400).json({ message: 'Phải có ít nhất một biến thể sản phẩm.' });
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      { name, description, categoryId, variants },
      { new: true }
    ).populate('categoryId', 'name');

    if (!updatedProduct) {
      return res.status(404).json({ message: 'Sản phẩm không tồn tại.' });
    }

    res.status(200).json({
      message: 'Cập nhật sản phẩm thành công!',
      product: updatedProduct
    });
  } catch (error) {
    console.error('Lỗi cập nhật sản phẩm:', error);
    res.status(500).json({ message: 'Lỗi server khi cập nhật sản phẩm.' });
  }
};

