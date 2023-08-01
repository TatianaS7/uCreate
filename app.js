// app.js

const pool = require('./dbConfig');

// Require necessary modules
const express = require('express');
const cors = require('cors');
const pool = require('./dbConfig'); // Import the database connection pool

// Add other requires for modules you need

// Create an instance of Express app
const app = express();

// ... Further setup and code will go here ...
app.use(cors());
app.use(express.json()); // For parsing application/json
app.use(express.urlencoded({ extended: true })); // For parsing application/x-www-form-urlencoded


//User Authentication Endpoints
//Register New User
const bcrypt = require('bcrypt');

app.post('/api/register', async (req, res) => {
    const { full_name, username, email, password } = req.body;
    
    try {
        const checkExistingUser = 'SELECT * FROM users WHERE username = ? OR email = ?';
        const existingUser = await pool.query(checkExistingUser, [username, email]);
        if (existingUser.length > 0) {
            return res.status(400).json({error: 'Username or email already exists'});
        }
        const hashedPassword = await bcrypt.hash(password, 10);

        const insertUser = 'INSERT INTO users (full_name, username, email, password) VALUES (?, ?, ?, ?)';
        await pool.query(insertUser, [full_name, username, email, hashedPassword]);

        res.status(201).json({message: 'Account created'});
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({ error: 'Internal Server Error'});
    }
});
//Authenticate User & Generate Access Token
app.post('/api/login', async (req, res) => {
    const {username, email, password} = req.body;
})



//User Posts Endpoints
app.get('/api/posts', (req, res) => {
    const { postType } = req.query;

    const sql = 'SELECT * FROM posts WHERE postType = poll';
    db.query(sql, [postType], (err, results) => {
        if (err) {
            console.error('Error fetching posts:', err);
            res.status(500).json({error: 'Internal Server Error' });
        } else {
            res.json(results);
        }
    });
});

//User Profile Endpoints
//Get All Users
    app.get('/api/users', (req, res) => {    
        const sql = 'SELECT * FROM users';
        db.query(sql, (err, results) => {
            if (err) {
                console.error('Error fetching users:', err);
                res.status(500).json({error: 'Internal Server Error' });
            } else {
                res.json(results);
            }
        });
    });


// ... Other endpoints and server setup ...

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});