import mongoose from 'mongoose';

const storeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, trim: true, uppercase: true, unique: true },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

export const Store = mongoose.model('Store', storeSchema);
