const express = require("express");
const cors = require("cors");
require("dotenv").config();
const connectDB = require("./config/db");

const app = express();

// Connect DB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/groups", require("./routes/groupRoutes"));
app.use("/api/expenses", require("./routes/expenseRoutes"));
app.use("/api/activities", require("./routes/activityRoutes"));
// app.use("/api/users", require("./routes/userRoutes"));

// Test route
app.get("/", (req, res) => {
  res.send("SmartSplit Trial Backend Running ");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`Server running on port ${PORT}`)
);
