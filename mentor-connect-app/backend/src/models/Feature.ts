import mongoose, { Document, Schema } from 'mongoose';

export interface IFeature extends Document {
  title: string;
  description: string;
  icon: string;
  order: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const featureSchema = new Schema<IFeature>({
  title: {
    type: String,
    required: [true, 'Feature title is required'],
    trim: true,
    maxlength: [100, 'Feature title cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Feature description is required'],
    trim: true,
    maxlength: [250, 'Feature description cannot exceed 250 characters']
  },
  icon: {
    type: String,
    required: [true, 'Feature icon is required'],
    trim: true
  },
  order: {
    type: Number,
    default: 0,
    min: [0, 'Feature order cannot be negative']
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

featureSchema.index({ isActive: 1, order: 1 });

export const Feature = mongoose.model<IFeature>('Feature', featureSchema);


