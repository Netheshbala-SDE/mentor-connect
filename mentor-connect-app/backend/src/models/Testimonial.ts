import mongoose, { Document, Schema } from 'mongoose';

export interface ITestimonial extends Document {
  name: string;
  role: string;
  avatar: string;
  quote: string;
  rating: number;
  isFeatured: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const testimonialSchema = new Schema<ITestimonial>({
  name: {
    type: String,
    required: [true, 'Testimonial name is required'],
    trim: true,
    maxlength: [60, 'Name cannot exceed 60 characters']
  },
  role: {
    type: String,
    required: [true, 'Role is required'],
    trim: true,
    maxlength: [80, 'Role cannot exceed 80 characters']
  },
  avatar: {
    type: String,
    required: [true, 'Avatar URL is required'],
    trim: true,
    match: [
      /^https?:\/\/.+/,
      'Please provide a valid avatar URL'
    ]
  },
  quote: {
    type: String,
    required: [true, 'Quote is required'],
    trim: true,
    maxlength: [500, 'Quote cannot exceed 500 characters']
  },
  rating: {
    type: Number,
    default: 5,
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot exceed 5']
  },
  isFeatured: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

testimonialSchema.index({ isFeatured: 1, createdAt: -1 });

export const Testimonial = mongoose.model<ITestimonial>('Testimonial', testimonialSchema);


