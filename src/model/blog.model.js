import mongoose from 'mongoose';
import slugMiddleware from '../middlewares/slug.middleware.js';

const blogSchema = new mongoose.Schema(
  {
    largeTitle: {
      type: String,
      required: true,
    },
    smallTitle: {
      type: String,
      required: true,
    },
    slug: {
      type: String,
      unique: true,
      index: true,
    },
    description: {
      type: String,
      required: true,
      maxlength: 500,
    },
    content: {
      type: String,
      required: true,
    },
    imageUrl: {
      type: String,
    },
    author: {
      type: String,
      default: 'Anonymous',
    },
    published: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Auto-generate slug from largeTitle
blogSchema.plugin(slugMiddleware('largeTitle', 'slug', true));

export default mongoose.model('Blog', blogSchema);
