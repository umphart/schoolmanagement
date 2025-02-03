const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const db = require('./db');
const bcrypt = require('bcrypt');
const generateStudentID = require('./generateID');
const generateStaffID = require('./generateStaffID');
const app = express();
const studentPostRoutes = require('./studentPostRoutes');
const studentGetRoutes = require('./studentGetRoutes');
const studentPutRoutes = require('./studentPutRoutes');
const studentDeleteRoutes = require('./studentDeleteRoutes');
const staffGetRoutes = require('./staffGetRoutes');
const staffPostRoutes = require('./staffPostRoutes');
const staffPutRoutes = require('./staffPutRoutes');
const staffDeleteRoutes = require('./staffDeleteRoutes');
const examResultPostRoutes = require('./examResultPostRoutes');  
const examResultGetRoutes = require('./examResultGetRoutes'); 
const putRoutes = require('./putRoutes')
const deleteRoutes= require('./deleteRoutes')
const path = require('path');

const port = 5000;

// Middleware
app.use(cors());  // To handle CORS requests from React frontend
app.use(bodyParser.json());  // To parse JSON request bodies

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(studentPostRoutes);
app.use(studentGetRoutes);
app.use(studentPutRoutes);
app.use(studentDeleteRoutes);
app.use(staffGetRoutes);
app.use(staffPostRoutes);
app.use(staffPutRoutes);
app.use(staffDeleteRoutes);
app.use(examResultPostRoutes); 
app.use(examResultGetRoutes); 
app.use(putRoutes)
app.use(deleteRoutes)


 
app.post('/api/login', (req, res) => {  
  const { username, password } = req.body;

  // Query to fetch all student and staff details along with profile photo
  const query = `
    SELECT staffID, studentID, name, section, class, dob, guidanceName, guidanceContact, profilePhoto, email, phone, department, gender
    FROM users
    WHERE (staffID = ? OR studentID = ?) AND password = ?
  `;

  db.query(query, [username, username, password], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Server error');
    }

    if (results.length === 0) {
      return res.status(401).send('Invalid username or password');
    }

    const user = results[0];
    let role = user.staffID ? 'Staff' : 'Student';

    res.json({
      role,
      staffID: user.staffID || null,
      studentID: user.studentID || null,
      email: user.email,
      phone: user.phone, // staff phone
      department: user.department, // staff department
      name: user.name,
      section: user.section,
      class: user.class,
      dob: user.dob,
      gender: user.gender, // staff gender
      guidanceName: user.guidanceName,
      guidanceContact: user.guidanceContact,
      profilePhoto: user.profilePhoto,
    });
  });
});
// app.put('/api/updateStaffPassword', (req, res) => {
//   const { userID, currentPassword, newPassword } = req.body;

//   // Check if required fields are present
//   if (!userID || !currentPassword || !newPassword) {
//     return res.status(400).json({ message: 'All fields (userID, currentPassword, newPassword) are required.' });
//   }

//   // Query to check if the staff exists
//   const checkQuery = 'SELECT * FROM users WHERE staffID = ?';
//   db.query(checkQuery, [userID], (err, results) => {
//     if (err) {
//       console.error('Database error:', err);
//       return res.status(500).json({ message: 'Server error while querying database.' });
//     }

//     if (results.length === 0) {
//       return res.status(404).json({ message: 'Staff ID not found.' });
//     }

//     const storedPassword = results[0].password;

//     // Compare current password with the stored one
//     bcrypt.compare(currentPassword, storedPassword, (compareErr, isMatch) => {
//       if (compareErr) {
//         console.error('Password comparison error:', compareErr);
//         return res.status(500).json({ message: 'Error comparing passwords.' });
//       }

//       if (!isMatch) {
//         return res.status(401).json({ message: 'Current password is incorrect.' });
//       }

//       // Hash and update the new password
//       bcrypt.hash(newPassword, 10, (hashErr, hashedPassword) => {
//         if (hashErr) {
//           console.error('Password hashing error:', hashErr);
//           return res.status(500).json({ message: 'Error hashing new password.' });
//         }

//         // Query to update password
//         const updateQuery = 'UPDATE users SET password = ? WHERE staffID = ?';
//         db.query(updateQuery, [hashedPassword, userID], (updateErr) => {
//           if (updateErr) {
//             console.error('Error updating password:', updateErr);
//             return res.status(500).json({ message: 'Error updating password in database.' });
//           }

//           res.status(200).json({ message: 'Password updated successfully.' });
//         });
//       });
//     });
//   });
// });

// app.put('/api/updatePassword', (req, res) => { 
//   console.log("Received data:", req.body);

//   const { userID, role, currentPassword, newPassword } = req.body;

//   if (!userID || !role || !currentPassword || !newPassword) {
//     console.error("Missing fields:", req.body);
//     return res.status(400).json({ message: 'All fields (userID, role, currentPassword, newPassword) are required.' });
//   }
//     let tableName = '';
//     let idColumn = '';

//     // Determine the table and column based on role
//     if (role === 'Staff') {
//       tableName = 'users';
//       idColumn = 'staffID';
//     } else if (role === 'Student') {
//       tableName = 'students';
//       idColumn = 'studentID';
//     } else {
//       return res.status(400).json({ message: 'Invalid role.' });
//     }

//     // Query to check if the user exists
//     const checkQuery = `SELECT * FROM ${tableName} WHERE ${idColumn} = ?`;
//     db.query(checkQuery, [userID], (err, results) => {
//       if (err) {
//         console.error('Database error:', err);
//         return res.status(500).json({ message: 'Server error while querying database.' });
//       }

//       if (results.length === 0) {
//         return res.status(404).json({ message: `${role} ID not found.` });
//       }

//       const storedPassword = results[0].password;

//       // Compare current password with the stored one
//       bcrypt.compare(currentPassword, storedPassword, (compareErr, isMatch) => {
//         if (compareErr) {
//           console.error('Password comparison error:', compareErr);
//           return res.status(500).json({ message: 'Error comparing passwords.' });
//         }

//         if (!isMatch) {
//           return res.status(401).json({ message: 'Current password is incorrect.' });
//         }

//         // Hash and update the new password
//         bcrypt.hash(newPassword, 10, (hashErr, hashedPassword) => {
//           if (hashErr) {
//             console.error('Password hashing error:', hashErr);
//             return res.status(500).json({ message: 'Error hashing new password.' });
//           }

//           // Query to update password
//           const updateQuery = `UPDATE ${tableName} SET password = ? WHERE ${idColumn} = ?`;
//           db.query(updateQuery, [hashedPassword, userID], (updateErr) => {
//             if (updateErr) {
//               console.error('Error updating password:', updateErr);
//               return res.status(500).json({ message: 'Error updating password in database.' });
//             }

//             res.status(200).json({ message: 'Password updated successfully.' });
//           });
//         });
//       });
//     });
//   });
// const jwt = require('jsonwebtoken'); // Assuming you're using JWT for authentication
// app.put('/api/updateStudentPassword', (req, res) => {
//   const { userID, currentPassword, newPassword } = req.body;

//   // Check if required fields are present
//   if (!userID || !currentPassword || !newPassword) {
//     return res.status(400).json({ message: 'All fields (userID, currentPassword, newPassword) are required.' });
//   }

//   // Check if token is provided in the request headers
//   const token = req.headers['authorization']?.split(' ')[1];
//   if (!token) {
//     return res.status(401).json({ message: 'Authentication required.' });
//   }

//   // Verify the provided token
//   jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
//     if (err) {
//       return res.status(401).json({ message: 'Invalid or expired token.' });
//     }

//     // Check if student exists in the database
//     const checkQuery = 'SELECT * FROM users WHERE studentID = ?';
//     db.query(checkQuery, [userID], (err, results) => {
//       if (err) {
//         console.error('Database error:', err);
//         return res.status(500).json({ message: 'Server error while querying database.' });
//       }

//       if (results.length === 0) {
//         return res.status(404).json({ message: 'Student ID not found.' });
//       }

//       const storedPassword = results[0].password;

//       // Compare current password with the stored hashed password
//       bcrypt.compare(currentPassword, storedPassword, (compareErr, isMatch) => {
//         if (compareErr) {
//           console.error('Password comparison error:', compareErr);
//           return res.status(500).json({ message: 'Error comparing passwords.' });
//         }

//         if (!isMatch) {
//           return res.status(401).json({ message: 'Current password is incorrect.' });
//         }

//         // Hash and update the new password
//         bcrypt.hash(newPassword, 10, (hashErr, hashedPassword) => {
//           if (hashErr) {
//             console.error('Password hashing error:', hashErr);
//             return res.status(500).json({ message: 'Error hashing new password.' });
//           }

//           // Update the password in the database
//           const updateQuery = 'UPDATE users SET password = ? WHERE studentID = ?';
//           db.query(updateQuery, [hashedPassword, userID], (updateErr) => {
//             if (updateErr) {
//               console.error('Error updating password:', updateErr);
//               return res.status(500).json({ message: 'Error updating password in database.' });
//             }

//             res.status(200).json({ message: 'Password updated successfully.' });
//           });
//         });
//       });
//     });
//   });
// });


// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
