import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: 'engineer' | 'student';
  skills: string[];
  experience: string;
  avatar?: string;
  bio?: string;
  location?: string;
  github?: string;
  linkedin?: string;
  website?: string;
  isAvailable: boolean;
  rating: number;
  totalReviews: number;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>({
  name: {
    type: String,
    required: [true, 'Please add a name'],
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email'
    ]
  },
  password: {
    type: String,
    required: [true, 'Please add a password'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  role: {
    type: String,
    enum: ['engineer', 'student'],
    required: [true, 'Please specify your role']
  },
  skills: [{
    type: String,
    trim: true
  }],
  experience: {
    type: String,
    required: [true, 'Please add your experience level']
  },
  avatar: {
    type: String,
    default: function(this: IUser) {
      return `https://ui-avatars.com/api/?name=${encodeURIComponent(this.name)}&background=3b82f6&color=fff`;
    }
  },
  bio: {
    type: String,
    maxlength: [500, 'Bio cannot be more than 500 characters']
  },
  location: {
    type: String,
    trim: true
  },
  github: {
    type: String,
    match: [
      /^https?:\/\/(www\.)?github\.com\/[a-zA-Z0-9-]+$/,
      'Please add a valid GitHub URL'
    ]
  },
  linkedin: {
    type: String,
    match: [
      /^https?:\/\/(www\.)?linkedin\.com\/in\/[a-zA-Z0-9-]+$/,
      'Please add a valid LinkedIn URL'
    ]
  },
  website: {
    type: String,
    match: [
      /^https?:\/\/.+/,
      'Please add a valid website URL'
    ]
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  rating: {
    type: Number,
    default: 0,
    min: [0, 'Rating must be at least 0'],
    max: [5, 'Rating cannot exceed 5']
  },
  totalReviews: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for average rating
userSchema.virtual('averageRating').get(function() {
  return this.totalReviews > 0 ? this.rating / this.totalReviews : 0;
});

// Encrypt password using bcrypt
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
    return;
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Sign JWT and return
userSchema.methods.getSignedJwtToken = function() {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET || 'fallback-secret');
};

// Match user entered password to hashed password in database
userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return await bcrypt.compare(candidatePassword, this.password);
};


export const User = mongoose.model<IUser>('User', userSchema);
