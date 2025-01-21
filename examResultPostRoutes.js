// routes/examResultPostRoutes.js
const express = require('express');
const db = require('./db');
const router = express.Router();
const generateStudentID = require('./generateID')
router.post('/api/add-first-term-result', (req, res) => {
    const { studentID, subject, caExam, examMark, studentName, studentClass } = req.body;
  
    // Validate the incoming data
    if (!studentID || !subject || caExam === undefined || examMark === undefined) {
      return res.status(400).send('StudentID, Subject, CA Exam, and Exam Mark are required.');
    }
  
    // Ensure caExam and examMark are numbers
    const caExamNumber = Number(caExam);
    const examMarkNumber = Number(examMark);
  
    // Check if the values are valid numbers
    if (isNaN(caExamNumber) || isNaN(examMarkNumber)) {
      return res.status(400).send('Continuous Assessment and Exam Marks must be valid numbers.');
    }
  
    // Calculate the total marks (CA + Exam)
    const total = caExamNumber + examMarkNumber;
  
    // Ensure total does not exceed 100
    if (total > 100) {
      return res.status(400).send('Total marks (CA + Exam) cannot exceed 100.');
    }
  
    // Assign grade based on total marks
    let grade = 'F';  // Default grade
    if (total >= 76 && total <= 100) {
      grade = 'A';
    } else if (total >= 65 && total <= 75) {
      grade = 'B';
    } else if (total >= 50 && total <= 64) {
      grade = 'C';
    } else if (total >= 40 && total <= 49) {
      grade = 'D';
    }
  
    // Correctly set the remark based on the grade
    let remarks = 'Fail';  // Default remark
    if (grade === 'A') {
      remarks = 'Excellent';
    } else if (grade === 'B') {
      remarks = 'Very good';
    } else if (grade === 'C') {
      remarks = 'Credit';
    } else if (grade === 'D') {
      remarks = 'Pass';
    }
  
    // SQL query to insert the result into the first_term table
    const query = 
      `INSERT INTO first_term (studentID, subject, caExam, examMark, total, grade, remarks, studentName, studentClass)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
  
    // Execute the query
    db.query(query, [studentID, subject, caExamNumber, examMarkNumber, total, grade, remarks, studentName, studentClass], (err, result) => {
      if (err) {
        return res.status(500).send('Error inserting result');
      }
      res.status(200).send({ message: 'Result inserted successfully!' });
    });
  });
  
router.post('/api/add-second-term-result', (req, res) => {
    const { studentID, subject, caExam, examMark, studentName, studentClass } = req.body;
  
    // Validate the incoming data
    if (!studentID || !subject || caExam === undefined || examMark === undefined) {
      return res.status(400).send('StudentID, Subject, CA Exam, and Exam Mark are required.');
    }
  
    // Ensure caExam and examMark are numbers (parse them to ensure no string concatenation happens)
    const caExamNumber = Number(caExam);
    const examMarkNumber = Number(examMark);
  
    // Check if the values are valid numbers
    if (isNaN(caExamNumber) || isNaN(examMarkNumber)) {
      return res.status(400).send('Continuous Assessment and Exam Marks must be valid numbers.');
    }
  
    // Calculate the total marks (CA + Exam)
    const total = caExamNumber + examMarkNumber;
  
    // Ensure total does not exceed 100
    if (total > 100) {
      return res.status(400).send('Total marks (CA + Exam) cannot exceed 100.');
    }
  
    // Assign grade based on total marks
    let grade = 'F';  // Default grade
    if (total >= 76 && total <= 100) {
      grade = 'A';
    } else if (total >= 65 && total <= 75) {
      grade = 'B';
    } else if (total >= 50 && total <= 64) {
      grade = 'C';
    } else if (total >= 40 && total <= 49) {
      grade = 'D';
    }
  
    // Correctly set the remark based on the grade
    let remarks = 'Fail';  // Default remark
    if (grade === 'A') {
      remarks = 'Excellent';
    } else if (grade === 'B') {
      remarks = 'Very good';
    } else if (grade === 'C') {
      remarks = 'Credit';
    } else if (grade === 'D') {
      remarks = 'Pass';
    }
  
  
    // SQL query to insert the result into the first_term table
    const query = `
      INSERT INTO second_term (studentID, subject, caExam, examMark, total, grade, remarks, studentName, studentClass)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);
    `;
  
    // Execute the query
    db.query(query, [studentID, subject, caExamNumber, examMarkNumber, total, grade, remarks, studentName, studentClass], (err, result) => {
      if (err) {
        return res.status(500).send('Error inserting result');
      }
      res.status(200).send({ message: 'Result inserted successfully!' });
    });
  });
   // add third term exam
   router.post('/api/add-third-term-result', (req, res) => {
    const { studentID, subject, caExam, examMark, studentName, studentClass } = req.body;
  
    // Validate the incoming data
    if (!studentID || !subject || caExam === undefined || examMark === undefined) {
      return res.status(400).send('StudentID, Subject, CA Exam, and Exam Mark are required.');
    }
  
    // Ensure caExam and examMark are numbers (parse them to ensure no string concatenation happens)
    const caExamNumber = Number(caExam);
    const examMarkNumber = Number(examMark);
  
    // Check if the values are valid numbers
    if (isNaN(caExamNumber) || isNaN(examMarkNumber)) {
      return res.status(400).send('Continuous Assessment and Exam Marks must be valid numbers.');
    }
  
    // Calculate the total marks (CA + Exam)
    const total = caExamNumber + examMarkNumber;
  
    // Ensure total does not exceed 100
    if (total > 100) {
      return res.status(400).send('Total marks (CA + Exam) cannot exceed 100.');
    }
  
    // Assign grade based on total marks
    let grade = 'F';  // Default grade
    if (total >= 76 && total <= 100) {
      grade = 'A';
    } else if (total >= 65 && total <= 75) {
      grade = 'B';
    } else if (total >= 50 && total <= 64) {
      grade = 'C';
    } else if (total >= 40 && total <= 49) {
      grade = 'D';
    }
  
    // Correctly set the remark based on the grade
    let remarks = 'Fail';  // Default remark
    if (grade === 'A') {
      remarks = 'Excellent';
    } else if (grade === 'B') {
      remarks = 'Very good';
    } else if (grade === 'C') {
      remarks = 'Credit';
    } else if (grade === 'D') {
      remarks = 'Pass';
    }
  
  
    // SQL query to insert the result into the first_term table
    const query = `
      INSERT INTO third_term (studentID, subject, caExam, examMark, total, grade, remarks, studentName, studentClass)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);
    `;
  
    // Execute the query
    db.query(query, [studentID, subject, caExamNumber, examMarkNumber, total, grade, remarks, studentName, studentClass], (err, result) => {
      if (err) {
        return res.status(500).send('Error inserting result');
      }
      res.status(200).send({ message: 'Result inserted successfully!' });
    });
  });

  router.post('/api/addSubject', (req, res) => {
    const { subject_name, subject_code, description } = req.body;
  
    // Validate the incoming data
    if (!subject_name || !subject_code) {
      return res.status(400).send('Subject name and subject code are required');
    }
  
    const query = 
      `INSERT INTO subject (subject_name, subject_code, description)
      VALUES (?, ?, ?)`;
  
    // Execute the query
    db.query(query, [subject_name, subject_code, description], (err, result) => {
      if (err) {
        return res.status(500).send('Error inserting result');
      }
      res.status(200).send({ message: 'Subject inserted successfully!' });
    });
  });
  router.put('/api/updateSubject/:subjectCode', (req, res) => { 
    const { subjectName, subjectDescription } = req.body;
    const { subjectCode } = req.params;
  
    // Validate the incoming data
    if (!subjectName || !subjectCode) {
      return res.status(400).send('Subject name and subject code are required');
    }
  
    const query = `
      UPDATE subject 
      SET subject_name = ?, description = ? 
      WHERE subject_code = ?
    `;
    db.query(query, [subjectName, subjectDescription, subjectCode], (err, result) => {
      if (err) {
        return res.status(500).send('Error updating subject');
      }
      if (result.affectedRows === 0) {
        return res.status(404).send('Subject not found');
      }
      res.status(200).send({ message: 'Subject updated successfully!' });
    });
  });
  
  router.delete('/api/deleteSubject/:subjectCode', (req, res) => {
    const { subjectCode } = req.params;
  
    // Validate the subjectCode
    if (!subjectCode) {
      return res.status(400).send('Subject code is required');
    }
  
    const query = `DELETE FROM subject WHERE subject_code = ?`;
  
    // Execute the query to delete the subject
    db.query(query, [subjectCode], (err, result) => {
      if (err) {
        return res.status(500).send('Error deleting subject');
      }
      if (result.affectedRows === 0) {
        return res.status(404).send('Subject not found');
      }
      res.status(200).send({ message: 'Subject deleted successfully!' });
    });
  });
 
module.exports = router;
