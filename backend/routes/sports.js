import express from 'express';
import Sport from '../models/Sport.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const sports = await Sport.find().sort({ createdAt: -1 });
    res.status(200).json(sports);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const newSport = new Sport(req.body);
    const saved = await newSport.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const updated = await Sport.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await Sport.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Sports record deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
