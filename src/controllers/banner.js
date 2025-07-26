import Banner from '../model/banner.js';

// [POST] /api/banners
export const createBanner = async (req, res) => {
  try {
    const { title, description, link, isActive, order } = req.body;

    // Xử lý ảnh upload
    let imageUrl = '';
    if (req.file) {
      imageUrl = `/uploads/banners/${req.file.filename}`;
    } else if (req.body.image) {
      // Nếu không có file upload, sử dụng URL từ body
      imageUrl = req.body.image;
    }

    if (!imageUrl) {
      return res.status(400).json({ message: 'Trường ảnh là bắt buộc' });
    }

    const banner = await Banner.create({
      title,
      image: imageUrl,
      description,
      link,
      isActive: isActive === 'true' || isActive === true,
      order: parseInt(order) || 0,
    });

    res.status(201).json({ message: 'Tạo banner thành công', data: banner });
  } catch (error) {
    console.error('Error creating banner:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// [GET] /api/banners
export const getAllBanners = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const banners = await Banner.find()
      .sort({ order: 1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await Banner.countDocuments();
    
    res.json({
      data: banners,
      total,
      page: parseInt(page),
      limit: parseInt(limit)
    });
  } catch (error) {
    console.error('Error fetching banners:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// [GET] /api/banners/:id
export const getBannerById = async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id);
    if (!banner) return res.status(404).json({ message: 'Không tìm thấy banner' });
    res.json(banner);
  } catch (error) {
    console.error('Error fetching banner by id:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// [PUT] /api/banners/:id
export const updateBanner = async (req, res) => {
  try {
    const { title, description, link, isActive, order } = req.body;

    // Xử lý ảnh upload
    let imageUrl = '';
    if (req.file) {
      imageUrl = `/uploads/banners/${req.file.filename}`;
    } else if (req.body.image) {
      // Nếu không có file upload, sử dụng URL từ body
      imageUrl = req.body.image;
    }

    const updateData = {
      title,
      description,
      link,
      isActive: isActive === 'true' || isActive === true,
      order: parseInt(order) || 0,
    };

    // Chỉ cập nhật image nếu có ảnh mới
    if (imageUrl) {
      updateData.image = imageUrl;
    }

    const banner = await Banner.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    if (!banner) return res.status(404).json({ message: 'Không tìm thấy banner để cập nhật' });

    res.json({ message: 'Cập nhật thành công', data: banner });
  } catch (error) {
    console.error('Error updating banner:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// [DELETE] /api/banners/:id
export const deleteBanner = async (req, res) => {
  try {
    const banner = await Banner.findByIdAndDelete(req.params.id);
    if (!banner) return res.status(404).json({ message: 'Không tìm thấy banner để xoá' });

    res.json({ message: 'Xoá banner thành công' });
  } catch (error) {
    console.error('Error deleting banner:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};
