const fs   = require('fs');
const path = require('path');

/**
 * Xoá file vật lý an toàn – im lặng nếu không tồn tại.
 * @param {string} relPath Đường dẫn tương đối (VD: /uploads/blogs/abc.jpg)
 */
exports.removeFile = async (relPath) => {
  if (!relPath) return;
  // __dirname = /blog/utils → lùi lên 1 thư mục
  const absolute = path.join(__dirname, '..', relPath);
  try {
    await fs.promises.unlink(absolute);
  } catch (err) {
    // File có thể đã bị xoá hoặc sai path – ghi log nhẹ, không chặn luồng
    console.warn('[file.removeFile]', err.message);
  }
};
