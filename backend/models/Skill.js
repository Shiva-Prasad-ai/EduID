import mongoose from 'mongoose';

const skillSchema = new mongoose.Schema({
  skillId: {
    type: String,
    required: true,
    unique: true
  },
  level: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert'],
    default: 'Beginner'
  },
  verifiedStatus: {
    type: String,
    enum: ['Self Added', 'Institution Verified', 'AI Recommended', 'Internship Verified'],
    default: 'Self Added'
  },
  userId: {
    type: String,
    required: true,
    // In the future this would be a mongoose.Schema.Types.ObjectId referencing a User model
    default: 'guest_user'
  }
}, {
  timestamps: true // Automatically adds createdAt and updatedAt fields
});

const Skill = mongoose.model('Skill', skillSchema);

export default Skill;
