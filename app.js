// app.js

const pool = require("./dbConfig");
const dotenv = require("dotenv");
dotenv.config({ path: "env.default" }); // Load environment variables from .env file
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const axios = require("axios");


const secretKey = process.env.SECRET_KEY;

// Create an instance of Express app
const app = express();

app.use(cors());
app.use(express.json()); // For parsing application/json
app.use(express.urlencoded({ extended: true })); // For parsing application/x-www-form-urlencoded
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Internal Server Error" });
});

// Your client ID and client secret from Pocket Developer Portal
const CLIENT_ID = process.env.CLIENT_ID;
// const CLIENT_SECRET = secretKey;

// The URL where you will handle the OAuth callback
const REDIRECT_URI = "http://localhost:3000/api/pocket-callback";

app.get("/api/pocket-callback", async (req, res) => {
  try {
    const code = req.query.code;

    // Exchange authorization code for access token
    const tokenResponse = await axios.post("https://getpocket.com/v3/oauth/authorize", 
    {
      consumer_key: CLIENT_ID,
      code: code
    },
    {
        headers: {
            "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
            "X-Accept": "application/x-www-form-urlencoded",
        }
    });

console.log("Token Response Data:", tokenResponse.data);

    const accessToken = tokenResponse.data.access_token;

    // Now you have the access token, you can use it to make API requests to Pocket on behalf of the user

    res.send("Authorization completed. You can close this window.");
  } catch (error) {
    console.error("Error exchanging authorization code:", error);
    res.status(500).send("Error during authorization.");
  }
});

// USER ACCOUNT ENDPOINTS//
//Register New User
app.post("/api/register", async (req, res) => {
  const { full_name, username, password, email } = req.body;

  try {
    const checkExistingUser =
      "SELECT * FROM users WHERE username = ? OR email = ?";
    const [existingUser] = await pool.query(checkExistingUser, [
      username,
      email,
    ]);

    console.log(existingUser);

    if (existingUser.length > 0) {
      return res
        .status(400)
        .json({ error: "Username or email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const insertUser =
      "INSERT INTO users (full_name, username, email, password) VALUES (?, ?, ?, ?)";
    await pool.query(insertUser, [full_name, username, email, hashedPassword]);

    res.status(201).json({ message: "Account created" });
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

//Log In - Authenticate User & Generate Access Token
app.post("/auth/login", async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const getUser = "SELECT * FROM users WHERE username = ? OR email = ?";
    const [user] = await pool.query(getUser, [username, email]);

    if (!user || user.length === 0) {
      return res.status(401).json({ error: "User not found" });
    }

    const validatePassword = await bcrypt.compare(password, user[0].password);

    if (!validatePassword) {
      return res.status(401).json({ error: "Invalid password" });
    }

    const accessToken = jwt.sign({ userId: user[0].id }, secretKey, {
      expiresIn: "1h",
    });
    res
      .status(200)
      .json({ message: "Authentication successful!", accessToken });
  } catch (error) {
    console.error("Error authenticating account:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

//Update User Info
app.put("/api/users/:idUsers/profile", async (req, res) => {
  const idUsers = req.params.idUsers;
  const { username, newPassword, email, bio, avatar } = req.body;

  try {
    let hashedPassword = null;

    if (newPassword) {
      hashedPassword = await bcrypt.hash(newPassword, 10);
    }

    const updateProfile =
      "UPDATE users SET username = ?, password = ?, email = ?, bio = ?, avatar = ? WHERE idUsers = ?";

    await pool.query(updateProfile, [
      username,
      hashedPassword,
      email,
      bio,
      avatar,
      idUsers,
    ]);

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
app.get("/auth/logout", (req, res) => {
  res.json({ message: "Logout successful" });
});


//POSTS//
//Create Post
app.post("/api/posts", async (req, res) => {
  const { post_type, title, content, media, media_type, status, tags } =
    req.body;

  try {
    const insertPost =
      "INSERT INTO posts (post_type, title, content, media, media_type, status) VALUES (?, ?, ?, ?, ?, ?)";

    const [insertedPost] = await pool.query(insertPost, [
      post_type,
      title,
      content,
      media,
      media_type,
      status,
    ]);

    const postId = insertedPost.insertId;
    const insertPostTags =
      "INSERT INTO post_tags (post_id, tag_id) VALUES (?, ?)";

    for (const tagName of tags) {
      const [tag] = await pool.query(
        "SELECT idtags FROM tags WHERE tag_name = ?",
        [tagName]
      );
      if (tag.length > 0) {
        const tagId = tag[0].idtags;
        await pool.query(insertPostTags, [postId, tagId]);
      }
    }

    res.status(200).json({ message: "Post created!" });
  } catch (error) {
    console.error("Error creating post:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

//Update Post
app.put("/api/posts/:postId", async (req, res) => {
  //Remember to change username & id back to NOTNULL after testing
  const postId = req.params.postId;
  const { post_type, title, content, media, media_type, status, tags } =
    req.body;

  try {
    const updatePost =
      "UPDATE posts SET post_type = ?,  title = ?, content = ?, media = ?, media_type = ?, status = ? WHERE post_id = ?";

    await pool.query(updatePost, [
      post_type,
      title,
      content,
      media,
      media_type,
      status,
      postId,
    ]);

    // Delete existing event-tag relationships for this post
    await pool.query("DELETE FROM post_tags WHERE post_id = ?", [postId]);

    // Insert new event-tag relationships for this event
    const insertPostTags =
      "INSERT INTO post_tags (post_id, tag_id) VALUES (?, ?)";
    for (const tagName of tags) {
      const [tag] = await pool.query(
        "SELECT idtags FROM tags WHERE tag_name = ?",
        [tagName]
      );
      if (tag.length > 0) {
        const tagId = tag[0].idtags;
        await pool.query(insertPostTags, [postId, tagId]);
      }
    }

    res.status(200).json({ message: "Post updated!" });
  } catch (error) {
    console.error("Error updating post:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

//Delete Post
app.delete("/api/posts/:postId", async (req, res) => {
  const postId = req.params.postId;

  try {
    // Delete associated event tags first
    const deletePostTags = "DELETE FROM post_tags WHERE post_id = ?";
    await pool.query(deletePostTags, [postId]);

    // Then delete the event itself
    const deletePost = "DELETE FROM posts WHERE post_id = ?";
    await pool.query(deletePost, [postId]);

    res.status(200).json({ message: "Post deleted!" });
  } catch (error) {
    console.error("Error deleting post:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


//EVENTS//
//Create Event
app.post("/api/events", async (req, res) => {
  const { event_name, event_date, location_text, event_description, tags } =
    req.body;

  try {
    const insertEvent =
      "INSERT INTO events (event_name, event_date, location_text, event_description) VALUES (?, ?, ?, ?)";

    const [insertedEvent] = await pool.query(insertEvent, [
      event_name,
      event_date,
      location_text,
      event_description,
    ]);

    const eventId = insertedEvent.insertId;
    const insertEventTags = `INSERT INTO event_tags (event_id, tag_id) VALUES (?, ?)`;

    for (const tagName of tags) {
      const [tag] = await pool.query(
        "SELECT idtags FROM tags WHERE tag_name = ?",
        [tagName]
      );
      if (tag.length > 0) {
        const tagId = tag[0].idtags;
        await pool.query(insertEventTags, [eventId, tagId]);
      }
    }

    res.status(200).json({ message: "Event created!" });
  } catch (error) {
    console.error("Error creating event post:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Update Event
app.put("/api/events/:eventId", async (req, res) => {
  const eventId = req.params.eventId;
  const { event_name, event_date, location_text, event_description, tags } =
    req.body;

  try {
    const updateEvent =
      "UPDATE events SET event_name = ?, event_date = ?, location_text = ?, event_description = ? WHERE event_id = ?";

    await pool.query(updateEvent, [
      event_name,
      event_date,
      location_text,
      event_description,
      eventId,
    ]);

    // Delete existing event-tag relationships for this event
    await pool.query("DELETE FROM event_tags WHERE event_id = ?", [eventId]);

    // Insert new event-tag relationships for this event
    const insertEventTags =
      "INSERT INTO event_tags (event_id, tag_id) VALUES (?, ?)";
    for (const tagName of tags) {
      const [tag] = await pool.query(
        "SELECT idtags FROM tags WHERE tag_name = ?",
        [tagName]
      );
      if (tag.length > 0) {
        const tagId = tag[0].idtags;
        await pool.query(insertEventTags, [eventId, tagId]);
      }
    }

    res.status(200).json({ message: "Event updated!" });
  } catch (error) {
    console.error("Error updating event:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

//Delete Event
app.delete("/api/events/:eventId", async (req, res) => {
  const eventId = req.params.eventId;

  try {
    // Delete associated event tags first
    const deleteEventTags = "DELETE FROM event_tags WHERE event_id = ?";
    await pool.query(deleteEventTags, [eventId]);

    // Then delete the event itself
    const deleteEvent = "DELETE FROM events WHERE event_id = ?";
    await pool.query(deleteEvent, [eventId]);

    res.status(200).json({ message: "Event deleted!" });
  } catch (error) {
    console.error("Error deleting event:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

//RSVP Event
app.post("/api/events/:eventId/RSVP/:userId", async (req, res) => {
    const { eventId } = req.params;
    const { userId, status } = req.body;

    try {
        rsvpEvent = 'INSERT INTO event_participants(event_id, user_id, status) VALUES (?, ?, ?)';
        await pool.query(rsvpEvent, [eventId, userId, status]);

        res.status(200).json({ message: "RSVP sent!" });
    } catch (error) {
      console.error("Error RSVPing for event:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
})

//Update RSVP
app.put("/api/events/:eventId/RSVP/:userId", async (req, res) => {
    const { eventId, userId } = req.params;
    const { status } = req.body;

    try {
        rsvpEvent = 'UPDATE event_participants SET status = ? WHERE event_id = ? AND user_id = ?';
        await pool.query(rsvpEvent, [status, eventId, userId]);

        res.status(200).json({ message: "RSVP updated!" });
    } catch (error) {
      console.error("Error updating RSVP status:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
})


//POLLS
//Create Poll
app.post("/api/polls", async (req, res) => {
    const { question, poll_option, tags } = req.body;
  
    try {
      const insertPoll =
        "INSERT INTO polls ( question ) VALUES (?)";
  
      const [insertedPoll] = await pool.query(insertPoll, [question]);
  
      const pollId = insertedPoll.insertId;

      const insertPollOptions = 
      'INSERT INTO poll_options (poll_id, poll_option) VALUES (?, ?)';
      
      for (const option of poll_option) {
        await pool.query(insertPollOptions, [pollId, option]);
      }

      const insertPollTags =
        "INSERT INTO poll_tags (poll_id, tag_id) VALUES (?, ?)";
  
      for (const tagName of tags) {
        const [tag] = await pool.query(
          "SELECT idtags FROM tags WHERE tag_name = ?",
          [tagName]
        );
        if (tag.length > 0) {
          const tagId = tag[0].idtags;
          await pool.query(insertPollTags, [pollId, tagId]);
        }
      }
  
      res.status(200).json({ message: "Poll created!" });
    } catch (error) {
      console.error("Error creating poll:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });
  
//Update Poll
app.put("/api/polls/:id", async (req, res) => {
    const pollId = req.params.id;
    const { question, poll_options, tags } = req.body;
  
    try {
      const updatePoll =
        "UPDATE polls SET question = ? WHERE id = ?";
  
      await pool.query(updatePoll, [question, pollId]);
  
      const updatePollOptions = 
      'UPDATE poll_options SET poll_option = ? WHERE id = ?';
      
      for (const optionData of poll_options) {
        const { id, poll_option } = optionData;
        await pool.query(updatePollOptions, [poll_option, id]);
      }

    // Delete existing poll-tag relationships for this poll
    await pool.query("DELETE FROM poll_tags WHERE poll_id = ?", [pollId]);

    // Insert new poll-tag relationships for this poll
    const insertPollTags =
      "INSERT INTO poll_tags (poll_id, tag_id) VALUES (?, ?)";
    for (const tagName of tags) {
      const [tag] = await pool.query(
        "SELECT idtags FROM tags WHERE tag_name = ?",
        [tagName]
      );
      if (tag.length > 0) {
        const tagId = tag[0].idtags;
        await pool.query(insertPollTags, [pollId, tagId]);
      }
    }
  
      res.status(200).json({ message: "Poll updated!" });
    } catch (error) {
      console.error("Error updating poll:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

//Delete Poll
app.delete("/api/polls/:id", async (req, res) => {
    const pollId = req.params.id;
  
    try {
      // Delete associated poll tags first
      const deletePollTags = "DELETE FROM poll_tags WHERE poll_id = ?";
      await pool.query(deletePollTags, [pollId]);
  
      // Then delete associated poll options
      const deletePollOptions = 
      'DELETE FROM poll_options WHERE poll_id = ?';
        await pool.query(deletePollOptions, [pollId]);

      // Then delete the poll itself
      const deletePoll = "DELETE FROM polls WHERE id = ?";
      await pool.query(deletePoll, [pollId]);
  
      res.status(200).json({ message: "Poll deleted!" });
    } catch (error) {
      console.error("Error deleting poll:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });


//SEARCH ENDPOINT
//General Search
app.get("/api/search", async (req, res) => {
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

    // Search for polls
    const pollSql = 'SELECT question FROM polls WHERE question LIKE ?';
    const [polls] = await pool.query(pollSql, [`%${q}%`]);

    // Search for skills
    const skillSql = `SELECT skill_name, description FROM skills WHERE skill_name LIKE ? OR description LIKE ?`;
    const [skills] = await pool.query(skillSql, [`%${q}%`, `%${q}%`]);

    // Combine the results
    const searchResults = {
      users: { count: users.length, data: users },
      posts: { count: posts.length, data: posts },
      events: { count: events.length, data: events },
      polls: {count: polls.length, data: polls},
      skills: { count: skills.length, data: skills },
    };

    res.json(searchResults);
  } catch (error) {
    console.error("Error performing search:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

//Get All Users
app.get("/api/users", (req, res) => {
  const sql = "SELECT full_name, username, bio FROM users";
  pool.query(sql, (err, results) => {
    if (err) {
      console.error("Error fetching users:", err);
      res.status(500).json({ error: "Internal Server Error" });
    } else {
      res.json(results);
    }
  });
});


//SKILLS/TAGS ENDPOINTS
//Show All Skills
app.get("/api/skills", (req, res) => {
  const getSkills = "SELECT skill_name, description FROM skills";
  pool.query(getSkills, (err, results) => {
    if (err) {
      console.error("Error fetching skills:", err);
      res.status(500).json({ error: "Internal Server Error" });
    } else {
      res.json(results);
    }
  });
});

//Add Skill to Profile
app.post("/api/users/:idUsers/skills", async (req, res) => {
  const userId = req.params.idUsers;
  const { skill_name, proficiency_level } = req.body;

  try {
    const checkExistingSkills = "SELECT * FROM skills WHERE skill_name = ?";
    const [exisitingSkill] = await pool.query(checkExistingSkills, [
      skill_name,
    ]);

    if (!exisitingSkill || exisitingSkill.length === 0) {
      return res.status(400).json({ error: "Skill not found" });
    }

    const skillId = exisitingSkill[0].id;

    const addSkill =
      "INSERT INTO user_skills (user_id, skill_id, proficiency_level) VALUES (?, ?, ?)";
    await pool.query(addSkill, [userId, skillId, proficiency_level]);

    res.status(200).json({ message: "Your skills have been added!" });
  } catch (error) {
    console.error("Error adding skills:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

//Search Skills
app.get("/api/search/skills", async (req, res) => {
  const { q } = req.query;

  try {
    const skillSql =
      "SELECT skill_name, description FROM skills WHERE skill_name LIKE ? OR description LIKE ?";
    const [skill] = await pool.query(skillSql, [`%${q}%`, `%${q}%`]);

    if (skill.length > 0) {
      const skillResult = {
        skills: { count: skill.length, data: skill },
      };
      res.json(skillResult);
    } else {
      res.json({ message: `'${q}' not found. See more to request additions` });
    }
  } catch (error) {
    console.error("Error searching for skill:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

//Request Skills
app.post("/api/request/skills", async (req, res) => {
  const { skill_name } = req.body;

  try {
    const checkExistingRequests =
      "SELECT * FROM skill_request WHERE skill_name = ?";
    const [existingRequest] = await pool.query(checkExistingRequests, [
      skill_name,
    ]);

    if (existingRequest.length > 0) {
      const requestStatus = existingRequest[0].status;
      const requestDate = existingRequest[0].request_date;

      response = {
        error: `${skill_name} has already been requested!`,
        status: requestStatus,
        requestDate: requestDate,
      };

      return res.status(400).json(response);
    }

    const skillRequest = "INSERT INTO skill_request (skill_name) VALUES (?)";
    await pool.query(skillRequest, [skill_name]);

    res.status(200).json({ message: "Your request has been submitted!" });
  } catch (error) {
    console.error("Error submitting request:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

//Show All Tags
app.get("/api/tags", (req, res) => {
  const getTags = "SELECT tag_name FROM tags";
  pool.query(getTags, (err, results) => {
    if (err) {
      console.error("Error fetching tags:", err);
      res.status(500).json({ error: "Internal Server Error" });
    } else {
      res.json(results);
    }
  });
});

//Search Tags
app.get("/api/search/tags", async (req, res) => {
  const { q } = req.query;

  try {
    const tagSql = "SELECT tag_name FROM tags WHERE tag_name LIKE ?";
    const [tag] = await pool.query(tagSql, [`%${q}%`]);

    if (tag.length > 0) {
      const tagResult = {
        tags: { count: tag.length, data: tag },
      };
      res.json(tagResult);
    } else {
      res.json({ message: `'${q}' not found. See more to request additions` });
    }
  } catch (error) {
    console.error("Error searching for tag:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

//INTERACTIVITY
//Follow User
// app.post('/api/' , async (req, res) => {
//     const { username } = req.body;

//     try {
//         const checkForFollower = 'SELECT * FROM'
//     }
// });


//COMMENTS
//Comment on Post
app.post("/api/comments/posts/:postId", async (req, res) => {
  const { postId } = req.params;
  const { comment_by, comment } = req.body;

  try {
    const postComment =
      "INSERT INTO comments (post_id, comment_by, comment) VALUES (?, ?, ?)";
    await pool.query(postComment, [postId, comment_by, comment]);

    res.status(200).json({ message: "Comment posted!" });
  } catch (error) {
    console.error("Error posting comment:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

//Delete Comment from Post
app.delete("/api/comments/posts/:postId/:id", async (req, res) => {
    const { id } = req.params; 

    try {
        const deleteComment = 'DELETE FROM comments WHERE id = ?';
        await pool.query(deleteComment, [id]);

        res.status(200).json({ message: "Comment deleted!" });
    } catch (error) {
        console.error("Error deleting comment:", error);
        res.status(500).json({ error: "Internal Server Error" });
    
    }
})

//Comment on Event
app.post("/api/comments/events/:eventId", async (req, res) => {
    const { eventId } = req.params;
    const { comment_by, comment } = req.body;
  
    try {
      const postComment =
        "INSERT INTO event_comments (event_id, comment_by, comment) VALUES (?, ?, ?)";
      await pool.query(postComment, [eventId, comment_by, comment]);
  
      res.status(200).json({ message: "Comment posted!" });
    } catch (error) {
      console.error("Error posting comment:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });
  
//Delete Comment from Event
app.delete("/api/comments/events/:eventId/:id", async (req, res) => {
    const { id } = req.params; 

    try {
        const deleteComment = 'DELETE FROM event_comments WHERE id = ?';
        await pool.query(deleteComment, [id]);

        res.status(200).json({ message: "Comment deleted!" });
    } catch (error) {
        console.error("Error deleting comment:", error);
        res.status(500).json({ error: "Internal Server Error" });
    
    }
})

//Comment on Poll
app.post("/api/comments/polls/:id", async (req, res) => {
    const { id } = req.params;
    const { comment_by, comment } = req.body;
  
    try {
      const postComment =
        "INSERT INTO poll_comments (poll_id, comment_by, comment) VALUES (?, ?, ?)";
      await pool.query(postComment, [id, comment_by, comment]);
  
      res.status(200).json({ message: "Comment posted!" });
    } catch (error) {
      console.error("Error posting comment:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

//Delete Comment from Poll
app.delete("/api/comments/polls/:pollId/:id", async (req, res) => {
    const { id } = req.params; 

    try {
        const deleteComment = 'DELETE FROM poll_comments WHERE id = ?';
        await pool.query(deleteComment, [id]);

        res.status(200).json({ message: "Comment deleted!" });
    } catch (error) {
        console.error("Error deleting comment:", error);
        res.status(500).json({ error: "Internal Server Error" });
    
    }
});


//SAVES
//Save Post
app.post("/api/:userId/SAVES", async (req, res) => {
    const { userId } = req.params;
    const { postId, tags, note } = req.body;
  
    try {
      const insertSavedPost =
        "INSERT INTO saved_posts (user_id, post_id, tag_id, note) VALUES (?, ?, ?, ?)";
  
      for (const tagName of tags) {
        const [tag] = await pool.query(
          "SELECT idtags FROM tags WHERE tag_name = ?",
          [tagName]
        );
        if (tag.length > 0) {
          const tagId = tag[0].idtags;
          await pool.query(insertSavedPost, [userId, postId, tagId, note]);
        }
      }

      res.status(200).json({ message: "Post saved!" });
    } catch (error) {
      console.error("Error saving post:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });
  
//Update Saved Post
app.put("/api/:userId/SAVES/:postId", async (req, res) => {
    const { userId, postId } = req.params;
    const { note, tags } = req.body;

    try {
            // Update the tags associated with the saved post
            const deleteExistingTags =
                "DELETE FROM saved_posts WHERE user_id = ? AND post_id = ?";
            await pool.query(deleteExistingTags, [userId, postId]);
    
            for (const tagName of tags) {
                const [tag] = await pool.query(
                    "SELECT idtags FROM tags WHERE tag_name = ?",
                    [tagName]
                );
                if (tag.length > 0) {
                    const tagId = tag[0].idtags;
                    const updateSavedPost =
                        "INSERT INTO saved_posts (user_id, post_id, note, tag_id) VALUES (?, ?, ?, ?)";
                    await pool.query(updateSavedPost, [userId, postId, note, tagId]);
                }
            }
    
            res.status(200).json({ message: "Saved post updated!" });
        } catch (error) {
            console.error("Error updating saved post:", error);
            res.status(500).json({ error: "Internal Server Error" });
        }
    });

//Unsave Post
app.delete("/api/:userId/SAVES/:postId", async (req, res) => {
    const { userId, postId } = req.params;

    try {
        const deleteSavedPost =
            "DELETE FROM saved_posts WHERE user_id = ? AND post_id = ?";
        await pool.query(deleteSavedPost, [userId, postId]);

        res.status(200).json({ message: "Post unsaved!" });
    } catch (error) {
        console.error("Error unsaving post:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});





// Start the server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
