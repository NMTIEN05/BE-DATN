import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

/**
 * Xoá file vật lý an toàn – im lặng nếu không tồn tại.
 * @param {string} relPath Đường dẫn tương đối (VD: /uploads/blogs/abc.jpg)
 */
export const removeFile = async (relPath) => {
  if (!relPath) return;

  // __dirname cho ESM
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);

  const absolute = path.join(__dirname, '..', relPath);

  try {
    await fs.unlink(absolute);
  } catch (err) {
    // File có thể đã bị xoá hoặc sai path – ghi log nhẹ, không chặn luồng
    console.warn('[file.removeFile]', err.message);
  }
};
