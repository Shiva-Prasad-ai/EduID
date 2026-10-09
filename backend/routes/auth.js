import express from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import { generateUniqueEduId } from '../utils/eduIdGenerator.js';

const router = express.Router();

/**
 * POST /api/auth/login
 * Authenticates user securely against MongoDB.
 * Strips all sensitive database details & hashes before returning.
 */
router.post('/login', async (req, res) => {
  try {
    const { eduId, password, role } = req.body;

    if (!eduId || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both EduID and password.'
      });
    }

    // Normalize input: strip hyphens, spaces, and convert to uppercase
    const cleanedInput = eduId.trim();
    const compactInput = cleanedInput.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();

    // Search user by compact eduId or exact formattedEduId
    const user = await User.findOne({
      $or: [
        { eduId: compactInput },
        { eduId: cleanedInput.toUpperCase() },
        { formattedEduId: cleanedInput }
      ]
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'EduID not found. Please check your ID and try again.'
      });
    }

    // Role check (if specified)
    if (role && user.role.toLowerCase() !== role.toLowerCase()) {
      return res.status(401).json({
        success: false,
        message: `This account is registered as ${user.role}, not ${role}.`
      });
    }

    // Secure password comparison
    const isPasswordValid = await bcrypt.compare(password, user.password);

    // Fallback check for exact string match in case legacy unhashed account exists
    const isDirectMatch = password === user.password;

    if (!isPasswordValid && !isDirectMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid password. Please check your credentials.'
      });
    }

    // Respond with sanitized user data (NEVER pass password or hash to frontend)
    return res.status(200).json({
      success: true,
      message: 'Login successful',
      user: {
        id: user._id,
        eduId: user.eduId,
        formattedEduId: user.formattedEduId || `EU-${user.state}-${user.year}-${String(user.sequenceNumber).padStart(3, '0')}`,
        name: user.name,
        role: user.role,
        department: user.department,
        institution: user.institution,
        status: user.status || 'Verified',
        attendance: user.attendance || '94%',
        cgpa: user.cgpa || '8.72',
        dateOfBirth: user.dateOfBirth || '12 May 2005',
        state: user.state,
        year: user.year
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Authentication failed due to a server error.'
    });
  }
});

/**
 * POST /api/auth/generate
 * Generates a unique EduID (EU-State-Year-XXX) with non-occurring 3-digit number
 * and registers the user into MongoDB.
 */
router.post('/generate', async (req, res) => {
  try {
    const {
      state = 'KA',
      year = 2026,
      name = 'New Student',
      password = 'sample user',
      role = 'Student',
      department = 'Computer Science',
      institution = 'Bengaluru City University',
      randomize = true
    } = req.body;

    const { eduId, formattedEduId, sequenceNumber } = await generateUniqueEduId(state, year, randomize);

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      eduId,
      formattedEduId,
      sequenceNumber,
      state: state.toUpperCase().slice(0, 2),
      year: Number(year) || 2026,
      name,
      password: hashedPassword,
      role,
      department,
      institution,
      status: 'Verified'
    });

    await newUser.save();

    return res.status(201).json({
      success: true,
      message: `EduID ${eduId} generated and registered successfully.`,
      user: {
        eduId: newUser.eduId,
        formattedEduId: newUser.formattedEduId,
        name: newUser.name,
        role: newUser.role,
        department: newUser.department,
        institution: newUser.institution,
        state: newUser.state,
        year: newUser.year
      }
    });
  } catch (error) {
    console.error('EduID Generation Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to generate EduID.'
    });
  }
});

/**
 * GET /api/auth/verify-id/:eduId
 * Public verification of an EduID identity.
 */
router.get('/verify-id/:eduId', async (req, res) => {
  try {
    const cleaned = req.params.eduId.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    const user = await User.findOne({
      $or: [{ eduId: cleaned }, { formattedEduId: req.params.eduId }]
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        verified: false,
        message: 'EduID not found in official registry'
      });
    }

    return res.status(200).json({
      success: true,
      verified: true,
      record: {
        eduId: user.eduId,
        formattedEduId: user.formattedEduId,
        name: user.name,
        institution: user.institution,
        department: user.department,
        status: user.status
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
