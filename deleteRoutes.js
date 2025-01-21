// deleteRoutes.js
const express = require('express');
const db = require('./db');

const router = express.Router();

router.delete('/api/delete-first/:id', (req, res) => {
  const id = req.params.id;

  // Check if ID is provided
  if (!id) {
    return res.status(400).json({ message: "No ID provided" });
  }

  const sql = "DELETE FROM first_term WHERE id = ?";
  const values = [id];

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error('Error executing query:', err); // Log the detailed error on the server
      return res.status(500).json({ message: "Something went wrong. " + err.message });
    }

    if (result.affectedRows > 0) {
      return res.json({ success: "Record deleted successfully" });
    } else {
      return res.status(404).json({ message: "Record not found" });
    }
  });
});
  
router.delete('/api/delete-second/:id', (req, res) => {
  const id = req.params.id;

  // Check if ID is provided
  if (!id) {
    return res.status(400).json({ message: "No ID provided" });
  }

  const sql = "DELETE FROM second_term WHERE id = ?";
  const values = [id];

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error('Error executing query:', err); // Log the detailed error on the server
      return res.status(500).json({ message: "Something went wrong. " + err.message });
    }

    if (result.affectedRows > 0) {
      return res.json({ success: "Record deleted successfully" });
    } else {
      return res.status(404).json({ message: "Record not found" });
    }
  });
});
 
router.delete('/api/delete-third/:id', (req, res) => {
  const id = req.params.id;

  // Check if ID is provided
  if (!id) {
    return res.status(400).json({ message: "No ID provided" });
  }

  const sql = "DELETE FROM third_term WHERE id = ?";
  const values = [id];

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error('Error executing query:', err); // Log the detailed error on the server
      return res.status(500).json({ message: "Something went wrong. " + err.message });
    }

    if (result.affectedRows > 0) {
      return res.json({ success: "Record deleted successfully" });
    } else {
      return res.status(404).json({ message: "Record not found" });
    }
  });
});


// // DELETE route to delete a student by section and ID
// router.delete('/students/:section/:studentId', (req, res) => {
//   const { section, studentId } = req.params;
//   let table = '';
//   if (section === 'primary') {
//     table = 'primary_students';
//   } else if (section === 'junior') {
//     table = 'junior_students';
//   } else if (section === 'senior') {
//     table = 'senior_students';
//   }
//   if (!table) {
//     return res.status(400).send('Invalid section');
//   }
//   const query = `DELETE FROM ${table} WHERE studentID = ?`;
//   db.query(query, [studentId], (err, result) => {
//     if (err) {
//       return res.status(500).send('Error deleting student');
//     }
//     if (result.affectedRows === 0) {
//       return res.status(404).send('Student not found');
//     }
//     res.status(200).send({ message: 'Student deleted successfully' });
//   });
// });
 
// // Route to delete a student by section and ID
// router.delete('/api/students/:section/:studentId', (req, res) => {
//     const { section, studentId } = req.params;
//     let table = '';
//     if (section === 'primary') {
//       table = 'primary_students';
//     } else if (section === 'junior') {
//       table = 'junior_students';
//     } else if (section === 'senior') {
//       table = 'senior_students';
//     }
//     if (!table) {
//       return res.status(400).send('Invalid section');
//     }
//     const query = `DELETE FROM ${table} WHERE studentID = ?`;
//     db.query(query, [studentId], (err, result) => {
//       if (err) {
//         return res.status(500).send('Error deleting student');
//       }
//       if (result.affectedRows === 0) {
//         return res.status(404).send('Student not found');
//       }
//       res.status(200).send({ message: 'Student deleted successfully' });
//     });
//   });

  

module.exports = router;
