import mongoose from 'mongoose';
import { buildSearchText } from '../modules/products/products.utils.js';

const { Schema } = mongoose;

const paise = {
  type: Number,
  default: null,
  min: 0,
  validate: {
    validator: (value) => value === null || Number.isInteger(value),
    message: 'Rate must be a whole number of paise.'
  }
};

const variantSchema = new Schema({
  label: { type: String, required: true, trim: true, default: 'Standard' },
  mrpPaise: paise,
  wholesalePaise: paise,
  retailPaise: paise,
  costPaise: paise,
  reorderLevel: { type: Number, default: 0, min: 0 },
  isActive: { type: Boolean, default: true }
});

const productSchema = new Schema(
  {
    brand: { type: String, required: true, trim: true },
    series: { type: String, trim: true },
    category: { type: String, required: true, trim: true },
    name: { type: String, required: true, trim: true },
    code: { type: String, trim: true },
    hsn: { type: String, trim: true },
    unit: { type: String, trim: true, default: 'pcs' },
    packSize: { type: Number, default: 1, min: 1 },
    variants: {
      type: [variantSchema],
      validate: {
        validator: (value) => value.length > 0,
        message: 'At least one variant is required.'
      }
    },
    isActive: { type: Boolean, default: true },
    searchText: { type: String, select: false }
  },
  { timestamps: true }
);

productSchema.index({ brand: 1, category: 1, name: 1 });
productSchema.index({ code: 1 });
productSchema.index({ searchText: 1 });

productSchema.pre('save', function () {
  this.searchText = buildSearchText(this);
});

export const Product = mongoose.models.Product || mongoose.model('Product', productSchema);
