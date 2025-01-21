// generateID.js
const db = require('./db');

// Helper function to generate student ID based on section, class, and year
const generateStudentID = (section, className, year, callback) => {
  let classPrefix = '';
  let table = '';
  
  // Define sectionPrefix based on section
  if (section === 'Primary') {
    sectionPrefix = 'PR';
    table = 'primary_students';
  } else if (section === 'Junior') {
    sectionPrefix = 'JR';
    table = 'junior_students';
  } else if (section === 'Senior') {
    sectionPrefix = 'SR';
    table = 'senior_students';
  }

  // For classPrefix, we use the first two letters of the class name
  classPrefix = className.split(' ')[0].slice(0, 2).toUpperCase();

  // Generate the base ID in the desired format: ABC/PR/2024
  const baseID = `ABC/${classPrefix}/${year}`;

  // Query to find all student IDs for the given section and class
  const query = `SELECT studentID FROM ${table} WHERE studentID LIKE ?`;

  db.query(query, [`${baseID}%`], (err, results) => {
    if (err) {
      return callback(err, null);
    }

    // If there are no existing student IDs, start from 001
    if (results.length === 0) {
      return callback(null, `${baseID}/001`);
    }

    // Extract the numeric part from each studentID
    const existingNumbers = results.map(id => {
      const parts = id.studentID.split('/');
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

    // Format the student number with leading zeros (e.g., 001, 002, etc.)
    const studentNumber = nextNumber.toString().padStart(3, '0');

    // Generate the final student ID
    const studentID = `${baseID}/${studentNumber}`;

    callback(null, studentID);
  });
};

module.exports = generateStudentID;
