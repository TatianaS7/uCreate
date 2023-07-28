// app.js

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


//Define API endpoint
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



 // For now, let's assume we have some dummy posts data:
 const dummyPosts = [
    { id: 1, postType: 'text', title: 'Sample Text Post', content: 'This is a text post.' },
    { id: 2, postType: 'media', title: 'Sample Media Post', mediaType: 'image', mediaFile: 'sample.jpg' },
    // Add more dummy posts here...
  ];

  // Filter the posts based on the specified postType
  const filteredPosts = dummyPosts.filter((post) => post.postType === postType);

  res.json(filteredPosts);
});

// ... Other endpoints and server setup ...

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});