import SubBanner from '../model/subbanner.js';

export const getAllSubBanners = async (req, res, next) => {
  try {
    const banners = await SubBanner.find().sort({ position: 1 }).populate('product');
    res.json(banners);
  } catch (err) {
    next(err);
  }
};

export const createSubBanner = async (req, res, next) => {
  try {
    const { title, product, position } = req.body;
    const banner = await SubBanner.create({ title, product, position });
    res.status(201).json(banner);
  } catch (err) {
    next(err);
  }
};

export const updateSubBanner = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updated = await SubBanner.findByIdAndUpdate(id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    next(err);
  }
};

export const deleteSubBanner = async (req, res, next) => {
  try {
    const { id } = req.params;
    await SubBanner.findByIdAndDelete(id);
    res.json({ message: 'Deleted' });
  } catch (err) {
    next(err);
  }
};
