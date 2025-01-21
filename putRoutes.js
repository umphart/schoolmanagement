// putRoutes.js
const express = require('express');
const db = require('./db');

const router = express.Router();
// Update first term record with automatic total, grade, and remarks calculation
router.put('/api/update-first/:id', (req, res) => {
  const { id } = req.params; // Extract the record ID from the URL
  const { subject, caExam, examMark } = req.body; // Extract the updated data from the request body

  // Convert caExam and examMark to numbers for calculations
  const caExamNumber = Number(caExam);
  const examMarkNumber = Number(examMark);

  // Calculate the total marks (CA + Exam)
  const total = caExamNumber + examMarkNumber;

  // Ensure total does not exceed 100
  if (total > 100) {
    return res.status(400).json({ message: 'Total marks (CA + Exam) cannot exceed 100.' });
  }

  // Assign grade based on total marks
  let grade = 'F'; // Default grade
  if (total >= 76 && total <= 100) {
    grade = 'A';
  } else if (total >= 65 && total <= 75) {
    grade = 'B';
  } else if (total >= 50 && total <= 64) {
    grade = 'C';
  } else if (total >= 40 && total <= 49) {
    grade = 'D';
  }

  // Assign remarks based on the grade
  let remarks = 'Fail'; // Default remark
  if (grade === 'A') {
    remarks = 'Excellent';
  } else if (grade === 'B') {
    remarks = 'Very good';
  } else if (grade === 'C') {
    remarks = 'Credit';
  } else if (grade === 'D') {
    remarks = 'Pass';
  }

  // SQL query to update the record
  const query = `
    UPDATE first_term 
    SET subject = ?, caExam = ?, examMark = ?, total = ?, grade = ?, remarks = ?
    WHERE id = ?;
  `;

  // Execute the query
  db.query(query, [subject, caExamNumber, examMarkNumber, total, grade, remarks, id], (err, results) => {
    if (err) {
      console.error('Error updating record:', err);
      return res.status(500).json({ message: 'Server error' });
    }

    if (results.affectedRows === 0) {
      return res.status(404).json({ message: 'Record not found' });
    }

    res.json({ message: 'Record updated successfully', total, grade, remarks });
  });
});

router.put('/api/update-second/:id', (req, res) => {
  const { id } = req.params; // Extract the record ID from the URL
  const { subject, caExam, examMark } = req.body; // Extract the updated data from the request body

  // Convert caExam and examMark to numbers for calculations
  const caExamNumber = Number(caExam);
  const examMarkNumber = Number(examMark);

  // Calculate the total marks (CA + Exam)
  const total = caExamNumber + examMarkNumber;

  // Ensure total does not exceed 100
  if (total > 100) {
    return res.status(400).json({ message: 'Total marks (CA + Exam) cannot exceed 100.' });
  }

  // Assign grade based on total marks
  let grade = 'F'; // Default grade
  if (total >= 76 && total <= 100) {
    grade = 'A';
  } else if (total >= 65 && total <= 75) {
    grade = 'B';
  } else if (total >= 50 && total <= 64) {
    grade = 'C';
  } else if (total >= 40 && total <= 49) {
    grade = 'D';
  }

  // Assign remarks based on the grade
  let remarks = 'Fail'; // Default remark
  if (grade === 'A') {
    remarks = 'Excellent';
  } else if (grade === 'B') {
    remarks = 'Very good';
  } else if (grade === 'C') {
    remarks = 'Credit';
  } else if (grade === 'D') {
    remarks = 'Pass';
  }

  // SQL query to update the record
  const query = `
    UPDATE second_term 
    SET subject = ?, caExam = ?, examMark = ?, total = ?, grade = ?, remarks = ?
    WHERE id = ?;
  `;

  // Execute the query
  db.query(query, [subject, caExamNumber, examMarkNumber, total, grade, remarks, id], (err, results) => {
    if (err) {
      console.error('Error updating record:', err);
      return res.status(500).json({ message: 'Server error' });
    }

    if (results.affectedRows === 0) {
      return res.status(404).json({ message: 'Record not found' });
    }

    res.json({ message: 'Record updated successfully', total, grade, remarks });
  });
});
router.put('/api/update-third/:id', (req, res) => {
  const { id } = req.params; // Extract the record ID from the URL
  const { subject, caExam, examMark } = req.body; // Extract the updated data from the request body

  // Convert caExam and examMark to numbers for calculations
  const caExamNumber = Number(caExam);
  const examMarkNumber = Number(examMark);

  // Calculate the total marks (CA + Exam)
  const total = caExamNumber + examMarkNumber;

  // Ensure total does not exceed 100
  if (total > 100) {
    return res.status(400).json({ message: 'Total marks (CA + Exam) cannot exceed 100.' });
  }

  // Assign grade based on total marks
  let grade = 'F'; // Default grade
  if (total >= 76 && total <= 100) {
    grade = 'A';
  } else if (total >= 65 && total <= 75) {
    grade = 'B';
  } else if (total >= 50 && total <= 64) {
    grade = 'C';
  } else if (total >= 40 && total <= 49) {
    grade = 'D';
  }

  // Assign remarks based on the grade
  let remarks = 'Fail'; // Default remark
  if (grade === 'A') {
    remarks = 'Excellent';
  } else if (grade === 'B') {
    remarks = 'Very good';
  } else if (grade === 'C') {
    remarks = 'Credit';
  } else if (grade === 'D') {
    remarks = 'Pass';
  }

  // SQL query to update the record
  const query = `
    UPDATE third_term 
    SET subject = ?, caExam = ?, examMark = ?, total = ?, grade = ?, remarks = ?
    WHERE id = ?;
  `;

  // Execute the query
  db.query(query, [subject, caExamNumber, examMarkNumber, total, grade, remarks, id], (err, results) => {
    if (err) {
      console.error('Error updating record:', err);
      return res.status(500).json({ message: 'Server error' });
    }

    if (results.affectedRows === 0) {
      return res.status(404).json({ message: 'Record not found' });
    }

    res.json({ message: 'Record updated successfully', total, grade, remarks });
  });
});

// PUT route to update student details (example)
router.put('/update-student/:studentId', (req, res) => {
  const { studentId } = req.params;
  const { name, section, class: className, dob, guidanceName, guidanceContact, gender } = req.body;

  if (!name || !section || !className || !dob || !guidanceName || !guidanceContact || !gender) {
    return res.status(400).send('Please provide all fields');
  }

  const updateQuery = `
    UPDATE students 
    SET name = ?, section = ?, class = ?, dob = ?, guidanceName = ?, guidanceContact = ?, gender = ?
    WHERE studentID = ?
  `;
  db.query(updateQuery, [name, section, className, dob, guidanceName, guidanceContact, gender, studentId], (err) => {
    if (err) {
      return res.status(500).send('Error updating student record');
    }

    res.status(200).send({ message: 'Student updated successfully' });
  });
});
// Update first term record with automatic total, grade, and remarks calculation

  // route to update student
  router.put('/api/students/update/:studentId', (req, res) => {
    const { studentId } = req.params;
    const { name, section, class: studentClass, dob, guidanceContact } = req.body;
    // Ensure the class is valid
    let table = '';
    if (studentClass === 'primary') {
      table = 'primary_students';
    } else if (studentClass === 'junior') {
      table = 'junior_students';
    } else if (studentClass === 'senior') {
      table = 'senior_students';
    }
    if (!table) {
      return res.status(400).send('Invalid class specified');
    }
    // Proceed with the update query if all is valid
    const query = `
      UPDATE ${table}
      SET name = ?, section = ?, class = ?, dob = ?, guidanceContact = ?
      WHERE studentID = ?;
    `;
    db.query(query, [name, section, studentClass, dob, guidanceContact, studentId], (err, result) => {
      if (err) {
        return res.status(500).send('Error updating student record');
      }
  
      if (result.affectedRows === 0) {
        return res.status(404).send('Student not found');
      }
  
      res.json({ message: 'Student updated successfully' });
    });
  });
            
module.exports = router;
