import mongoose from 'mongoose';

const subBannerSchema = new mongoose.Schema({
  title: { type: String, required: true },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  position: { type: Number, default: 0 },
}, { timestamps: true });

export default mongoose.model('SubBanner', subBannerSchema);
