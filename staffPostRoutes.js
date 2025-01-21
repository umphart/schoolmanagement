const express = require('express'); 
const db = require('./db');
const router = express.Router();
const generateStaffID = require('./generateStaffID');
const multer = require('multer');
const path = require('path');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Folder to save the uploaded files
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`); // Unique file name
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const fileTypes = /jpeg|jpg|png/;
    const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = fileTypes.test(file.mimetype);

    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed (jpeg, jpg, png)'));
    }
  },
});

// POST route to add staff
router.post('/addStaff', upload.single('photo'), (req, res) => { 
  const { name, department, phone, email, gender } = req.body;
  const profilePhoto = req.file ? req.file.filename : null; // Get the uploaded file name if exists

  // Ensure all required fields are provided
  if (!name || !department || !phone || !email || !gender) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  // Get the current year for staff ID generation
  const year = new Date().getFullYear();

  // Generate staff ID
  generateStaffID(department, year, (err, staffID) => {
    if (err) {
      console.error('Error generating staff ID:', err);
      return res.status(500).json({ error: 'Error generating staff ID' });
    }

    // Insert staff record into the staff table
    const staffQuery = `
      INSERT INTO staff (staffID, name, department, phone, email, gender, profilePhoto)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    const staffData = [
      staffID,          // Generated staffID
      name,             // Name
      department,       // Department
      phone,            // Phone
      email,            // Email
      gender,           // Gender
      profilePhoto      // Profile photo filename (if exists)
    ];

    db.query(staffQuery, staffData, (err, results) => {
      if (err) {
        console.error('Error inserting staff record:', err);
        if (err.code === 'ER_DUP_ENTRY') {
          return res.status(400).json({ error: 'Staff ID already exists. Please try again.' });
        }
        return res.status(500).json({ error: 'Error inserting staff record' });
      }

      // Insert user record for staff with department, email, gender, phone, default password '12345', and role 'staff'
      const userQuery = `
        INSERT INTO users (name, staffID, password, role, profilePhoto, department, email, gender, phone)
        VALUES (?, ?, ?, 'staff', ?, ?, ?, ?, ?)
      `;
      db.query(userQuery, [name, staffID, '12345', profilePhoto, department, email, gender, phone], (err, result) => {
        if (err) {
          console.error('Error inserting user record for staff:', err);
          return res.status(500).json({ error: 'Error saving user record for staff' });
        }

        // Return success message and staffID
        return res.status(200).json({
          message: 'Staff added successfully, and user record created',
          staffID: staffID
        });
      });
    });
  });
});


router.post('/api/assignSubject', (req, res) => {
  const { staffID, subject_code, staff_name, subject_name } = req.body;

  // Validate input
  if (!staffID || !subject_code) {
    return res.status(400).json({ message: 'Staff ID and Subject Code are required.' });
  }

  // SQL query to insert a new assignment to the staff_subjects table
  const insertAssignmentQuery = `
    INSERT INTO staff_subjects (staffID, subject_code, staffName, subjectName)
    VALUES (?, ?, ?, ?)
  `;

  db.query(insertAssignmentQuery, [staffID, subject_code, staff_name, subject_name], (err, result) => {
    if (err) {
      console.error('Error assigning subject:', err);
      return res.status(500).json({ message: 'Error assigning subject.' });
    }

    // Respond with success message
    res.status(200).json({ message: `${subject_name} has been successfully assigned to ${staff_name}.` });
  });
});

// Route for unassigning a subject from a staff member
router.post('/api/unassignSubject', (req, res) => {
  const { staffID, subject_code, staff_name, subject_name } = req.body;

  // Validate input
  if (!staffID || !subject_code) {
    return res.status(400).json({ message: 'Staff ID and Subject Code are required.' });
  }

  // SQL query to remove subject assignment from staff
  const deleteAssignmentQuery = `
    DELETE FROM staff_subjects 
    WHERE staffID = ? AND subject_code = ?
  `;

  db.query(deleteAssignmentQuery, [staffID, subject_code], (err, result) => {
    if (err) {
      console.error('Error removing subject assignment:', err);
      return res.status(500).json({ message: 'Error unassigning subject.' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'No matching assignment found.' });
    }

    // Respond with success message
    res.status(200).json({ message: `${subject_name} has been unassigned from ${staff_name} successfully.` });
  });
});

module.exports = router;
