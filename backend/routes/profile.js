import express from 'express';
import Profile from '../models/Profile.js';

const router = express.Router();

// GET current profile pic
router.get('/', async (req, res) => {
  try {
    const profile = await Profile.findOne({ userId: 'guest_user' });
    if (!profile) return res.status(404).json({ message: 'No profile found' });
    res.status(200).json(profile);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST to update or create profile pic
router.post('/', async (req, res) => {
  try {
    const { profilePicBase64 } = req.body;
    let profile = await Profile.findOne({ userId: 'guest_user' });
    
    if (profile) {
      profile.profilePicBase64 = profilePicBase64;
      await profile.save();
    } else {
      profile = new Profile({ profilePicBase64, userId: 'guest_user' });
      await profile.save();
    }
    
    res.status(200).json(profile);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
