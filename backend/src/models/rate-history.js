import mongoose from 'mongoose';

const { Schema } = mongoose;

const rateHistorySchema = new Schema(
  {
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    variantId: { type: Schema.Types.ObjectId, required: true },
    field: {
      type: String,
      enum: ['mrp', 'wholesaleRate', 'retailRate', 'costRate'],
      required: true
    },
    oldPaise: { type: Number, default: null },
    newPaise: { type: Number, default: null },
    changedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    source: { type: String, enum: ['manual', 'bulk', 'import'], default: 'manual' }
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

rateHistorySchema.index({ productId: 1, createdAt: -1 });

export const RateHistory =
  mongoose.models.RateHistory || mongoose.model('RateHistory', rateHistorySchema);
