import mongoose from 'mongoose';

const profileSchema = new mongoose.Schema({
  profilePicBase64: { type: String, required: true },
  userId: { type: String, default: 'guest_user', unique: true }
}, { timestamps: true });

export default mongoose.model('Profile', profileSchema);
