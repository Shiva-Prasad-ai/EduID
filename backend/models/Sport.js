import mongoose from 'mongoose';

const sportSchema = new mongoose.Schema({
  sportName: { 
    type: String, 
    required: true
  },
  category: { type: String, default: 'General' },
  role: { type: String, default: 'Athlete' },
  skillLevel: { type: String, default: 'Active' },
  participationLevel: { type: String, default: '' },
  organization: { type: String, default: '' },
  startDate: { type: String, default: '' },
  endDate: { type: String },
  currentlyActive: { type: Boolean, default: false },
  achievements: { type: String },
  awards: { type: String },
  competitions: { type: String },
  leadershipRole: { type: String },
  description: { type: String },
  transferableSkills: [{ type: String }],
  proofBase64: { type: String },
  proofFileName: { type: String },
  userId: { type: String, default: 'guest_user' }
}, { timestamps: true });

export default mongoose.model('Sport', sportSchema);
