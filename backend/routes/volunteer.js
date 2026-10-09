import express from 'express';
import Volunteer from '../models/Volunteer.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const records = await Volunteer.find().sort({ createdAt: -1 });
    res.status(200).json(records);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const newEntry = new Volunteer(req.body);
    const saved = await newEntry.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const updated = await Volunteer.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await Volunteer.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Volunteer record deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
