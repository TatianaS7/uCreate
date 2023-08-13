// app.js

const pool = require('./dbConfig');
const dotenv = require('dotenv');
dotenv.config({path: 'env.default'}); // Load environment variables from .env file
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const secretKey = process.env.SECRET_KEY;


// Create an instance of Express app
const app = express();

app.use(cors());
app.use(express.json()); // For parsing application/json
app.use(express.urlencoded({ extended: true })); // For parsing application/x-www-form-urlencoded
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Internal Server Error' });
  });



// USER ACCOUNT ENDPOINTS//
//Register New User
app.post('/api/register', async (req, res) => {
    const { full_name, username, password, email } = req.body;

    try {
        const checkExistingUser = 'SELECT * FROM users WHERE username = ? OR email = ?';
        const [existingUser] = await pool.query(checkExistingUser, [username, email]);

        console.log(existingUser);

        if (existingUser.length > 0) {
            return res.status(400).json({ error: 'Username or email already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const insertUser = 'INSERT INTO users (full_name, username, email, password) VALUES (?, ?, ?, ?)';
        await pool.query(insertUser, [full_name, username, email, hashedPassword]);

        res.status(201).json({ message: 'Account created' });
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

//Log In - Authenticate User & Generate Access Token
app.post('/auth/login', async (req, res) => {
    const {username, email, password} = req.body;

    try {
        const getUser = 'SELECT * FROM users WHERE username = ? OR email = ?';
        const [user] = await pool.query(getUser, [username, email]);

        if (!user || user.length === 0) {
            return res.status(401).json({ error: 'User not found'});
        }

        const validatePassword = await bcrypt.compare(password, user[0].password);

        if (!validatePassword) {
            return res.status(401).json({ error: 'Invalid password'});
        }

        const accessToken = jwt.sign({ userId: user[0].id }, secretKey, { expiresIn: '1h'});
        res.status(200).json({message: 'Authentication successful!', accessToken });

    } catch (error) {
        console.error('Error authenticating account:', error);
        res.status(500).json({error: 'Internal Server Error'});
    }
});

//Update User Info
app.put("/api/users/:idUsers/profile", async (req, res) => {
  const idUsers = req.params.idUsers;
  const { username, newPassword, email, bio, avatar } = req.body;

  try {
    let hashedPassword = null;

    if(newPassword) {
        hashedPassword = await bcrypt.hash(newPassword, 10);
    }

    const updateProfile = "UPDATE users SET username = ?, password = ?, email = ?, bio = ?, avatar = ? WHERE idUsers = ?";

    await pool.query(updateProfile, [username, hashedPassword, email, bio, avatar, idUsers]);

    res.status(200).json({ message: "Profile updated!" });

  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

//Delete User 
app.delete("/api/users/:idUsers/profile", async (req, res) => {
    const idUsers = req.params.idUsers;
  
    try {
      
      const deleteUser = "DELETE FROM users WHERE idUsers = ?";
  
      await pool.query(deleteUser, [idUsers]);
  
      res.status(200).json({ message: "Account deleted!" });
  
    } catch (error) {
      console.error("Error deleting account:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

//Logout
app.get('/auth/logout', (req, res) => {
    res.json({ message: 'Logout successful' });
});



//POSTS//
//Create Post
app.post('/api/posts', async (req, res) => {
    const { post_type, title, content, media, media_type, status, tags } = req.body;

    try {
        const insertPost = 'INSERT INTO posts (post_type, title, content, media, media_type, status) VALUES (?, ?, ?, ?, ?, ?)';

        const [insertedPost] = await pool.query(insertPost, [post_type, title, content, media, media_type, status]);

        const postId = insertedPost.insertId;
        const insertPostTags = 'INSERT INTO post_tags (post_id, tag_id) VALUES (?, ?)';

        for (const tagName of tags) {
            const [tag] = await pool.query('SELECT idtags FROM tags WHERE tag_name = ?', [tagName]);
            if (tag.length > 0) {
                const tagId = tag[0].idtags;
                await pool.query(insertPostTags, [postId, tagId]);
            }
        }

        res.status(200).json({ message: 'Post created!' });
    } catch (error) {
        console.error('Error creating post:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

//Update Post
app.put('/api/posts/:postId', async (req, res) => { //Remember to change username & id back to NOTNULL after testing
    const postId = req.params.postId; 
    const {post_type, title, content, media, media_type, status, tags} = req.body;
    

try {
    const updatePost = 'UPDATE posts SET post_type = ?,  title = ?, content = ?, media = ?, media_type = ?, status = ? WHERE post_id = ?';

    await pool.query(updatePost, [post_type, title, content, media, media_type, status, postId]);

        // Delete existing event-tag relationships for this post
        await pool.query('DELETE FROM post_tags WHERE post_id = ?', [postId]);

        // Insert new event-tag relationships for this event
        const insertPostTags = 'INSERT INTO post_tags (post_id, tag_id) VALUES (?, ?)';
        for (const tagName of tags) {
            const [tag] = await pool.query('SELECT idtags FROM tags WHERE tag_name = ?', [tagName]);
            if (tag.length > 0) {
                const tagId = tag[0].idtags;
                await pool.query(insertPostTags, [postId, tagId]);
            }
        }

    res.status(200).json({message: 'Post updated!'});
} catch (error) {
    console.error('Error updating post:', error);
    res.status(500).json({error: 'Internal Server Error'});
}
});

//Delete Post
app.delete('/api/posts/:postId', async (req, res) => {
    const postId = req.params.postId;

        try {
            // Delete associated event tags first
            const deletePostTags = 'DELETE FROM post_tags WHERE post_id = ?';
            await pool.query(deletePostTags, [postId]);
    
            // Then delete the event itself
            const deletePost = 'DELETE FROM posts WHERE post_id = ?';
            await pool.query(deletePost, [postId]);
    
            res.status(200).json({ message: 'Post deleted!' });
        } catch (error) {
            console.error('Error deleting post:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    
});



//EVENTS//
//Create Event
app.post('/api/events', async (req, res) => {
    const {event_name, event_date, location_text, event_description, tags} = req.body;

try {
    const insertEvent = 'INSERT INTO events (event_name, event_date, location_text, event_description) VALUES (?, ?, ?, ?)';

    const [insertedEvent] = await pool.query(insertEvent, [event_name, event_date, location_text, event_description]);

    const eventId = insertedEvent.insertId;
    const insertEventTags = `INSERT INTO event_tags (event_id, tag_id) VALUES (?, ?)`;

    for (const tagName of tags) {
        const [tag] = await pool.query('SELECT idtags FROM tags WHERE tag_name = ?', [tagName]);
        if (tag.length > 0) {
            const tagId = tag[0].idtags;
            await pool.query(insertEventTags, [eventId, tagId]);
        }
    }

    res.status(200).json({message: 'Event created!'});
} catch (error) {
    console.error('Error creating event post:', error);
    res.status(500).json({error: 'Internal Server Error'});
}
});

// Update Event
app.put('/api/events/:eventId', async (req, res) => {
    const eventId = req.params.eventId;
    const { event_name, event_date, location_text, event_description, tags } = req.body;

    try {
        const updateEvent = 'UPDATE events SET event_name = ?, event_date = ?, location_text = ?, event_description = ? WHERE event_id = ?';

        await pool.query(updateEvent, [event_name, event_date, location_text, event_description, eventId]);

        // Delete existing event-tag relationships for this event
        await pool.query('DELETE FROM event_tags WHERE event_id = ?', [eventId]);

        // Insert new event-tag relationships for this event
        const insertEventTags = 'INSERT INTO event_tags (event_id, tag_id) VALUES (?, ?)';
        for (const tagName of tags) {
            const [tag] = await pool.query('SELECT idtags FROM tags WHERE tag_name = ?', [tagName]);
            if (tag.length > 0) {
                const tagId = tag[0].idtags;
                await pool.query(insertEventTags, [eventId, tagId]);
            }
        }

        res.status(200).json({ message: 'Event updated!' });
    } catch (error) {
        console.error('Error updating event:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

//Delete Event
app.delete('/api/events/:eventId', async (req, res) => {
    const eventId = req.params.eventId;

    try {
        // Delete associated event tags first
        const deleteEventTags = 'DELETE FROM event_tags WHERE event_id = ?';
        await pool.query(deleteEventTags, [eventId]);

        // Then delete the event itself
        const deleteEvent = 'DELETE FROM events WHERE event_id = ?';
        await pool.query(deleteEvent, [eventId]);

        res.status(200).json({ message: 'Event deleted!' });
    } catch (error) {
        console.error('Error deleting event:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});



//SEARCH ENDPOINT
//General Search
app.get('/api/search', async (req, res) => {
    const { q } = req.query;

    try {
      // Search for users
      const userSql = `SELECT full_name, username FROM users WHERE username LIKE ? OR full_name LIKE ?`;
      const [users] = await pool.query(userSql, [`%${q}%`, `%${q}%`]);

      // Search for posts
      const postSql = `SELECT title, content FROM posts WHERE title LIKE ? OR content LIKE ?`;
      const [posts] = await pool.query(postSql, [`%${q}%`, `%${q}%`]);

      // Search for events
      const eventSql = `SELECT event_name, event_description, event_date, location_text FROM events WHERE event_name LIKE ? OR event_description LIKE ? OR location_text LIKE ?`;
      const [events] = await pool.query(eventSql, [`%${q}%`, `%${q}%`, `%${q}%`]);

      // Search for skills
      const skillSql = `SELECT skill_name, description FROM skills WHERE skill_name LIKE ? OR description LIKE ?`;
      const [skills] = await pool.query(skillSql, [`%${q}%`, `%${q}%`]);

      // Combine the results
      const searchResults = {
        users: { count: users.length, data: users },
        posts: { count: posts.length, data: posts },
        events: { count: events.length, data: events },
        skills: { count: skills.length, data: skills },
      };

      res.json(searchResults);
    } catch (error) {
      console.error('Error performing search:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

//Get All Users
app.get('/api/users', (req, res) => {    

    const sql = 'SELECT full_name, username, bio FROM users';
    pool.query(sql, (err, results) => {
        if (err) {
            console.error('Error fetching users:', err);
            res.status(500).json({error: 'Internal Server Error' });
        } else {
            res.json(results);
        }
    });
});



//SKILLS/TAGS ENDPOINTS
//Show All Skills
app.get('/api/skills', (req, res) => {

    const getSkills = 'SELECT skill_name, description FROM skills';
    pool.query(getSkills, (err, results) => {
        if (err) {
            console.error('Error fetching skills:', err);
            res.status(500).json({ error: 'Internal Server Error'});         
        } else {
            res.json(results);
        }
    });
});

//Add Skill to Profile
app.post('/api/users/:idUsers/skills', async (req, res) => {
    const userId = req.params.idUsers;
    const { skill_name, proficiency_level } = req.body;

    try {

        const checkExistingSkills = 'SELECT * FROM skills WHERE skill_name = ?';
        const [exisitingSkill] = await pool.query(checkExistingSkills, [skill_name]);

        if (!exisitingSkill || exisitingSkill.length === 0) {
            return res.status(400).json({ error: 'Skill not found' });
        }

        const skillId = exisitingSkill[0].id;

        const addSkill = 'INSERT INTO user_skills (user_id, skill_id, proficiency_level) VALUES (?, ?, ?)';
        await pool.query(addSkill, [userId, skillId, proficiency_level]);
    
        res.status(200).json({message: 'Your skills have been added!'})
    } catch (error) {
        console.error('Error adding skills:', error);
        res.status(500).json({error: 'Internal Server Error'});
    }
})


//Search Skills
app.get('/api/search/skills', async (req, res) => {
    const {q} = req.query;

    try {
        const skillSql = 'SELECT skill_name, description FROM skills WHERE skill_name LIKE ? OR description LIKE ?';
        const [skill] = await pool.query(skillSql, [`%${q}%`, `%${q}%`]);
     
        if (skill.length > 0) {
            const skillResult = {
                skills: {count: skill.length, data: skill}
            };
            res.json(skillResult);
            } else {
                res.json({ message: `'${q}' not found. See more to request additions`});
            }
    } catch (error) {
        console.error('Error searching for skill:', error);
        res.status(500).json({ error: 'Internal Server Error'});
    }
});

//Request Skills
app.post('/api/request/skills', async (req, res) => {
    const {skill_name} = req.body;

    try {
        const checkExistingRequests = 'SELECT * FROM skill_request WHERE skill_name = ?';
        const [existingRequest] = await pool.query(checkExistingRequests, [skill_name]);

        if (existingRequest.length > 0) {
            const requestStatus = existingRequest[0].status;
            const requestDate = existingRequest[0].request_date;

            response = {
                error: `${skill_name} has already been requested!`,
                status: requestStatus,
                requestDate: requestDate
            };

            return res.status(400).json(response);
        }

        const skillRequest = 'INSERT INTO skill_request (skill_name) VALUES (?)';
        await pool.query(skillRequest, [skill_name]);
    
        res.status(200).json({message: 'Your request has been submitted!'})
    } catch (error) {
        console.error('Error submitting request:', error);
        res.status(500).json({error: 'Internal Server Error'});
    }
})

//Show All Tags
app.get('/api/tags', (req, res) => {

    const getTags = 'SELECT tag_name FROM tags';
    pool.query(getTags, (err, results) => {
        if (err) {
            console.error('Error fetching tags:', err);
            res.status(500).json({ error: 'Internal Server Error'});
        } else {
            res.json(results);
        }
    });
});

//Search Tags
app.get('/api/search/tags', async (req, res) => {
    const { q } = req.query;

    try {
        const tagSql = 'SELECT tag_name FROM tags WHERE tag_name LIKE ?';
        const [tag] = await pool.query(tagSql, [`%${q}%`]);
     
        if (tag.length > 0) {
            const tagResult = {
                tags: {count: tag.length, data: tag}
            };
            res.json(tagResult);
            } else {
                res.json({ message: `'${q}' not found. See more to request additions`});
            }
    } catch (error) {
        console.error('Error searching for tag:', error);
        res.status(500).json({ error: 'Internal Server Error'});
    }
});


// Start the server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});