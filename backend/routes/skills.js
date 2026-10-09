import express from 'express';
import Skill from '../models/Skill.js';

const router = express.Router();

// GET all skills for a user
router.get('/', async (req, res) => {
  try {
    const skills = await Skill.find();
    res.status(200).json(skills);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching skills', error: error.message });
  }
});

// POST a new skill
router.post('/', async (req, res) => {
  try {
    const { skillId, level, verifiedStatus } = req.body;
    
    // Check if skill already exists
    const existingSkill = await Skill.findOne({ skillId });
    if (existingSkill) {
      return res.status(400).json({ message: 'Skill already added to profile' });
    }

    const newSkill = new Skill({
      skillId,
      level,
      verifiedStatus
    });

    const savedSkill = await newSkill.save();
    res.status(201).json(savedSkill);
  } catch (error) {
    res.status(500).json({ message: 'Error adding skill', error: error.message });
  }
});

// PUT update a skill level
router.put('/:id', async (req, res) => {
  try {
    const { level } = req.body;
    const updatedSkill = await Skill.findByIdAndUpdate(
      req.params.id, 
      { level }, 
      { new: true } // Return the updated document
    );
    
    if (!updatedSkill) {
      return res.status(404).json({ message: 'Skill not found' });
    }
    
    res.status(200).json(updatedSkill);
  } catch (error) {
    res.status(500).json({ message: 'Error updating skill', error: error.message });
  }
});

// DELETE a skill
router.delete('/:id', async (req, res) => {
  try {
    const deletedSkill = await Skill.findByIdAndDelete(req.params.id);
    if (!deletedSkill) {
      return res.status(404).json({ message: 'Skill not found' });
    }
    res.status(200).json({ message: 'Skill successfully removed' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting skill', error: error.message });
  }
});

export default router;
