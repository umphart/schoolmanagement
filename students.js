const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const db = require('./db');
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

const port = 5000;

// Middleware
app.use(cors());  // To handle CORS requests from React frontend
app.use(bodyParser.json());  // To parse JSON request bodies

    
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


app.put('/api/updatePassword', (req, res) => {
  const { staffID, currentPassword, newPassword } = req.body;

  if (!staffID || !currentPassword || !newPassword) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  // Log input data for debugging
  console.log('Request Data:', { staffID, currentPassword, newPassword });

  const checkQuery = `SELECT * FROM users WHERE staffID = ?`;
  db.query(checkQuery, [staffID], (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ message: 'Server error.' });
    }

    if (results.length === 0) {
      console.log('Staff ID not found.');
      return res.status(404).json({ message: 'Staff ID not found.' });
    }

    const storedPassword = results[0].password;

    // Log the password comparison process
    console.log('Stored Password:', storedPassword);

    bcrypt.compare(currentPassword, storedPassword, (compareErr, isMatch) => {
      if (compareErr) {
        console.error('Error comparing passwords:', compareErr);
        return res.status(500).json({ message: 'Server error.' });
      }

      console.log('Password match status:', isMatch);

      if (!isMatch) {
        return res.status(401).json({ message: 'Current password is incorrect.' });
      }

      // Hash the new password and update
      bcrypt.hash(newPassword, 10, (hashErr, hashedPassword) => {
        if (hashErr) {
          console.error('Error hashing password:', hashErr);
          return res.status(500).json({ message: 'Error hashing password.' });
        }

        const updateQuery = `UPDATE users SET password = ? WHERE staffID = ?`;
        db.query(updateQuery, [hashedPassword, staffID], (updateErr) => {
          if (updateErr) {
            console.error('Error updating password:', updateErr);
            return res.status(500).json({ message: 'Error updating password.' });
          }

          console.log('Password updated successfully.');
          res.status(200).json({ message: 'Password updated successfully.' });
        });
      });
    });
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
