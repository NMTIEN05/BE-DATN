import Color from "../model/Color.js";

// CREATE
export const createColor = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: "Color name is required" });

    const existing = await Color.findOne({ name });
    if (existing) return res.status(409).json({ message: "Color already exists" });

    const color = new Color({ name });
    const saved = await color.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// READ ALL
export const getAllColors = async (req, res) => {
  try {
    const colors = await Color.find().sort({ createdAt: -1 });
    res.json(colors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// READ ONE
export const getColorById = async (req, res) => {
  try {
    const color = await Color.findById(req.params.id);
    if (!color) return res.status(404).json({ message: "Color not found" });
    res.json(color);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// UPDATE
export const updateColor = async (req, res) => {
  try {
    const { name } = req.body;
    const updated = await Color.findByIdAndUpdate(
      req.params.id,
      { name },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: "Color not found" });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE
export const deleteColor = async (req, res) => {
  try {
    const deleted = await Color.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Color not found" });
    res.json({ message: "Color deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
