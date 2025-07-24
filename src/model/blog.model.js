import mongoose from 'mongoose';

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
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export default mongoose.model('Blog', blogSchema);
