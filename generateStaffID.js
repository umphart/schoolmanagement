const db = require('./db');

// Helper function to generate staff ID based on department and year
const generateStaffID = (department, year, callback) => {
  let departmentPrefix = department.slice(0, 3).toUpperCase(); // First three letters of department
  const baseID = `STAFF/${departmentPrefix}/${year}`;

  // Query to find all staff IDs for the given department
  const query = `SELECT staffID FROM staff WHERE staffID LIKE ?`;

  db.query(query, [`${baseID}%`], (err, results) => {
    if (err) {
      return callback(err, null);
    }

    // If there are no existing staff IDs, start from 001
    if (results.length === 0) {
      return callback(null, `${baseID}/001`);
    }

    // Extract the numeric part from each staffID
    const existingNumbers = results.map(id => {
      const parts = id.staffID.split('/');
      return parseInt(parts[3], 10); // Extract the numeric part
    });

    // Sort the numbers and find the first missing number
    existingNumbers.sort((a, b) => a - b);

    // Find the first missing number in the sequence
    let nextNumber = 1;
    for (let i = 0; i < existingNumbers.length; i++) {
      if (existingNumbers[i] !== nextNumber) {
        break;
      }
      nextNumber++;
    }

    // Format the staff number with leading zeros (e.g., 001, 002, etc.)
    const staffNumber = nextNumber.toString().padStart(3, '0');

    // Generate the final staff ID
    const staffID = `${baseID}/${staffNumber}`;

    callback(null, staffID);
  });
};

module.exports = generateStaffID;
