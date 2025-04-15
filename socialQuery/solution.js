import express from "express";
import bodyParser from "body-parser";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import pkg from 'pg';
const { Client } = pkg;

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const port = 3001;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));
app.set("views", join(__dirname, "views"));
app.set("view engine", "ejs");

// PostgreSQL setup
const client = new Client({
  user: "postgres",
  host: "localhost",
  database: "Dbms-Project",
  password: "6868",
  port: 5432,
});

client.connect()
  .then(() => console.log("Connected to PostgreSQL"))
  .catch(err => console.error("PostgreSQL connection error:", err.stack));

// Routes
app.get("/", (req, res) => {
  res.render("index");
});
app.get("/instagram", (req, res) => {
  console.log("Instagram route hit!");
  res.render("instagram");
});

app.post("/submit", async (req, res) => {
  const { query: selectedQuery, userId } = req.body;
  const currentUserId = userId || 1;

  let sql = "";
  let values = [];
  let queryTitle = selectedQuery;

  switch (selectedQuery) {
    case "Unliked Post":
      queryTitle = "Posts with No Likes";
      sql = `SELECT p.post_id, p.caption, p.created_at, u.username 
             FROM posts p 
             JOIN users u ON p.user_id = u.user_id 
             LEFT JOIN post_likes pl ON p.post_id = pl.post_id 
             WHERE pl.post_id IS NULL;`;
      break;
    case "Removed Comment":
      queryTitle = "Users Whose Comment Was Removed";
      sql = "SELECT comment_id, comment_text, created_at FROM comments WHERE is_deleted = TRUE;";
      break;
    case "Fan(Not Followed by You)":
      queryTitle = "Users Who Follow You But You Don't Follow Back";
      sql = `SELECT u.user_id, u.username 
             FROM users u 
             WHERE u.user_id != $1 
             AND u.user_id IN (
               SELECT follower_id FROM follows WHERE followee_id = $1
             ) 
             AND u.user_id NOT IN (
               SELECT followee_id FROM follows WHERE follower_id = $1
             );`;
      values = [currentUserId];
      break;
    case "Doesn't Follow You Back":
      queryTitle = "Users You Follow Who Don't Follow You Back";
      sql = `SELECT u.user_id, u.username 
             FROM users u 
             WHERE u.user_id != $1 
             AND u.user_id IN (
               SELECT followee_id FROM follows WHERE follower_id = $1
             ) 
             AND u.user_id NOT IN (
               SELECT follower_id FROM follows WHERE followee_id = $1
             );`;
      values = [currentUserId];
      break;
    case "Profile Visitors":
      queryTitle = "Recent Profile Visitors";
      sql = `SELECT pv.visitor_id, u.username, pv.visited_at 
             FROM profile_visits pv 
             JOIN users u ON pv.visitor_id = u.user_id 
             WHERE pv.visited_id = $1;`;
      values = [currentUserId];
      break;
    case "Unfollowed You":
      queryTitle = "Users Who Have Unfollowed You";
      sql = `SELECT f.follower_id, u.username, f.unfollowed_at 
             FROM follows f 
             JOIN users u ON f.follower_id = u.user_id 
             WHERE f.followee_id = $1 AND f.is_active = FALSE;`;
      values = [currentUserId];
      break;
    case "Auto Comment Flagger":
      queryTitle = "Flagged Comments";
      sql = `SELECT fc.comment_id, c.comment_text, fc.reason, fc.flagged_at 
             FROM flagged_comments fc 
             JOIN comments c ON fc.comment_id = c.comment_id;`;
      break;
    case "Engagement Analysis":
      queryTitle = "Post Engagement Analysis";
      sql = `SELECT c.user_id, u.username, COUNT(fc.comment_id) AS flagged_count 
             FROM flagged_comments fc 
             JOIN comments c ON fc.comment_id = c.comment_id 
             JOIN users u ON c.user_id = u.user_id 
             GROUP BY c.user_id, u.username 
             HAVING COUNT(fc.comment_id) >= 10;`;
      break;
    case "Best Posting Hours":
      queryTitle = "Best Hours for Engagement";
      sql = `SELECT e.post_id, e.likes, e.unlikes, e.comments, e.uncomments, e.shares, p.caption 
             FROM engagement e 
             JOIN post p ON e.post_id = p.post_id;`;
      break;
    case "User Best Hours":
      queryTitle = "Users' Best Posting Hours";
      sql = `SELECT u.username, bpt.best_hour 
             FROM best_post_times bpt 
             JOIN users u ON bpt.user_id = u.user_id;`;
      break;
    default:
      res.send("No query matched.");
      return;
  }

  try {
    const result = await client.query(sql, values);
    res.render("results", {
      queryTitle,
      rows: result.rows
    });
  } catch (err) {
    console.error("Database query error:", err);
    res.status(500).send("Something went wrong.");
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
