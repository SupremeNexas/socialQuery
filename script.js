// import express from "express";
// import bodyParser from "body-parser";
// import { dirname, join } from "path";
// import { fileURLToPath } from "url";

// const __dirname = dirname(fileURLToPath(import.meta.url));

// const app = express();
// const port = 3000;

// //index page


// app.use(express.static("public"));
// app.get("/", (req, res) => {
//   res.render("index.ejs");
// });

// app.get("/about", (req, res) => {
//   res.render("about.ejs");
// });

// app.get("/contact", (req, res) => {
//   res.render("contact.ejs");
// });

// app.listen(port, () => {
//   console.log(`Server running on port ${port}`);
// });



// // ✅ Middleware to parse form data
// app.use(bodyParser.urlencoded({ extended: true }));
// app.use(express.json());  // ✅ Ensure JSON requests are handled

// // ✅ Serve static files correctly
// app.use(express.static(join(__dirname, "public")));

// app.get("/", (req, res) => {
//     res.sendFile(join(__dirname, "public", "instagram.html"));
// });

// app.post("/submit", (req, res) => {
//     console.log(req.body); // ✅ Check what data is being received

//     const userQuery = req.body.query; // ✅ Correctly get form data

//     if (!userQuery) {
//         return res.status(400).send("Error: No query received.");
//     }

//     res.send(`
//         <h1>Query Received!</h1>
//         <h2>Your Query: ${userQuery}</h2>
//         <a href="/">Go Back</a>
//     `);
// });

// app.listen(port, () => {
//     console.log(`Server running at http://localhost:${port}`);
// });

import express from "express";
import bodyParser from "body-parser";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const app = express();
const port = 3000;

// ✅ Set EJS as the view engine
app.set("view engine", "ejs");
app.set("views", join(__dirname, "views"));

// ✅ Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(join(__dirname, "public"))); // Serve static assets

// ✅ Routes
app.get("/", (req, res) => {
  res.render("index"); // Renders views/index.ejs
});

app.get("/about", (req, res) => {
  res.render("about");
});

app.get("/contact", (req, res) => {
  res.render("contact");
});

// ✅ Correct Instagram Route
app.get("/instagram", (req, res) => {
  res.render("instagram"); // This looks for views/instagram.ejs
});

// ✅ Start server
app.listen(port, () => {
  console.log(`✅ Server running at http://localhost:${port}`);
});
app.post('/submit', (req, res) => {
  const selectedOptions = req.body.options;
  // Process the data
  res.send('Analysis requested: ' + selectedOptions);
});