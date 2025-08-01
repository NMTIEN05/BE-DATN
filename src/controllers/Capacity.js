import Capacity from "../model/Capacity.js";
import { capacitySchema } from "../validate/Capacity.js";

// ✅ Lấy tất cả dung lượng
export const getAllCapacities = async (req, res) => {
  try {
    let {
      offset = "0",
      limit = "10",
      sortBy = "createdAt",
      order = "desc",
      search,
    } = req.query;

    const offsetNumber = parseInt(offset, 10);
    const limitNumber = parseInt(limit, 10);
    const sortOrder = order === "desc" ? -1 : 1;

    // Tạo bộ lọc
    const filter = {};
    if (search) {
      filter.name = { $regex: search, $options: "i" };
    }

    // Truy vấn
    const capacities = await Capacity.find(filter)
      .sort({ [sortBy]: sortOrder })
      .skip(offsetNumber)
      .limit(limitNumber);

    const total = await Capacity.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: capacities,
      pagination: {
        total,
        offset: offsetNumber,
        limit: limitNumber,
      },
    });
  } catch (error) {
    console.error("Lỗi khi lấy danh sách dung lượng:", error);
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};


// ✅ Lấy dung lượng theo ID
export const getCapacityById = async (req, res) => {
  try {
    const { id } = req.params;
    const capacity = await Capacity.findById(id);

    if (!capacity) {
      return res.status(404).json({ message: "Không tìm thấy dung lượng." });
    }

    res.status(200).json(capacity);
  } catch (error) {
    console.error("Lỗi khi lấy dung lượng theo ID:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
};

// ✅ Tạo mới dung lượng (có Joi)
export const createCapacity = async (req, res) => {
  try {
    const { error } = capacitySchema.validate(req.body, { abortEarly: false });
    if (error) {
      const errors = error.details.map((err) => err.message);
      return res.status(400).json({ message: "Dữ liệu không hợp lệ", errors });
    }

    const { capacity } = req.body;
    const existing = await Capacity.findOne({ capacity });
    if (existing) {
      return res.status(409).json({ message: "Dung lượng đã tồn tại." });
    }

    const newCapacity = new Capacity({ capacity });
    const saved = await newCapacity.save();

    res.status(201).json(saved);
  } catch (error) {
    console.error("Lỗi khi tạo dung lượng:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
};

// ✅ Cập nhật dung lượng (có Joi)
export const updateCapacity = async (req, res) => {
  try {
    const { error } = capacitySchema.validate(req.body, { abortEarly: false });
    if (error) {
      const errors = error.details.map((err) => err.message);
      return res.status(400).json({ message: "Dữ liệu không hợp lệ", errors });
    }

    const { id } = req.params;
    const { capacity } = req.body;

    const updated = await Capacity.findByIdAndUpdate(
      id,
      { capacity },
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Không tìm thấy dung lượng." });
    }

    res.status(200).json(updated);
  } catch (error) {
    console.error("Lỗi khi cập nhật dung lượng:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
};

// ✅ Xoá dung lượng theo ID
export const deleteCapacity = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Capacity.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ message: "Không tìm thấy dung lượng." });
    }
    res.status(200).json({ message: "Xóa dung lượng thành công." });
  } catch (error) {
    console.error("Lỗi khi xoá dung lượng:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
};
export const getDeletedCapacities = async (req, res) => {
  try {
    const data = await Capacity.find({ deletedAt: { $ne: null } });
    res.json({ data });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server" });
  }
};
// [PUT] /capacities/:id/restore
export const restoreCapacity = async (req, res) => {
  try {
    const { id } = req.params;
    const restored = await Capacity.findByIdAndUpdate(
      id,
      { deletedAt: null },
      { new: true }
    );

    if (!restored) {
      return res.status(404).json({ message: "Không tìm thấy dung lượng để khôi phục." });
    }

    res.json({ message: "Khôi phục dung lượng thành công", data: restored });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server" });
  }
};

// [DELETE] /capacities/:id/force
export const forceDeleteCapacity = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Capacity.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ message: "Không tìm thấy dung lượng để xoá vĩnh viễn." });
    }
    res.json({ message: "Xoá vĩnh viễn dung lượng thành công" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server" });
  }
};
