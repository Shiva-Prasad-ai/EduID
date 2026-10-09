import mongoose from 'mongoose';

const clubSchema = new mongoose.Schema({
  clubName: { type: String, required: true },
  designation: { type: String, required: true },
  duration: { type: String, required: true },
  category: { type: String, default: 'Technical' },
  description: { type: String, required: true },
  userId: { type: String, default: 'guest_user' }
}, { timestamps: true });

export default mongoose.model('Club', clubSchema);
