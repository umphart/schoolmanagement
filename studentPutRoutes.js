const express = require('express');
const router = express.Router();
const multer = require('multer');
const db = require('./db'); // assuming you have your DB setup

// Set up multer for file handling
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // path to store uploaded files
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname); // unique file name
  }
});

const upload = multer({ storage: storage });

router.put('/api/students/update/:studentID', upload.single('photo'), (req, res) => {
  const { studentID } = req.params;
  const { name, section, class: className, dob, guidanceContact } = req.body;
  const photo = req.file ? req.file.filename : null; // handle the new photo if present

  // Determine which table to update based on the section
  let table = '';
  if (section === 'Primary') {
    table = 'primary_students';
  } else if (section === 'Junior') {
    table = 'junior_students';
  } else if (section === 'Senior') {
    table = 'senior_students';
  } else {
    return res.status(400).send('Invalid section');
  }

  // SQL query to update student record
  let updateStudentQuery = `UPDATE ${table} SET name = ?, section = ?, class = ?, dob = ?, guidanceContact = ?`;

  // If there is a photo, add it to the query
  if (photo) {
    updateStudentQuery += `, profilePhoto = ?`;
  }

  updateStudentQuery += ` WHERE studentID = ?`;

  const studentParams = photo ? [name, section, className, dob, guidanceContact, photo, studentID] 
                              : [name, section, className, dob, guidanceContact, studentID];

  db.query(updateStudentQuery, studentParams, (err, result) => {
    if (err) {
      console.error('Error updating student:', err);
      return res.status(500).send('Error updating student record');
    }

    if (result.affectedRows === 0) {
      return res.status(404).send('Student not found');
    }

    // Update the users table
    let updateUserQuery = `UPDATE users SET name = ?, section = ?, class = ?, dob = ?, guidanceContact = ?`;

    if (photo) {
      updateUserQuery += `, profilePhoto = ?`;
    }

    updateUserQuery += ` WHERE studentID = ?`;

    const userParams = photo ? [name, section, className, dob, guidanceContact, photo, studentID] 
                             : [name, section, className, dob, guidanceContact, studentID];

    db.query(updateUserQuery, userParams, (err, result) => {
      if (err) {
        console.error('Error updating user:', err);
        return res.status(500).send('Error updating user record');
      }

      // Check if a record exists in the term tables before updating
      let termUpdateQueries = [];
      let termParams = [];

      // Check if record exists in first_term
      termUpdateQueries.push(`
        UPDATE first_term SET studentName = ?, studentClass = ?, section = ? WHERE studentID = ?;
      `);
      termParams.push(name, className, section, studentID);

      // Check if record exists in second_term
      termUpdateQueries.push(`
        UPDATE second_term SET studentName = ?, studentClass = ?, section = ? WHERE studentID = ?;
      `);
      termParams.push(name, className, section, studentID);

      // Check if record exists in third_term
      termUpdateQueries.push(`
        UPDATE third_term SET studentName = ?, studentClass = ?, section = ? WHERE studentID = ?;
      `);
      termParams.push(name, className, section, studentID);

      // Run the term update queries separately
      termUpdateQueries.forEach((query, index) => {
        db.query(query, termParams.slice(index * 4, (index + 1) * 4), (err, result) => {
          if (err) {
            console.error(`Error updating term ${index + 1}:`, err);
            return res.status(500).send('Error updating term records');
          }
         
        });
      });

      res.status(200).send({ message: 'Student, user, and term records updated successfully (where applicable)!' });
    });
  });
});

router.put('/api/updateStudentPassword', (req, res) => {
  const { studentID, currentPassword, newPassword } = req.body;

  if (!studentID || !currentPassword || !newPassword) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  // Check if the current password matches
  const checkQuery = `SELECT * FROM users WHERE studentID = ? AND password = ?`;
  db.query(checkQuery, [studentID, currentPassword], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Server error.' });
    }

    if (results.length === 0) {
      return res.status(401).json({ message: 'Current password is incorrect.' });
    }

    // Update the password
    const updateQuery = `UPDATE users SET password = ? WHERE studentID = ?`;
    db.query(updateQuery, [newPassword, studentID], (updateErr) => {
      if (updateErr) {
        console.error(updateErr);
        return res.status(500).json({ message: 'Error updating password.' });
      }

      res.status(200).json({ message: 'Password updated successfully.' });
    });
  });
});


module.exports = router;


// router.get('/api/students/:section/:studentId', (req, res) => {
// const { section, studentId } = req.params;
// let table = '';
// if (section === 'primary') {
//   table = 'primary_students';
// } else if (section === 'junior') {
//   table = 'junior_students';
// } else if (section === 'senior') {
//   table = 'senior_students';
// }
// if (!table) {
//   return res.status(400).send('Invalid section');
// }
// const query = `SELECT FROM ${table} WHERE studentID = ?`;
// db.query(query, [studentId], (err, result) => {
//   if (err) {  
//     return res.status(500).send('Error getting student');
//   }
//   if (result.affectedRows === 0) {
//     return res.status(404).send('Student not found');
//   }
//   res.status(200).send({ message: 'Student  successfully' });
// });
// });

//   // app.get('/api/primary1', (req, res) => {
//   //   const query = `SELECT * FROM primary_students WHERE class = 'Primary 1'`;
//   //   db.query(query, (err, results) => {
//   //     if (err) {
//   //       return res.status(500).send('Error fetching student list');
//   //     }
//   //     res.json(results);
//   //   });
//   // });
//   // app.get('/api/primary2', (req, res) => {
//   //   const query = `
//   //     SELECT * 
//   //     FROM primary_students 
//   //     WHERE class = 'Primary 2'`;
//   //   db.query(query, (err, results) => {
//   //     if (err) {
//   //       return res.status(500).send('Error fetching student list');
//   //     }
//   //     res.json(results); // Return filtered students
//   //   });
//   // });
//   // app.get('/api/primary3', (req, res) => {
//   //   const query = `
//   //     SELECT * 
//   //     FROM primary_students 
//   //     WHERE class = 'primary 3'`;
//   //   db.query(query, (err, results) => {
//   //     if (err) {
//   //       return res.status(500).send('Error fetching student list');
//   //     }
//   //     res.json(results); // Return filtered students
//   //   });
//   // });
//   // app.get('/api/primary4', (req, res) => {
//   //   const query = `
//   //     SELECT * 
//   //     FROM primary_students 
//   //     WHERE class = 'primary 4'`;
  
//   //   db.query(query, (err, results) => {
//   //     if (err) {
//   //       return res.status(500).send('Error fetching student list');
//   //     }
//   //     res.json(results); // Return filtered students
//   //   });
//   // });
 
// // PUT route for updating student
// router.put('/api/students/update/:studentID', upload.single('photo'), (req, res) => {
//   const { studentID } = req.params;
//   const { name, section, class: className, dob, guidanceContact } = req.body;
//   const photo = req.file ? req.file.filename : null; // handle the new photo if present

//   // Determine which table to update based on the section
//   let table = '';
//   if (section === 'Primary') {
//     table = 'primary_students';
//   } else if (section === 'Junior') {
//     table = 'junior_students';
//   } else if (section === 'Senior') {
//     table = 'senior_students';
//   } else {
//     return res.status(400).send('Invalid section');
//   }

//   // SQL query to update student record
//   let updateQuery = `UPDATE ${table} SET name = ?, section = ?, class = ?, dob = ?, guidanceContact = ?`;

//   // If there is a photo, add to query
//   if (photo) {
//     updateQuery += `, profilePhoto = ?`;
//   }
  
//   updateQuery += ` WHERE studentID = ?`;

//   const params = photo ? [name, section, className, dob, guidanceContact, photo, studentID] : [name, section, className, dob, guidanceContact, studentID];

//   db.query(updateQuery, params, (err, result) => {
//     if (err) {
//       console.error('Error updating student:', err);
//       return res.status(500).send('Error updating student record');
//     }

//     if (result.affectedRows === 0) {
//       return res.status(404).send('Student not found');
//     }

//     res.status(200).send({ message: 'Student updated successfully!' });
//   });
// });

