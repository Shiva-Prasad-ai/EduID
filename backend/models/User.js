import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    eduId: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true
    },
    formattedEduId: {
      type: String,
      trim: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    password: {
      type: String,
      required: true
    },
    role: {
      type: String,
      enum: ['Student', 'College', 'University', 'Admin'],
      default: 'Student'
    },
    state: {
      type: String,
      default: 'KA',
      uppercase: true,
      trim: true
    },
    year: {
      type: Number,
      default: 2026
    },
    sequenceNumber: {
      type: Number,
      default: 1
    },
    department: {
      type: String,
      default: 'BCA - 2nd Year'
    },
    institution: {
      type: String,
      default: 'Bengaluru City University'
    },
    email: {
      type: String,
      trim: true,
      lowercase: true
    },
    status: {
      type: String,
      default: 'Verified'
    },
    attendance: {
      type: String,
      default: '94%'
    },
    cgpa: {
      type: String,
      default: '8.72'
    },
    dateOfBirth: {
      type: String,
      default: '12 May 2005'
    }
  },
  { timestamps: true }
);

export default mongoose.model('User', userSchema);
