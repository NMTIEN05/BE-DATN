import Banner from '../model/banner.js';

// [POST] /api/banners
export const createBanner = async (req, res) => {
  try {
    const { title, image, description, link, isActive, order } = req.body;

    if (!image) {
      return res.status(400).json({ message: 'Trường ảnh là bắt buộc' });
    }

    const banner = await Banner.create({
      title,
      image,
      description,
      link,
      isActive,
      order,
    });

    res.status(201).json({ message: 'Tạo banner thành công', data: banner });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// [GET] /api/banners
export const getAllBanners = async (req, res) => {
  try {
    const banners = await Banner.find().sort({ order: 1, createdAt: -1 });
    res.json(banners);
  } catch (error) {
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
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// [PUT] /api/banners/:id
export const updateBanner = async (req, res) => {
  try {
    const { title, image, description, link, isActive, order } = req.body;

    const banner = await Banner.findByIdAndUpdate(
      req.params.id,
      { title, image, description, link, isActive, order },
      { new: true }
    );

    if (!banner) return res.status(404).json({ message: 'Không tìm thấy banner để cập nhật' });

    res.json({ message: 'Cập nhật thành công', data: banner });
  } catch (error) {
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
    res.status(500).json({ message: 'Lỗi server' });
  }
};
