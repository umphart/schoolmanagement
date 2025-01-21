const express = require('express');
const db = require('./db');
const generateStudentID = require('./generateID');
const multer = require('multer');
const path = require('path');

const router = express.Router(); // Define the router here

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

// POST route to add a student with photo
router.post('/api/add-student', upload.single('photo'), (req, res) => {
  const { name, section, class: className, dob, guidanceName, guidanceContact, gender } = req.body;
  const photo = req.file ? req.file.filename : null;

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
    if (section === 'Primary') {
      table = 'primary_students';
    } else if (section === 'Junior') {
      table = 'junior_students';
    } else if (section === 'Senior') {
      table = 'senior_students';
    }
    if (!table) {
      return res.status(400).send('Invalid section');
    }

    const checkQuery = `SELECT COUNT(*) AS count FROM ${table} WHERE studentID = ?`;
    db.query(checkQuery, [studentID], (err, result) => {
      if (err) {
        return res.status(500).send('Error checking student ID');
      }

      if (result[0].count > 0) {
        return res.status(400).send('Student ID already exists');
      }

      // Insert student data along with photo filename
      const insertStudentQuery = `
        INSERT INTO ${table} (studentID, name, section, class, dob, guidanceName, guidanceContact, gender, profilePhoto)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      db.query(insertStudentQuery, [studentID, name, section, className, dob, guidanceName, guidanceContact, gender, photo], (err) => {
        if (err) {
          console.error('SQL Query Error:', err);
          return res.status(500).send('Error saving student record');
        }

        // Insert into users table with complete student details
        const insertUserQuery = `
          INSERT INTO users (name, studentID, section, class, dob, guidanceName, guidanceContact, gender, password, role, profilePhoto)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, '12345', 'student', ?)
        `;
        db.query(insertUserQuery, [name, studentID, section, className, dob, guidanceName, guidanceContact, gender, photo], (err, result) => {
          if (err) {
            console.error('Error inserting user record:', err.message);
            return res.status(500).send('Error saving user record');
          }
          res.status(200).send({ message: 'Student and user records saved successfully!', studentID });
        });

      });
    });
  });
}); 


module.exports = router;

// const express = require('express');
// const db = require('./db');
// const generateStudentID = require('./generateID');
// const multer = require('multer');
// const path = require('path');
// const fs = require('fs');  // Import fs module to handle file system operations

// const router = express.Router();

// // Ensure the uploads folder exists or create it if not
// const uploadDirectory = 'uploads';
// if (!fs.existsSync(uploadDirectory)) {
//   fs.mkdirSync(uploadDirectory, { recursive: true }); // Create the folder recursively if needed
// }

// // Configure multer for file uploads
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, uploadDirectory);  // Use the 'uploads' folder for storing files
//   },
//   filename: (req, file, cb) => {
//     cb(null, `${Date.now()}-${file.originalname}`);  // Unique file name
//   },
// });

// const upload = multer({
//   storage,
//   fileFilter: (req, file, cb) => {
//     const fileTypes = /jpeg|jpg|png/;
//     const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
//     const mimetype = fileTypes.test(file.mimetype);

//     if (extname && mimetype) {
//       cb(null, true);
//     } else {
//       cb(new Error('Only image files are allowed (jpeg, jpg, png)'));
//     }
//   },
// });

// // POST route to add a student with photo
// router.post('/api/add-student', upload.single('photo'), (req, res) => {
//   const { name, section, class: className, dob, guidanceName, guidanceContact, gender } = req.body;
//   const photo = req.file ? req.file.filename : null;

//   if (!name || !section || !className || !dob || !guidanceName || !guidanceContact || !gender) {
//     return res.status(400).send('Please fill out all fields correctly.');
//   }

//   const year = new Date().getFullYear(); // Current year
//   generateStudentID(section, className, year, (err, studentID) => {
//     if (err) {
//       console.error("Error generating student ID:", err);
//       return res.status(500).send('Error generating student ID');
//     }

//     let table = '';
//     if (section === 'Primary') {
//       table = 'primary_students';
//     } else if (section === 'Junior') {
//       table = 'junior_students';
//     } else if (section === 'Senior') {
//       table = 'senior_students';
//     }
//     if (!table) {
//       return res.status(400).send('Invalid section');
//     }

//     const checkQuery = `SELECT COUNT(*) AS count FROM ${table} WHERE studentID = ?`;
//     db.query(checkQuery, [studentID], (err, result) => {
//       if (err) {
//         return res.status(500).send('Error checking student ID');
//       }

//       if (result[0].count > 0) {
//         return res.status(400).send('Student ID already exists');
//       }

//       // Insert student data along with photo filename
//       const insertStudentQuery = `
//         INSERT INTO ${table} (studentID, name, section, class, dob, guidanceName, guidanceContact, gender, profilePhoto)
//         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
//       `;
//       db.query(insertStudentQuery, [studentID, name, section, className, dob, guidanceName, guidanceContact, gender, photo], (err) => {
//         if (err) {
//           console.error('SQL Query Error:', err);
//           return res.status(500).send('Error saving student record');
//         }

//         // Insert into users table with complete student details
//         const insertUserQuery = `
//           INSERT INTO users (name, studentID, section, class, dob, guidanceName, guidanceContact, gender, password, role, profilePhoto)
//           VALUES (?, ?, ?, ?, ?, ?, ?, ?, '12345', 'student', ?)
//         `;
//         db.query(insertUserQuery, [name, studentID, section, className, dob, guidanceName, guidanceContact, gender, photo], (err, result) => {
//           if (err) {
//             console.error('Error inserting user record:', err.message);
//             return res.status(500).send('Error saving user record');
//           }
//           res.status(200).send({ message: 'Student and user records saved successfully!', studentID });
//         });
//       });
//     });
//   });
// });

// module.exports = router;
