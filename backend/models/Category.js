import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
  name: {
    ar: { type: String, required: true },
    en: { type: String, required: true }
  },
  slug: {
    type: String,
    required: true,
    unique: true
  },
  description: {
    ar: String,
    en: String
  },
  image: String,
  icon: String,
  parent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    default: null
  },
  order: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

export default mongoose.model('Category', categorySchema);
