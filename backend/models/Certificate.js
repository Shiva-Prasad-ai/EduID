import mongoose from 'mongoose';

const certificateSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, enum: ['academic', 'non-academic'], default: 'academic' },
  issuer: { type: String, default: '' },
  issueDate: { type: String, default: '' },
  fileName: { type: String, default: '' },
  fileSize: { type: String, default: '' },
  fileData: { type: String, default: '' },
  fileType: { type: String, default: '' },
  verified: { type: Boolean, default: true },
  score: { type: String, default: 'AI Verified' }
}, { timestamps: true });

export default mongoose.model('Certificate', certificateSchema);
