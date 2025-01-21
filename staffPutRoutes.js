// routes/studentGetRoutes.js
const express = require('express');
const db = require('./db');
const router = express.Router();

// Update Staff Route
router.put('/api/staff/update/:staffId', (req, res) => {
    const staffId = decodeURIComponent(req.params.staffId);  // Ensure this is properly decoded
    
    const { name, department, phone, email, subject, gender } = req.body;
  
    // Update staff record in the database
    const updateQuery = `
      UPDATE staff
      SET name = ?, department = ?, phone = ?, email = ?, subject = ?, gender = ?
      WHERE staffID = ?
    `;
    const updateData = [name, department, phone, email, subject, gender, staffId];  // <-- Use staffId here
    
    db.query(updateQuery, updateData, (err, result) => {
      if (err) {
        console.error('Error updating staff record:', err);
        return res.status(500).json({ error: 'Error updating staff record' });
      }
  
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Staff member not found' });
      }
  
      return res.status(200).json({
        message: 'Staff record updated successfully',
        staffId // Return the updated staff ID
      });
    });
  });
  router.get('/api/staff/:staffId', (req, res) => {
    const staffId = decodeURIComponent(req.params.staffId);

    // Query to fetch staff data from the database
    const query = 'SELECT * FROM staff WHERE staffID = ?';
    db.query(query, [staffId], (err, result) => {
        if (err) {
            console.error('Error fetching staff record:', err);
            return res.status(500).json({ error: 'Error fetching staff record' });
        }

        if (result.length === 0) {
            return res.status(404).json({ error: 'Staff member not found' });
        }

        return res.status(200).json(result[0]);  // Assuming you're fetching a single staff record
    });
});

  router.put('/api/updatePassword', (req, res) => {
    const { staffID, currentPassword, newPassword } = req.body;
  
    if (!staffID || !currentPassword || !newPassword) {
      return res.status(400).json({ message: 'All fields are required.' });
    }
  
    // Check if the current password matches
    const checkQuery = `SELECT * FROM users WHERE staffID = ? AND password = ?`;
    db.query(checkQuery, [staffID, currentPassword], (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: 'Server error.' });
      }
  
      if (results.length === 0) {
        return res.status(401).json({ message: 'Current password is incorrect.' });
      }
  
      // Update the password
      const updateQuery = `UPDATE users SET password = ? WHERE staffID = ?`;
      db.query(updateQuery, [newPassword, staffID], (updateErr) => {
        if (updateErr) {
          console.error(updateErr);
          return res.status(500).json({ message: 'Error updating password.' });
        }
  
        res.status(200).json({ message: 'Password updated successfully.' });
      });
    });
  });
  

module.exports = router;
