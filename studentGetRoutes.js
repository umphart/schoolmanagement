// routes/studentGetRoutes.js
const express = require('express');
const db = require('./db');
const router = express.Router();

// GET route to check if student exists
router.get('/api/check-student', (req, res) => {
  const { studentId, tableName } = req.query;

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
  router.get('/api/primary1', (req, res) => {  
    const query = `SELECT * FROM primary_students WHERE class = 'Primary 1'`;
    
    db.query(query, (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Error fetching student list' });
        }

       // console.log('Database Query Results:', results);  // Log the results from the database
        res.json(results);  // Respond with the list of students
    });
});
router.get('/api/primary1/count', (req, res) => {  
  const query = `SELECT * FROM primary_students WHERE class = 'Primary 1'`;
  const countQuery = `SELECT COUNT(*) AS studentCount FROM primary_students WHERE class = 'Primary 1'`;

  db.query(query, (err, results) => {
      if (err) {
          console.error(err);
          return res.status(500).json({ error: 'Error fetching student list' });
      }

      db.query(countQuery, (err, countResults) => {
          if (err) {
              console.error(err);
              return res.status(500).json({ error: 'Error fetching student count' });
          }

          const studentCount = countResults[0].studentCount;  // Get the number of students
          //console.log('Database Query Results:', results);  // Log the results from the database
          res.json({ students: results, totalStudents: studentCount });  // Respond with both the student list and total count
      });
  });
});
router.get('/api/primary2/count', (req, res) => {  
  const query = `SELECT * FROM primary_students WHERE class = 'Primary 2'`;
  const countQuery = `SELECT COUNT(*) AS studentCount FROM primary_students WHERE class = 'Primary 2'`;

  db.query(query, (err, results) => {
      if (err) {
          console.error(err);
          return res.status(500).json({ error: 'Error fetching student list' });
      }

      db.query(countQuery, (err, countResults) => {
          if (err) {
              console.error(err);
              return res.status(500).json({ error: 'Error fetching student count' });
          }

          const studentCount = countResults[0].studentCount;  // Get the number of students
        
          res.json({ students: results, totalStudents: studentCount });  // Respond with both the student list and total count
      });
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
  router.get('/api/primary3/count', (req, res) => {  
    const query = `SELECT * FROM primary_students WHERE class = 'Primary 3'`;
    const countQuery = `SELECT COUNT(*) AS studentCount FROM primary_students WHERE class = 'Primary 3'`;
  
    db.query(query, (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Error fetching student list' });
        }
  
        db.query(countQuery, (err, countResults) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: 'Error fetching student count' });
            }
  
            const studentCount = countResults[0].studentCount;  // Get the number of students
        
            res.json({ students: results, totalStudents: studentCount });  // Respond with both the student list and total count
        });
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
  router.get('/api/primary4/count', (req, res) => {  
    const query = `SELECT * FROM primary_students WHERE class = 'Primary 4'`;
    const countQuery = `SELECT COUNT(*) AS studentCount FROM primary_students WHERE class = 'Primary 4'`;
  
    db.query(query, (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Error fetching student list' });
        }
  
        db.query(countQuery, (err, countResults) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: 'Error fetching student count' });
            }
  
            const studentCount = countResults[0].studentCount;  // Get the number of students
        
            res.json({ students: results, totalStudents: studentCount });  // Respond with both the student list and total count
        });
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
  router.get('/api/primary5/count', (req, res) => {  
    const query = `SELECT * FROM primary_students WHERE class = 'Primary 5'`;
    const countQuery = `SELECT COUNT(*) AS studentCount FROM primary_students WHERE class = 'Primary 5'`;
  
    db.query(query, (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Error fetching student list' });
        }
  
        db.query(countQuery, (err, countResults) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: 'Error fetching student count' });
            }
  
            const studentCount = countResults[0].studentCount;  // Get the number of students
        
            res.json({ students: results, totalStudents: studentCount });  // Respond with both the student list and total count
        });
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
  router.get('/api/senior1/count', (req, res) => {  
    const query = `SELECT * FROM senior_students WHERE class = 'SS 1'`;
    const countQuery = `SELECT COUNT(*) AS studentCount FROM senior_students WHERE class = 'SS 1'`;
  
    db.query(query, (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Error fetching student list' });
        }
  
        db.query(countQuery, (err, countResults) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: 'Error fetching student count' });
            }
  
            const studentCount = countResults[0].studentCount;  // Get the number of students
        
            res.json({ students: results, totalStudents: studentCount });  // Respond with both the student list and total count
        });
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
  router.get('/api/senior2/count', (req, res) => {  
    const query = `SELECT * FROM senior_students WHERE class = 'SS 2'`;
    const countQuery = `SELECT COUNT(*) AS studentCount FROM senior_students WHERE class = 'SS 2'`;
  
    db.query(query, (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Error fetching student list' });
        }
  
        db.query(countQuery, (err, countResults) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: 'Error fetching student count' });
            }
  
            const studentCount = countResults[0].studentCount;  // Get the number of students
        
            res.json({ students: results, totalStudents: studentCount });  // Respond with both the student list and total count
        });
    });
  })
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
  router.get('/api/senior3/count', (req, res) => {  
    const query = `SELECT * FROM senior_students WHERE class = 'SS 3'`;
    const countQuery = `SELECT COUNT(*) AS studentCount FROM senior_students WHERE class = 'SS 3'`;
  
    db.query(query, (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Error fetching student list' });
        }
  
        db.query(countQuery, (err, countResults) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: 'Error fetching student count' });
            }
  
            const studentCount = countResults[0].studentCount;  // Get the number of students
        
            res.json({ students: results, totalStudents: studentCount });  // Respond with both the student list and total count
        });
    });
  })
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
  router.get('/api/junior1/count', (req, res) => {  
    const query = `SELECT * FROM junior_students WHERE class = 'JSS 1'`;
    const countQuery = `SELECT COUNT(*) AS studentCount FROM junior_students WHERE class = 'JSS 1'`;
  
    db.query(query, (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Error fetching student list' });
        }
  
        db.query(countQuery, (err, countResults) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: 'Error fetching student count' });
            }
  
            const studentCount = countResults[0].studentCount;  // Get the number of students
        
            res.json({ students: results, totalStudents: studentCount });  // Respond with both the student list and total count
        });
    });
  })
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
  router.get('/api/junior2/count', (req, res) => {  
    const query = `SELECT * FROM junior_students WHERE class = 'JSS 2'`;
    const countQuery = `SELECT COUNT(*) AS studentCount FROM junior_students WHERE class = 'JSS 2'`;
  
    db.query(query, (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Error fetching student list' });
        }
  
        db.query(countQuery, (err, countResults) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: 'Error fetching student count' });
            }
  
            const studentCount = countResults[0].studentCount;  // Get the number of students
        
            res.json({ students: results, totalStudents: studentCount });  // Respond with both the student list and total count
        });
    });
  })
  router.get('/api/junior3/count', (req, res) => {  
    const query = `SELECT * FROM junior_students WHERE class = 'JSS 3'`;
    const countQuery = `SELECT COUNT(*) AS studentCount FROM junior_students WHERE class = 'JSS 3'`;
  
    db.query(query, (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Error fetching student list' });
        }
  
        db.query(countQuery, (err, countResults) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: 'Error fetching student count' });
            }
  
            const studentCount = countResults[0].studentCount;  // Get the number of students
        
            res.json({ students: results, totalStudents: studentCount });  // Respond with both the student list and total count
        });
    });
  })
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
 
// Add more GET routes as needed...

module.exports = router;
