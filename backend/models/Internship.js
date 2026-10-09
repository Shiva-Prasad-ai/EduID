import mongoose from 'mongoose';

const internshipSchema = new mongoose.Schema({
  role: { type: String, required: true },
  company: { type: String, required: true },
  startDate: { type: Date },
  endDate: { type: Date },
  description: { type: String },
  userId: { type: String, default: 'guest_user' }
}, { timestamps: true });

export default mongoose.model('Internship', internshipSchema);
