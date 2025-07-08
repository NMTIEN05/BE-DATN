import { Schema, model } from 'mongoose';

const bannerSchema = new Schema(
  {
    /* Ảnh đại diện (bắt buộc) */
    imageUrl : { type: String, required: true },

    /* Tiêu đề ngắn hiển thị trên banner */
    title    : { type: String },

    /* Link điều hướng khi click banner */
    link     : { type: String },

    /* Thứ tự hiển thị (sắp xếp ASC) */
    sortOrder: { type: Number, default: 0 },

    /* Banner bật/tắt */
    isActive : { type: Boolean, default: true },

    /* Khoảng ngày hiệu lực (tuỳ chọn) */
    startAt  : { type: Date },
    endAt    : { type: Date },
  },
  { timestamps: true }
);

export default model('Banner', bannerSchema);
