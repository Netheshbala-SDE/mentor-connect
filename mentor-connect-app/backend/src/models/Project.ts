import mongoose, { Document, Schema } from 'mongoose';

export interface IApplication {
  student: mongoose.Types.ObjectId;
  message?: string;
  status: 'pending' | 'accepted' | 'rejected';
  appliedAt: Date;
}

export interface IProject extends Document {
  title: string;
  description: string;
  owner: mongoose.Types.ObjectId;
  student?: mongoose.Types.ObjectId; // Changed from mentor to student
  skills: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  status: 'open' | 'in-progress' | 'completed' | 'cancelled';
  duration: string;
  budget?: number;
  githubUrl?: string;
  liveUrl?: string;
  images: string[];
  applications: IApplication[];
  createdAt: Date;
  updatedAt: Date;
}

const projectSchema = new Schema<IProject>({
  title: {
    type: String,
    required: [true, 'Please add a project title'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Please add a project description'],
    maxlength: [2000, 'Description cannot be more than 2000 characters']
  },
  owner: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  student: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  applications: [{
    student: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    message: {
      type: String,
      maxlength: [500, 'Application message cannot be more than 500 characters']
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected'],
      default: 'pending'
    },
    appliedAt: {
      type: Date,
      default: Date.now
    }
  }],
  skills: [{
    type: String,
    required: [true, 'Please add at least one skill'],
    trim: true
  }],
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    required: [true, 'Please specify project difficulty']
  },
  status: {
    type: String,
    enum: ['open', 'in-progress', 'completed', 'cancelled'],
    default: 'open'
  },
  duration: {
    type: String,
    required: [true, 'Please specify project duration']
  },
  budget: {
    type: Number,
    min: [0, 'Budget cannot be negative']
  },
  githubUrl: {
    type: String,
    match: [
      /^https?:\/\/(www\.)?github\.com\/[a-zA-Z0-9-]+\/[a-zA-Z0-9-]+$/,
      'Please add a valid GitHub repository URL'
    ]
  },
  liveUrl: {
    type: String,
    match: [
      /^https?:\/\/.+/,
      'Please add a valid live URL'
    ]
  },
  images: [{
    type: String
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index for better query performance
projectSchema.index({ skills: 1, difficulty: 1, status: 1 });
projectSchema.index({ owner: 1 });
projectSchema.index({ student: 1 });
projectSchema.index({ 'applications.student': 1 });

export const Project = mongoose.model<IProject>('Project', projectSchema);
