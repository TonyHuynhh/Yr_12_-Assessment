const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
const port = 3001;

// Middleware
app.use(express.json());
app.use(cors());

// Set up SQLite database
const path = require('path');
const dbPath = path.join(__dirname, 'database', 'study_log.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database:', err);
    } else {
        console.log('Connected to SQLite database');
        db.run(`CREATE TABLE IF NOT EXISTS study_sessions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            subject TEXT,
            date TEXT,
            duration INTEGER,  
            notes TEXT
        )`);
    }
});



// Get a single study session by ID
app.get('/api/study-sessions/:id', (req, res) => {
    const { id } = req.params;
    db.get('SELECT * FROM study_sessions WHERE id = ?', [id], (err, row) => {
        if (err) {
            res.status(500).send('Error retrieving data');
        } else if (!row) {
            res.status(404).send('Study session not found');
        } else {
            res.status(200).json(row);
        }
    });
});



// Get all study sessions with sorting and grouping
app.get('/api/study-sessions', (req, res) => {
    const { sort, group } = req.query;

    let query = 'SELECT * FROM study_sessions';
    let params = [];

    // Grouping Logic
    if (group) {
        if (group === 'subject') {
            query += ' GROUP BY subject';
        } else if (group === 'date') {
            query += ' GROUP BY date';
        }
    }

    // Sorting Logic
    if (sort) {
        if (sort === 'duration-asc') {
            query += ' ORDER BY duration ASC';
        } else if (sort === 'duration-desc') {
            query += ' ORDER BY duration DESC';
        } else if (sort === 'date-asc') {
            query += ' ORDER BY date ASC';
        } else if (sort === 'date-desc') {
            query += ' ORDER BY date DESC';
        }
    }
    
    db.all(query, params, (err, rows) => {
        if (err) {
            res.status(500).send('Error retrieving data');
        } else {
            res.status(200).json(rows);
        }
    });
});

// Create a new study session
app.post('/api/study-sessions', (req, res) => {
    const { subject, date, duration, notes } = req.body;
    db.run(`INSERT INTO study_sessions (subject, date, duration, notes) VALUES (?, ?, ?, ?)`,
        [subject, date, duration, notes],
        function (err) {
            if (err) {
                res.status(500).send('Error inserting data');
            } else {
                res.status(201).json({ id: this.lastID });
            }
        });
});

// Get all study sessions
app.get('/api/study-sessions', (req, res) => {
    db.all('SELECT * FROM study_sessions', [], (err, rows) => {
        if (err) {
            res.status(500).send('Error retrieving data');
        } else {
            res.status(200).json(rows);
        }
    });
});



// Delete a study session
app.delete('/api/study-sessions/:id', (req, res) => {
    const { id } = req.params;

    db.run(`DELETE FROM study_sessions WHERE id = ?`, id, function (err) {
        if (err) {
            res.status(500).send('Error deleting data');
        } else {
            res.status(200).send('Deleted successfully');
        }
    });
});

// Update a study session
app.put('/api/study-sessions/:id', (req, res) => {
    const { id } = req.params;
    const { subject, date, duration, notes } = req.body;
    db.run(`UPDATE study_sessions SET subject = ?, date = ?, duration = ?, notes = ? WHERE id = ?`,
        [subject, date, duration, notes, id],
        function (err) {
            if (err) {
                res.status(500).send('Error updating data');
            } else {
                res.status(200).send('Updated successfully');
            }
        });
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
