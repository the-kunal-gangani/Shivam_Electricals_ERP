import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, lowercase: true, trim: true, sparse: true, unique: true },
    phone: { type: String, trim: true, sparse: true, unique: true },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: ['admin', 'staff'], required: true },
    permissions: { type: [String], default: [] },
    storeIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Store' }],
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

export const User = mongoose.model('User', userSchema);
