// routes/studentPutRoutes.js
const express = require('express');
const db = require('./db');
const router = express.Router();

// PUT route to update student information (example)
router.put('/api/update-student/:studentId', (req, res) => {
  const { studentId } = req.params;
  const { name, section, class: className, dob, guidanceName, guidanceContact, gender } = req.body;

  const updateQuery = `
    UPDATE students
    SET name = ?, section = ?, class = ?, dob = ?, guidanceName = ?, guidanceContact = ?, gender = ?
    WHERE studentID = ?
  `;

  db.query(updateQuery, [name, section, className, dob, guidanceName, guidanceContact, gender, studentId], (err, result) => {
    if (err) {
      return res.status(500).send('Error updating student information');
    }

    if (result.affectedRows === 0) {
      return res.status(404).send('Student not found');
    }

    res.status(200).send({ message: 'Student updated successfully' });
  });
});

// Add more PUT routes as needed...

module.exports = router;
