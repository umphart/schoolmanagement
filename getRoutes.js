// getRoutes.js
const express = require('express');
const db = require('./db');

const router = express.Router();

// GET route to check if a student exists

router.get('/api/check-student', (req, res) => {
    const { studentId, tableName } = req.query;  // Get the parameters from the query string
  
    if (!studentId || !tableName) {
      return res.status(400).send('Missing studentId or tableName');
    }
  
    const query = `SELECT * FROM ${tableName} WHERE studentID = ?`;
  
    db.query(query, [studentId], (err, result) => {
      if (err) {
        return res.status(500).send('Database error');
      }
  
      if (result.length === 0) {
        return res.status(404).send({ exists: false });
      }
  
      return res.status(200).send({ exists: true, student: result[0] });
    });
  });
router.get('/api/staff', (req, res) => {
    const query = `SELECT * FROM staff`; 
    db.query(query, (err, results) => {
      if (err) {
        return res.status(500).send('Error fetching staff list');
      }
      res.json(results);
    });
  });
router.get('/api/first-term-results/:studentId', (req, res) => {
    const { studentId } = req.params;
    const query = 'SELECT * FROM first_term WHERE studentID = ?';
    db.query(query, [studentId], (err, results) => {
      if (err) {
        console.error('Error fetching first-term results:', err);
        return res.status(500).send('Error fetching results');
      }
      if (results.length === 0) {
        return res.status(404).send('No results found for this student');
      }
      res.json(results);
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
 //---------------------------------
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
          const average = totalMarks / (studentResults.length > 0 ? studentResults.length : 1);
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
       
router.get('/api/second-term-results/:studentId', (req, res) => {
    const { studentId } = req.params;
    const query = 'SELECT * FROM second_term WHERE studentID = ?';
    db.query(query, [studentId], (err, results) => {
      if (err) {
        console.error('Error fetching second-term results:', err);
        return res.status(500).send('Error fetching results');
      }
      if (results.length === 0) {
        return res.status(404).send('No results found for this student');
      }
      res.json(results);
    });
  });
  router.get('/api/third-term-results/:studentId', (req, res) => {
    const { studentId } = req.params;
    const query = 'SELECT * FROM second_term WHERE studentID = ?';
    db.query(query, [studentId], (err, results) => {
      if (err) {
        console.error('Error fetching second-term results:', err);
        return res.status(500).send('Error fetching results');
      }
      if (results.length === 0) {
        return res.status(404).send('No results found for this student');
      }
      res.json(results);
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
  
      // Query to get all students' results for ranking
      const allStudentsQuery = 'SELECT * FROM first_term';
      db.query(allStudentsQuery, (err, allResults) => {
        if (err) {
          console.error('Error fetching all students results:', err);
          return res.status(500).send('Error fetching all students results');
        }
  
        // Calculate average scores for all students
        const studentAverages = allResults.reduce((acc, result) => {
          if (!acc[result.studentID]) {
            acc[result.studentID] = { total: 0, count: 0 };
          }
          acc[result.studentID].total += result.total;
          acc[result.studentID].count += 1;
          return acc;
        }, {});
  
        // Calculate the average for each student
        const averages = Object.keys(studentAverages).map(studentID => {
          const student = studentAverages[studentID];
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
  
        // Send the results and rank of the selected student
        res.json({
          studentId,
          results,
          totalMarks,
          average,
          studentRank,
        });
      });
    });
  });
  router.get('/api/second-term-results/:studentId', (req, res) => {
    const { studentId } = req.params;
    const query = 'SELECT * FROM second_term WHERE studentID = ?';
    db.query(query, [studentId], (err, results) => {
      if (err) {
        console.error('Error fetching second-term results:', err);
        return res.status(500).send('Error fetching results');
      }
      if (results.length === 0) {
        return res.status(404).send('No results found for this student');
      }
      res.json(results);
    });
  });
   // get third term exam
   router.get('/api/third-term-results/:studentId', (req, res) => {
    const { studentId } = req.params; // Match the route parameter name
  
    const query = `
      SELECT * FROM third_term WHERE studentID = ?;
    `;
  
    db.query(query, [studentId], (err, results) => {
      if (err) {
        console.error('Error fetching first-term results:', err);
        return res.status(500).send('Error fetching results');
      }
      if (results.length === 0) {
        return res.status(404).send('No results found for this student');
      }
  
      res.json(results);
    });
  });
  

// Route to fetch all students from all sections
router.get('/api/students/all', (req, res) => {
const query = `
SELECT * FROM primary_students
UNION
SELECT * FROM junior_students
UNION
SELECT * FROM senior_students;
`;
db.query(query, (err, results) => {
if (err) {  
return res.status(500).send('Error fetching student list');
}
res.json(results);  // Return all students from all sections
});
});
router.get('/api/students/stats', (req, res) => {
const query = `
SELECT 
section,
class,
IFNULL(SUM(CASE WHEN gender = 'Male' THEN 1 ELSE 0 END), 0) AS male_count,
IFNULL(SUM(CASE WHEN gender = 'Female' THEN 1 ELSE 0 END), 0) AS female_count,
IFNULL(COUNT(*), 0) AS total_students
FROM (
SELECT section, class, gender FROM primary_students
UNION ALL
SELECT section, class, gender FROM junior_students
UNION ALL
SELECT section, class, gender FROM senior_students
) AS all_students
GROUP BY section, class;
`;

db.query(query, (err, results) => {
if (err) {
return res.status(500).send('Error fetching student statistics');
}
res.json(results);  // Return grouped and counted statistics for each section and class
});
});

router.get('/api/students/primary', (req, res) => {
const query = `
SELECT * FROM primary_students`;
db.query(query, (err, results) => {
if (err) {
console.error('Error fetching student list:', err);
return res.status(500).send('Error fetching student list');
}
res.json(results);  // Return all students from all sections
});
});
router.get('/api/students/junior', (req, res) => {
const query = `
SELECT * FROM junior_students`;
db.query(query, (err, results) => {
if (err) {
return res.status(500).send('Error fetching student list');
}
res.json(results);  // Return all students from all sections
});
});
router.get('/api/students/senior', (req, res) => {
const query = `
SELECT * FROM senior_students`;
db.query(query, (err, results) => {
if (err) {
return res.status(500).send('Error fetching student list');
}
res.json(results);  // Return all students from all sections
});
});
// Route to fetch student details by ID
router.get('/api/students/:studentId', (req, res) => {
const { studentId } = req.params;
// Check in all tables
const query = `
SELECT * FROM primary_students WHERE studentID = ?
UNION
SELECT * FROM junior_students WHERE studentID = ?
UNION
SELECT * FROM senior_students WHERE studentID = ?;
`;
db.query(query, [studentId, studentId, studentId], (err, results) => {
if (err) {
return res.status(500).send('Error fetching student details');
}
if (results.length === 0) {
return res.status(404).send('Student not found');
}
res.json(results[0]);  // Return the first matched student
});
});
  router.get('/api/third-term-results/:studentId', (req, res) => {
    const { studentId } = req.params;
    const query = 'SELECT * FROM third_term WHERE studentID = ?';
    db.query(query, [studentId], (err, results) => {
      if (err) {
        console.error('Error fetching third-term results:', err);
        return res.status(500).send('Error fetching results');
      }
      if (results.length === 0) {
        return res.status(404).send('No results found for this student');
      }
      res.json(results);
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
  router.get('/api/third-term-results/:studentId', (req, res) => {
    const { studentId } = req.params;
    const query = 'SELECT * FROM second_term WHERE studentID = ?';
    db.query(query, [studentId], (err, results) => {
      if (err) {
        console.error('Error fetching second-term results:', err);
        return res.status(500).send('Error fetching results');
      }
      if (results.length === 0) {
        return res.status(404).send('No results found for this student');
      }
      res.json(results);
    });
  });
  
router.get('/api/first-term-results/:studentId', (req, res) => {
    const { studentId } = req.params;
    const query = 'SELECT * FROM first_term WHERE studentID = ?';
    db.query(query, [studentId], (err, results) => {
      if (err) {
        console.error('Error fetching first-term results:', err);
        return res.status(500).send('Error fetching results');
      }
      if (results.length === 0) {
        return res.status(404).send('No results found for this student');
      }
      res.json(results);
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
        router.get('/api/primary1', (req, res) => {
            const query = `SELECT * FROM primary_students WHERE class = 'Primary 1'`;
            db.query(query, (err, results) => {
              if (err) {
                return res.status(500).send('Error fetching student list');
              }
              res.json(results);
            });
          });
          router.get('/api/primary2', (req, res) => {
            const query = `
              SELECT * 
              FROM primary_students 
              WHERE class = 'Primary 2'`;
            db.query(query, (err, results) => {
              if (err) {
                return res.status(500).send('Error fetching student list');
              }
              res.json(results); // Return filtered students
            });
          });
          router.get('/api/primary3', (req, res) => {
            const query = `
              SELECT * 
              FROM primary_students 
              WHERE class = 'primary 3'`;
            db.query(query, (err, results) => {
              if (err) {
                return res.status(500).send('Error fetching student list');
              }
              res.json(results); // Return filtered students
            });
          });
          router.get('/api/primary4', (req, res) => {
            const query = `
              SELECT * 
              FROM primary_students 
              WHERE class = 'primary 4'`;
          
            db.query(query, (err, results) => {
              if (err) {
                return res.status(500).send('Error fetching student list');
              }
              res.json(results); // Return filtered students
            });
          });
          router.get('/api/primary5', (req, res) => {
            const query = `
              SELECT * 
              FROM primary_students 
              WHERE class = 'primary 5'`;
            db.query(query, (err, results) => {
              if (err) {
                return res.status(500).send('Error fetching student list');
              }
              res.json(results); // Return filtered students
            });
          });
          router.get('/api/senior1', (req, res) => {
            const query = `
              SELECT * 
              FROM senior_students 
              WHERE class = 'SS 1'`;
            db.query(query, (err, results) => {
              if (err) {
                return res.status(500).send('Error fetching student list');
              }
              res.json(results); // Return filtered students
            });
          });
          router.get('/api/senior2', (req, res) => {
            const query = `
              SELECT * 
              FROM senior_students 
              WHERE class = 'SS 2'`;
          
            db.query(query, (err, results) => {
              if (err) {
              
                return res.status(500).send('Error fetching student list');
              }
              res.json(results); // Return filtered students
            });
          });
          router.get('/api/senior3', (req, res) => {
            const query = `
              SELECT * 
              FROM senior_students 
              WHERE class = 'SS 3'`;
            db.query(query, (err, results) => {
              if (err) {
                return res.status(500).send('Error fetching student list');
              }
              res.json(results); // Return filtered students
            });
          });
          router.get('/api/junior1', (req, res) => {
            const query = `
              SELECT * 
              FROM junior_students 
              WHERE class = 'JSS 1'`;
            db.query(query, (err, results) => {
              if (err) {
                return res.status(500).send('Error fetching student list');
              }
              res.json(results); // Return filtered students
            });
          });
          router.get('/api/junior2', (req, res) => {
            const query = `
              SELECT * 
              FROM junior_students 
              WHERE class = 'JSS 2'`;
            db.query(query, (err, results) => {
              if (err) {
                console.error('Error fetching student list:', err);
                return res.status(500).send('Error fetching student list');
              }
              res.json(results); // Return filtered students
            });
          });
          // route to fecth junior
          router.get('/api/junior3', (req, res) => {
            const query = `
              SELECT * 
              FROM junoir_students 
              WHERE class = 'JSS 3'`;
            db.query(query, (err, results) => {
              if (err) {
                return res.status(500).send('Error fetching student list');
              }
              res.json(results); // Return filtered students
            });
          });
          //.................
          router.get('/api/student-profile/:studentId', (req, res) => {
            const studentId = req.params.studentId;
          
            let tableName = '';
          
            if (studentId.startsWith('ABC/PR')) {
              tableName = 'primary_students';
            } else if (studentId.startsWith('ABC/JS')) {
              tableName = 'junior_students';
            } else if (studentId.startsWith('ABC/SS')) {
              tableName = 'senior_students';
            } else {
              return res.status(404).json({ message: 'Invalid student ID' });
            }
          
            const query = `SELECT * FROM ${tableName} WHERE studentID = ?`;
          
            db.query(query, [studentId], (err, result) => {
              if (err) {
                console.error(err);
                return res.status(500).json({ message: 'Server error' });
              }
          
              if (result.length > 0) {
                res.json(result[0]); // Return the first matching student profile
              } else {
                res.status(404).json({ message: 'Student not found' });
              }
            });
          });
          
module.exports = router;
