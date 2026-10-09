import express from 'express';
import Club from '../models/Club.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const clubs = await Club.find().sort({ createdAt: -1 });
    res.status(200).json(clubs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const newClub = new Club(req.body);
    const saved = await newClub.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const updated = await Club.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await Club.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Activity deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
