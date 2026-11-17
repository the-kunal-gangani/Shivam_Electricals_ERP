import mongoose from 'mongoose';

const refreshTokenSchema = new mongoose.Schema(
  {
    tokenId: { type: String, required: true, unique: true },
    tokenHash: { type: String, required: true, unique: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    expiresAt: { type: Date, required: true },
    revokedAt: { type: Date, default: null }
  },
  { timestamps: true }
);

refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const RefreshToken = mongoose.model('RefreshToken', refreshTokenSchema);
