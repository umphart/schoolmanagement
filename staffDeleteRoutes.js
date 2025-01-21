const express = require('express');
const db = require('./db'); // Assuming you have a separate file to handle DB connections
const router = express.Router();

// DELETE route to delete a staff member by composite staffID (with slashes)
router.delete('/deleteStaff/:staffID', (req, res) => {
  const staffID = decodeURIComponent(req.params.staffID);
  console.log('Deleting staff with ID:', staffID);

  // Start a transaction
  db.beginTransaction((err) => {
    if (err) {
      console.error('Error starting transaction:', err);
      return res.status(500).json({ error: 'Error starting transaction' });
    }

    // Step 1: Delete related records in staff_subjects table first
    const deleteStaffSubjectsQuery = `DELETE FROM staff_subjects WHERE staffID = ?`;
    db.query(deleteStaffSubjectsQuery, [staffID], (err, result) => {
      if (err) {
        console.error('Error deleting related staff_subjects records:', err);
        return db.rollback(() => {
          return res.status(500).json({ error: 'Error deleting staff_subjects records' });
        });
      }

      // Step 2: Now delete the staff record
      const deleteStaffQuery = `DELETE FROM staff WHERE staffID = ?`;
      db.query(deleteStaffQuery, [staffID], (err, result) => {
        if (err) {
          console.error('Error deleting staff record:', err);
          return db.rollback(() => {
            return res.status(500).json({ error: 'Error deleting staff record' });
          });
        }

        if (result.affectedRows === 0) {
          return db.rollback(() => {
            return res.status(404).json({ error: 'Staff member not found' });
          });
        }

        // Step 3: Delete the user record
        const deleteUserQuery = `DELETE FROM users WHERE staffID = ?`;
        db.query(deleteUserQuery, [staffID], (err, userResult) => {
          if (err) {
            console.error('Error deleting user record:', err);
            return db.rollback(() => {
              return res.status(500).json({ error: 'Error deleting user record' });
            });
          }

          // Commit the transaction
          db.commit((err) => {
            if (err) {
              console.error('Error committing transaction:', err);
              return db.rollback(() => {
                return res.status(500).json({ error: 'Error committing transaction' });
              });
            }

            return res.status(200).json({
              message: 'Staff and user records deleted successfully',
              staffID
            });
          });
        });
      });
    });
  });
});

module.exports = router;
