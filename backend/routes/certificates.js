import express from 'express';
import Certificate from '../models/Certificate.js';

const router = express.Router();

// GET all certificates
router.get('/', async (req, res) => {
  try {
    const certs = await Certificate.find().sort({ createdAt: -1 });
    res.status(200).json(certs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST create certificate
router.post('/', async (req, res) => {
  try {
    const newCert = new Certificate(req.body);
    const saved = await newCert.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE certificate by ID
router.delete('/:id', async (req, res) => {
  try {
    await Certificate.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Certificate deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
