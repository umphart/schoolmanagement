// staffRoute.js
const express = require('express');
const db = require('./db');

const router = express.Router();

router.get('/api/staff', (req, res) => {
  const query = `SELECT * FROM staff`;
  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).send('Error fetching staff list');
    }
    res.json(results);
  });
});

module.exports = router;
