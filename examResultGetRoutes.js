// routes/examResultGetRoutes.js
const express = require('express');
const db = require('./db');
const router = express.Router();

router.get('/api/exam-results/:studentId', (req, res) => {
  const { studentId } = req.params;
  const { term } = req.query; // Get term from query parameters

  // Validate the term parameter
  if (!['first_term', 'second_term', 'third_term'].includes(term)) {
    return res.status(400).send('Invalid term specified.');
  }

  // SQL query to fetch results from the selected term table
  const query = `SELECT * FROM ${term} WHERE studentID = ?`;

  db.query(query, [studentId], (err, studentResults) => {
    if (err) {
      console.error('Error fetching exam results:', err);
      return res.status(500).send('Error fetching results');
    }

    if (studentResults.length === 0) {
      return res.status(404).send('No results found for this student in the selected term');
    }

    const studentClass = studentResults[0].studentClass;

    // Fetch all students in the same class for ranking
    const classQuery = `SELECT * FROM ${term} WHERE studentClass = ?`;
    db.query(classQuery, [studentClass], (err, classResults) => {
      if (err) {
        console.error('Error fetching class results:', err);
        return res.status(500).send('Error fetching class results');
      }

      // Calculate averages for all students
      const classWithAverages = classResults.map(student => {
        const totalMarks = student.total || 0;
        const average = totalMarks / (classResults.length > 0 ? classResults.length : 1);
        return { ...student, average };
      });

      // Sort students by average (descending) and assign ranks
      classWithAverages.sort((a, b) => b.average - a.average);
      classWithAverages.forEach((student, index) => {
        student.position = index + 1; // Position starts at 1
      });

      // Find the student's rank in the class
      const studentRank = classWithAverages.find(student => student.studentID === studentId).position;

      // Return student results with the position
      res.json({
        studentResults,
        studentRank,
      });
    });
  });
});

//----------------------------------------------------------//
router.get('/api/first-term-results/:studentId', (req, res) => {
  const { studentId } = req.params;

  // Query to get results for the selected student
  const query = 'SELECT * FROM first_term WHERE studentID = ?';
  db.query(query, [studentId], (err, results) => {
    if (err) {
      console.error('Error fetching first-term results:', err);
      return res.status(500).send('Error fetching results');
    }
    if (results.length === 0) {
      return res.status(404).send('No results found for this student');
    }

    const totalMarks = results.reduce((sum, result) => sum + result.total, 0);
    const average = totalMarks / results.length;

    // Query to get all students' results for the same class
    const classQuery = 'SELECT * FROM first_term WHERE studentClass = ?';
    db.query(classQuery, [results[0].studentClass], (err, classResults) => {
      if (err) {
        console.error('Error fetching class results:', err);
        return res.status(500).send('Error fetching class results');
      }

      // Calculate total marks and average for all students in the class
      const classAverages = classResults.reduce((acc, result) => {
        if (!acc[result.studentID]) {
          acc[result.studentID] = { total: 0, count: 0 };
        }
        acc[result.studentID].total += result.total;
        acc[result.studentID].count += 1;
        return acc;
      }, {});

      // Calculate the average for each student in the class
      const averages = Object.keys(classAverages).map(studentID => {
        const student = classAverages[studentID];
        const average = student.total / student.count;
        return { studentID, average };
      });

      // Sort students by average (descending order) to assign ranks
      averages.sort((a, b) => b.average - a.average);

      // Rank the students
      const rankedStudents = averages.map((student, index) => ({
        studentID: student.studentID,
        rank: index + 1,
        average: student.average,
      }));

      // Find the rank of the requested student
      const studentRank = rankedStudents.find(rank => rank.studentID === studentId);

      // Send the results and rank of the selected student, and class data
      res.json({
        studentId,
        results,
        totalMarks,
        average,
        studentRank,
        classAverages: rankedStudents,
      });
    });
  });
});
//-----------------------------------------------------//
router.get('/api/second-term-results/:studentId', (req, res) => {
  const { studentId } = req.params;

  // Query to get results for the selected student
  const query = 'SELECT * FROM second_term WHERE studentID = ?';
  db.query(query, [studentId], (err, results) => {
    if (err) {
      console.error('Error fetching first-term results:', err);
      return res.status(500).send('Error fetching results');
    }
    if (results.length === 0) {
      return res.status(404).send('No results found for this student');
    }

    const totalMarks = results.reduce((sum, result) => sum + result.total, 0);
    const average = totalMarks / results.length;

    // Query to get all students' results for the same class
    const classQuery = 'SELECT * FROM second_term WHERE studentClass = ?';
    db.query(classQuery, [results[0].studentClass], (err, classResults) => {
      if (err) {
        console.error('Error fetching class results:', err);
        return res.status(500).send('Error fetching class results');
      }

      // Calculate total marks and average for all students in the class
      const classAverages = classResults.reduce((acc, result) => {
        if (!acc[result.studentID]) {
          acc[result.studentID] = { total: 0, count: 0 };
        }
        acc[result.studentID].total += result.total;
        acc[result.studentID].count += 1;
        return acc;
      }, {});

      // Calculate the average for each student in the class
      const averages = Object.keys(classAverages).map(studentID => {
        const student = classAverages[studentID];
        const average = student.total / student.count;
        return { studentID, average };
      });

      // Sort students by average (descending order) to assign ranks
      averages.sort((a, b) => b.average - a.average);

      // Rank the students
      const rankedStudents = averages.map((student, index) => ({
        studentID: student.studentID,
        rank: index + 1,
        average: student.average,
      }));

      // Find the rank of the requested student
      const studentRank = rankedStudents.find(rank => rank.studentID === studentId);

      // Send the results and rank of the selected student, and class data
      res.json({
        studentId,
        results,
        totalMarks,
        average,
        studentRank,
        classAverages: rankedStudents,
      });
    });
  });
});
//-----------------------------------------------------------------------//
router.get('/api/third-term-results/:studentId', (req, res) => {
  const { studentId } = req.params;

  // Query to get results for the selected student
  const query = 'SELECT * FROM third_term WHERE studentID = ?';
  db.query(query, [studentId], (err, results) => {
    if (err) {
      console.error('Error fetching first-term results:', err);
      return res.status(500).send('Error fetching results');
    }
    if (results.length === 0) {
      return res.status(404).send('No results found for this student');
    }

    const totalMarks = results.reduce((sum, result) => sum + result.total, 0);
    const average = totalMarks / results.length;

    // Query to get all students' results for the same class
    const classQuery = 'SELECT * FROM third_term WHERE studentClass = ?';
    db.query(classQuery, [results[0].studentClass], (err, classResults) => {
      if (err) {
        console.error('Error fetching class results:', err);
        return res.status(500).send('Error fetching class results');
      }

      // Calculate total marks and average for all students in the class
      const classAverages = classResults.reduce((acc, result) => {
        if (!acc[result.studentID]) {
          acc[result.studentID] = { total: 0, count: 0 };
        }
        acc[result.studentID].total += result.total;
        acc[result.studentID].count += 1;
        return acc;
      }, {});

      // Calculate the average for each student in the class
      const averages = Object.keys(classAverages).map(studentID => {
        const student = classAverages[studentID];
        const average = student.total / student.count;
        return { studentID, average };
      });

      // Sort students by average (descending order) to assign ranks
      averages.sort((a, b) => b.average - a.average);

      // Rank the students
      const rankedStudents = averages.map((student, index) => ({
        studentID: student.studentID,
        rank: index + 1,
        average: student.average,
      }));

      // Find the rank of the requested student
      const studentRank = rankedStudents.find(rank => rank.studentID === studentId);

      // Send the results and rank of the selected student, and class data
      res.json({
        studentId,
        results,
        totalMarks,
        average,
        studentRank,
        classAverages: rankedStudents,
      });
    });
  });
});


//-------------------------------------------------//
router.get('/api/first-term/:studentId', (req, res) => {
  const { studentId } = req.params; // Extract the studentId from the route parameters

  if (!studentId) {
    return res.status(400).send('Student ID is required'); // If studentId is missing
  }

  const query = `
    SELECT id, subject, caExam, examMark 
    FROM first_term 
    WHERE studentID = ?;
  `;

  db.query(query, [studentId], (err, results) => {
    res.json(results); // Return the results if they exist
  });
});
//-------------------------------------------------//
router.get('/api/second-term/:studentId', (req, res) => {
  const { studentId } = req.params; // Extract the studentId from the route parameters

  if (!studentId) {
    return res.status(400).send('Student ID is required'); // If studentId is missing
  }

  const query = `
    SELECT id, subject, caExam, examMark 
    FROM second_term 
    WHERE studentID = ?;
  `;

  db.query(query, [studentId], (err, results) => {
    res.json(results); // Return the results if they exist
  });
});
//-------------------------------------------------//
router.get('/api/third-term/:studentId', (req, res) => {
  const { studentId } = req.params; // Extract the studentId from the route parameters

  if (!studentId) {
    return res.status(400).send('Student ID is required'); // If studentId is missing
  }

  const query = `
    SELECT id, subject, caExam, examMark 
    FROM third_term 
    WHERE studentID = ?;
  `;

  db.query(query, [studentId], (err, results) => {
    res.json(results); // Return the results if they exist
  });
});


      router.get('/api/getSubjects', (req, res) => {
        const query = 'SELECT * FROM subject';
        db.query(query, (err, results) => {
          if (err) {
            console.error('Error fetching subjects:', err.message);
            return res.status(500).json({ error: 'Failed to fetch subjects' });
          }
      
          res.json(results); // Send the results as JSON
        });
      });

      router.get('/api/exam-records/primary', (req, res) => {
        const { term } = req.query; // Get the selected term from query parameters
    
        if (!term) {
            return res.status(400).send('Term is required.');
        }
    
        const query = `
            SELECT studentID, studentName, studentClass, subject, grade, total
            FROM ${term.toLowerCase().replace(' ', '_')}
            WHERE studentClass LIKE 'Primary%';
        `;
    
        db.query(query, (err, results) => {
            if (err) {
                console.error('Error fetching results:', err);
                return res.status(500).send('Error fetching exam results');
            }
    
            if (results.length === 0) {
                return res.status(404).send('No results found for the selected term');
            }
    
            const formattedResults = results.map(result => {
                return {
                    studentID: result.studentID,
                    studentName: result.studentName,
                    className: result.studentClass, // sending class name
                    subject: result.subject,
                    score: result.total,
                    grade: result.grade,
                };
            });
    
            res.json(formattedResults);
        });
    });
    
    router.get('/api/exam-records/junior', (req, res) => { 
      const { term } = req.query;
    
      if (!term) {
          return res.status(400).send('Term is required.');
      }
    
      const query = `
          SELECT studentID, studentName, studentClass, subject, grade, total
          FROM ${term.toLowerCase().replace(' ', '_')}
          WHERE studentClass LIKE 'JSS%'  
      `;
    
      db.query(query, (err, results) => {
          if (err) {
              console.error('Error fetching results:', err);
              return res.status(500).send('Error fetching exam results');
          }
    
          if (results.length === 0) {
              return res.status(404).send('No results found for the selected term');
          }
    
          const formattedResults = results.map(result => {
              return {
                  studentID: result.studentID,
                  studentName: result.studentName,
                  className: result.studentClass,
                  subject: result.subject,
                  score: result.total,
                  grade: result.grade,
              };
          });
    
          res.json(formattedResults);
      });
    });
    router.get('/api/exam-records/senior', (req, res) => { 
      const { term } = req.query;
    
      if (!term) {
          return res.status(400).send('Term is required.');
      }
    
      const query = `
          SELECT studentID, studentName, studentClass, subject, grade, total
          FROM ${term.toLowerCase().replace(' ', '_')}
          WHERE studentClass LIKE 'SS%'  
      `;
    
      db.query(query, (err, results) => {
          if (err) {
              console.error('Error fetching results:', err);
              return res.status(500).send('Error fetching exam results');
          }
    
          if (results.length === 0) {
              return res.status(404).send('No results found for the selected term');
          }
    
          const formattedResults = results.map(result => {
              return {
                  studentID: result.studentID,
                  studentName: result.studentName,
                  className: result.studentClass,
                  subject: result.subject,
                  score: result.total,
                  grade: result.grade,
              };
          });
    
          res.json(formattedResults);
      });
    });
    
module.exports = router;
