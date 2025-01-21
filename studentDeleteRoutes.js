const express = require('express');
const db = require('./db');
const router = express.Router();

router.delete('/api/students/:section/:studentId', (req, res) => {
  const { section, studentId } = req.params;
  let table = '';

  // Determine the appropriate table based on the section
  if (section === 'primary') {
    table = 'primary_students';
  } else if (section === 'junior') {
    table = 'junior_students';
  } else if (section === 'senior') {
    table = 'senior_students';
  }

  if (!table) {
    return res.status(400).send('Invalid section');
  }

  // SQL queries for deleting student and associated records
  const deleteStudentQuery = `DELETE FROM ${table} WHERE studentID = ?`;
  const deleteFirstTermQuery = `DELETE FROM first_term WHERE studentID = ?`;
  const deleteSecondTermQuery = `DELETE FROM second_term WHERE studentID = ?`;
  const deleteThirdTermQuery = `DELETE FROM third_term WHERE studentID = ?`;

  // SQL query to delete user record
  const deleteUserQuery = `DELETE FROM users WHERE studentID = ?`;

  // Perform database transactions
  db.beginTransaction((err) => {
    if (err) {
      return res.status(500).send('Error starting transaction');
    }

    // Step 1: Delete the student record
    db.query(deleteStudentQuery, [studentId], (err, result) => {
      if (err) {
        return db.rollback(() => {
          res.status(500).send('Error deleting student');
        });
      }

      if (result.affectedRows === 0) {
        return db.rollback(() => {
          res.status(404).send('Student not found');
        });
      }

      // Step 2: Delete exam records for the student across all terms
      db.query(deleteFirstTermQuery, [studentId], (err) => {
        if (err) {
          return db.rollback(() => {
            res.status(500).send('Error deleting first term records');
          });
        }

        db.query(deleteSecondTermQuery, [studentId], (err) => {
          if (err) {
            return db.rollback(() => {
              res.status(500).send('Error deleting second term records');
            });
          }

          db.query(deleteThirdTermQuery, [studentId], (err) => {
            if (err) {
              return db.rollback(() => {
                res.status(500).send('Error deleting third term records');
              });
            }

            // Step 3: Delete user record associated with the student
            db.query(deleteUserQuery, [studentId], (err) => {
              if (err) {
                return db.rollback(() => {
                  res.status(500).send('Error deleting user record');
                });
              }

              // Commit the transaction
              db.commit((err) => {
                if (err) {
                  return db.rollback(() => {
                    res.status(500).send('Error committing transaction');
                  });
                }
                res.status(200).send({ message: 'Student and associated records deleted successfully' });
              });
            });
          });
        });
      });
    });
  });
});

module.exports = router;
