import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  link: { type: String },
  userId: { type: String, default: 'guest_user' }
}, { timestamps: true });

export default mongoose.model('Project', projectSchema);
