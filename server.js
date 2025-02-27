const express = require("express");
const loggedIn = require("./middleware/authMiddleware");
const apiRoute = require("./routes/api");
const authRoute = require("./routes/auth");
const migrateRoute = require("./routes/migrate");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 8080;

// middleware to pass JSON bodies
app.use(express.json());

// parse requests of content-type application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

// Use routes
app.use("/api", loggedIn, apiRoute);
app.use("/auth", authRoute);
app.use("/migrate", migrateRoute);

app.get("/", (req, res) => {
  res.status(200).json({ code: 200, message: "All ok" });
});

app.use((req, res, next) => {
  res.status(404).json({ code: 404, message: "Endpoint not found!" });
});

app.use((err, req, res, next) => {
  const code = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(code);
  res.json({ message: err.message, stack: err.stack });
});

app.listen(port, () => {
  console.log(`Server running on port: ${port}`);
});
