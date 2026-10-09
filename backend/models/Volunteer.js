import mongoose from 'mongoose';

const volunteerSchema = new mongoose.Schema({
  organizationName: { type: String, required: true },
  role: { type: String, required: true },
  category: { type: String, default: 'Community Service' },
  startDate: { type: String, default: '' },
  endDate: { type: String },
  currentlyActive: { type: Boolean, default: false },
  description: { type: String, required: true },
  hoursContributed: { type: Number, default: 0 },
  impact: { type: String },
  proofBase64: { type: String },
  proofFileName: { type: String },
  userId: { type: String, default: 'guest_user' }
}, { timestamps: true });

export default mongoose.model('Volunteer', volunteerSchema);
