// postRoutes.js
const express = require('express');
const db = require('./db');
const generateStudentID = require('./generateID');

const router = express.Router();

    router.post('/addStaff', (req, res) => { 
      const { name, department, phone, email, subject, courseOfStudy } = req.body;
    
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
          INSERT INTO staff (staffID, name, department, phone, email, subject, courseOfStudy)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        const staffData = [
          staffID,          // Generated staffID
          name,             // Name
          department,       // Department
          phone,            // Phone
          email,            // Email
          subject,          // Subject (can be optional)
          courseOfStudy     // Course of Study (can be optional)
        ];
    
        db.query(staffQuery, staffData, (err, results) => {
          if (err) {
            console.error('Error inserting staff record:', err);
            if (err.code === 'ER_DUP_ENTRY') {
              return res.status(400).json({ error: 'Staff ID already exists. Please try again.' });
            }
            return res.status(500).json({ error: 'Error inserting staff record' });
          }
    
          // Insert user record for staff with default password '12345' and role 'staff'
          const userQuery = `
            INSERT INTO users (name, staffID, password, role)
            VALUES (?, ?, ?, 'staff')
          `;
          db.query(userQuery, [name, staffID, '12345'], (err, result) => {
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
    


// POST route to add a student
router.post('/add-student', (req, res) => {
  const { name, section, class: className, dob, guidanceName, guidanceContact, gender } = req.body;

  if (!name || !section || !className || !dob || !guidanceName || !guidanceContact || !gender) {
    return res.status(400).send('Please fill out all fields correctly.');
  }

  const year = new Date().getFullYear(); // Current year
  generateStudentID(section, className, year, (err, studentID) => {
    if (err) {
      console.error("Error generating student ID:", err);
      return res.status(500).send('Error generating student ID');
    }

    let table = '';
    if (section === 'Primary') table = 'primary_students';
    else if (section === 'Junior') table = 'junior_students';
    else if (section === 'Senior') table = 'senior_students';

    if (!table) return res.status(400).send('Invalid section');

    const checkQuery = `SELECT COUNT(*) AS count FROM ${table} WHERE studentID = ?`;
    db.query(checkQuery, [studentID], (err, result) => {
      if (err) return res.status(500).send('Error checking student ID');
      if (result[0].count > 0) return res.status(400).send('Student ID already exists');

      const insertStudentQuery = `
        INSERT INTO ${table} (studentID, name, section, class, dob, guidanceName, guidanceContact, gender)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `;
      db.query(insertStudentQuery, [studentID, name, section, className, dob, guidanceName, guidanceContact, gender], (err) => {
        if (err) return res.status(500).send('Error saving student record');

        const insertUserQuery = `
          INSERT INTO users (name, studentID, password, role)
          VALUES (?, ?, ?, 'student')
        `;
        db.query(insertUserQuery, [name, studentID, '12345'], (err) => {
          if (err) return res.status(500).send('Error saving user record');
          res.status(200).send({ message: 'Student and user records saved successfully!', studentID });
        });
      });
    });
  });
});

router.post('/api/add-first-term-result', (req, res) => {
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
      INSERT INTO first_term (studentID, subject, caExam, examMark, total, grade, remarks, studentName, studentClass)
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
router.post('/api/login', (req, res) => {
    const { username, password } = req.body;
  
    // Query to check if the user exists by staffID or studentID
    const query = `SELECT * FROM users WHERE (staffID = ? OR studentID = ?) AND password = ?`;
  
    db.query(query, [username, username, password], (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).send('Server error');
      }
  
      if (results.length === 0) {
        return res.status(401).send('Invalid username or password');
      }
  
      const user = results[0];
      let role = '';
      if (user.staffID) {
        role = 'Staff';
      } else if (user.studentID) {
        role = 'Student';
      }
  
      // Send back user role
      res.json({ role });
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
  

module.exports = router;
