import mongoose from 'mongoose';

const sectionSchema = new mongoose.Schema({
  id: { type: String, required: true },
  type: {
    type: String,
    enum: ['hero', 'categories', 'products', 'banner', 'text', 'imageGrid', 'exclusiveOffers', 'deals'],
    required: true
  },
  title: String,
  subtitle: String,
  order: { type: Number, default: 0 },
  active: { type: Boolean, default: true },
  settings: { type: Map, of: mongoose.Schema.Types.Mixed },
  content: { type: Map, of: mongoose.Schema.Types.Mixed }
}, { _id: false });

const homepageConfigSchema = new mongoose.Schema({
  active: { type: Boolean, default: true },
  sections: [sectionSchema],
  updatedAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

export default mongoose.model('HomepageConfig', homepageConfigSchema);
