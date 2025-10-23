require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());

// MySQL connection
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "Mythilireddy28@",
  database: "leave_system",
});

db.connect((err) => {
  if (err) {
    console.error('❌ Database connection failed:', err.message);
  } else {
    console.log('✅ Connected to MySQL database');
  }
});

// Create table if it doesn't exist
const createTableQuery = `
  CREATE TABLE IF NOT EXISTS leave_applications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    employeeName VARCHAR(255),
    employeeId VARCHAR(100),
    startDate DATE,
    endDate DATE,
    leaveType VARCHAR(100),
    reason TEXT,
    status VARCHAR(50) DEFAULT 'Pending'
  );
`;
db.query(createTableQuery, (err) => {
  if (err) console.error('❌ Table creation error:', err.message);
});

// POST - Submit leave request
app.post('/api/leave', (req, res) => {
  const { employeeName, employeeId, startDate, endDate, leaveType, reason } = req.body;
  if (!employeeName || !employeeId || !startDate || !endDate || !leaveType || !reason) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  const sql = `
    INSERT INTO leave_applications 
    (employeeName, employeeId, startDate, endDate, leaveType, reason)
    VALUES (?, ?, ?, ?, ?, ?)
  `;
  db.query(sql, [employeeName, employeeId, startDate, endDate, leaveType, reason], (err, result) => {
    if (err) {
      console.error('❌ Error inserting leave application:', err.message);
      return res.status(500).json({ error: 'Database error' });
    }
    res.status(200).json({ message: 'Leave request submitted successfully!' });
  });
});

// GET - Fetch all leave applications
app.get('/api/leave/all', (req, res) => {
  db.query('SELECT * FROM leave_applications ORDER BY id DESC', (err, results) => {
    if (err) {
      console.error('❌ Error fetching leave applications:', err.message);
      return res.status(500).json({ error: 'Failed to fetch records' });
    }
    res.json(results);
  });
});

// PUT - Update leave status
app.put('/api/leave/:id/status', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  if (!status) return res.status(400).json({ error: 'Status is required' });

  db.query('UPDATE leave_applications SET status = ? WHERE id = ?', [status, id], (err) => {
    if (err) {
      console.error('❌ Error updating status:', err.message);
      return res.status(500).json({ error: 'Failed to update status' });
    }
    res.json({ message: 'Status updated successfully' });
  });
});

// DELETE - Clear all records
app.delete('/api/leave/clear', (req, res) => {
  db.query('DELETE FROM leave_applications', (err) => {
    if (err) {
      console.error('❌ Error clearing records:', err.message);
      return res.status(500).json({ error: 'Failed to clear records' });
    }
    res.json({ message: 'All records cleared' });
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
