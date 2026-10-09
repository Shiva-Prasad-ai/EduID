import User from '../models/User.js';
import bcrypt from 'bcryptjs';

/**
 * Generate a unique EduID conforming to:
 * Prefix 'EU' + 2-letter State + 4-digit Year + 3-digit non-occurring number
 * Example compact: EUKA2026001
 * Example formatted: EU-KA-2026-001
 *
 * @param {string} state - 2 letter state code (e.g. 'KA')
 * @param {number} year - 4 digit registration year (e.g. 2026)
 * @param {boolean} randomize - whether to pick random non-occurring number vs sequential
 * @returns {Promise<{eduId: string, formattedEduId: string, sequenceNumber: number}>}
 */
export async function generateUniqueEduId(state = 'KA', year = 2026, randomize = true) {
  const cleanState = state.trim().toUpperCase().slice(0, 2);
  const cleanYear = Number(year) || 2026;

  // Retrieve all existing sequence numbers used for this state and year
  const existingUsers = await User.find(
    { state: cleanState, year: cleanYear },
    { sequenceNumber: 1, eduId: 1 }
  ).lean();

  const usedNumbers = new Set(existingUsers.map((u) => u.sequenceNumber).filter(Boolean));

  // Determine available numbers between 1 and 999
  const availableNumbers = [];
  for (let i = 1; i <= 999; i++) {
    if (!usedNumbers.has(i)) {
      availableNumbers.push(i);
    }
  }

  if (availableNumbers.length === 0) {
    throw new Error(`All 3-digit EduIDs for ${cleanState}-${cleanYear} have been allocated.`);
  }

  let selectedNumber;
  if (randomize) {
    // Pick random non-occurring number
    const randomIndex = Math.floor(Math.random() * availableNumbers.length);
    selectedNumber = availableNumbers[randomIndex];
  } else {
    // Pick sequential lowest available
    selectedNumber = availableNumbers[0];
  }

  const paddedNum = String(selectedNumber).padStart(3, '0');
  const eduId = `EU${cleanState}${cleanYear}${paddedNum}`;
  const formattedEduId = `EU-${cleanState}-${cleanYear}-${paddedNum}`;

  return {
    eduId,
    formattedEduId,
    sequenceNumber: selectedNumber
  };
}

/**
 * Seed initial sample user EUKA2026001 if not already existing
 */
export async function seedSampleUser() {
  try {
    const targetEduId = 'EUKA2026001';
    const existing = await User.findOne({
      $or: [
        { eduId: targetEduId },
        { formattedEduId: 'EU-KA-2026-001' }
      ]
    });

    if (!existing) {
      const hashedPassword = await bcrypt.hash('sample user', 10);
      const sampleStudent = new User({
        eduId: targetEduId,
        formattedEduId: 'EU-KA-2026-001',
        name: 'Ananya Raj',
        password: hashedPassword,
        role: 'Student',
        state: 'KA',
        year: 2026,
        sequenceNumber: 1,
        department: 'BCA - 2nd Year',
        institution: 'Bengaluru City University',
        email: 'ananya.raj@bcu.ac.in',
        status: 'Verified',
        attendance: '94%',
        cgpa: '8.72',
        dateOfBirth: '12 May 2005'
      });

      await sampleStudent.save();
      console.log('✅ Sample user EUKA2026001 created successfully in database with password: "sample user"');
    } else {
      console.log('ℹ️ Sample user EUKA2026001 already verified in database.');
    }

    // Also seed sample college/university/admin for complete role testing
    const sampleAdmin = await User.findOne({ eduId: 'EUAD2026001' });
    if (!sampleAdmin) {
      const adminPassword = await bcrypt.hash('sample user', 10);
      await User.create({
        eduId: 'EUAD2026001',
        formattedEduId: 'EU-AD-2026-001',
        name: 'System Administrator',
        password: adminPassword,
        role: 'Admin',
        state: 'KA',
        year: 2026,
        sequenceNumber: 1,
        department: 'Institutional Governance',
        institution: 'EduID Central Registry'
      });
    }
  } catch (error) {
    console.error('⚠️ Error seeding sample user:', error.message);
  }
}
