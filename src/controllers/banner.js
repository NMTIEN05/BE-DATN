import { create, find, findById, findByIdAndDelete } from '../model/banner';
import { removeFile } from '../utils/file.utils';

/* Tạo banner */
export async function createBanner(req, res, next) {
  try {
    if (!req.file) return res.status(400).json({ message: 'Image is required' });

    const banner = await create({
      ...req.body,
      imageUrl: `/uploads/banners/${req.file.filename}`,
    });

    res.status(201).json(banner);
  } catch (err) {
    next(err);
  }
}

/* Lấy list (tuỳ chọn lọc active & sort) */
export async function getAllBanners(req, res, next) {
  try {
    const filter = req.query.active === 'true' ? { isActive: true } : {};
    const banners = await find(filter).sort({ sortOrder: 1 });
    res.json(banners);
  } catch (err) {
    next(err);
  }
}

/* Lấy chi tiết */
export async function getBannerById(req, res, next) {
  try {
    const banner = await findById(req.params.id);
    if (!banner) return res.status(404).json({ message: 'Not found' });
    res.json(banner);
  } catch (err) {
    next(err);
  }
}

/* Cập nhật */
export async function updateBanner(req, res, next) {
  try {
    const banner = await findById(req.params.id);
    if (!banner) return res.status(404).json({ message: 'Not found' });

    /* Nếu upload ảnh mới: xoá ảnh cũ */
    if (req.file) {
      const old = banner.imageUrl;
      banner.imageUrl = `/uploads/banners/${req.file.filename}`;
      if (old) removeFile(old).catch(console.error);
    }

    /* Update field text */
    const fields = ['title', 'link', 'sortOrder', 'isActive', 'startAt', 'endAt'];
    fields.forEach(f => {
      if (req.body[f] !== undefined) banner[f] = req.body[f];
    });

    await banner.save();
    res.json(banner);
  } catch (err) {
    next(err);
  }
}

/* Xoá */
export async function deleteBanner(req, res, next) {
  try {
    const banner = await findByIdAndDelete(req.params.id);
    if (!banner) return res.status(404).json({ message: 'Not found' });
    if (banner.imageUrl) removeFile(banner.imageUrl).catch(console.error);
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    next(err);
  }
}
