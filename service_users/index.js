const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(cors());
app.use(express.json());

// Имитация базы данных в памяти (LocalStorage)
let fakeUsersDb = {};
let currentId = 1;

// Routes
app.get("/users", (req, res) => {
  const users = Object.values(fakeUsersDb);
  res.json(users);
});
app.post("/users/register", async (req, res) => {
  const { email, password, name } = req.body;

  if (!email || !password || !name) {
    return res.status(400).json({ error: "Missing fields" });
  }

  const existingUser = Object.values(fakeUsersDb).find(
    (u) => u.email === email
  );
  if (existingUser) {
    return res.status(409).json({ error: "User already exists" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = { id: currentId++, email, password: hashedPassword, name };
  fakeUsersDb[newUser.id] = newUser;

  res
    .status(201)
    .json({ id: newUser.id, email: newUser.email, name: newUser.name });
});
app.post("/users", (req, res) => {
  const userData = req.body;
  const userId = currentId++;

  const newUser = {
    id: userId,
    ...userData,
  };

  fakeUsersDb[userId] = newUser;
  res.status(201).json(newUser);
});

app.get("/users/health", (req, res) => {
  res.json({
    status: "OK",
    service: "Users Service",
    timestamp: new Date().toISOString(),
  });
});

app.get("/users/status", (req, res) => {
  res.json({ status: "Users service is running" });
});

app.get("/users/:userId", (req, res) => {
  const userId = parseInt(req.params.userId);
  const user = fakeUsersDb[userId];

  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  res.json(user);
});

app.put("/users/:userId", (req, res) => {
  const userId = parseInt(req.params.userId);
  const updates = req.body;

  if (!fakeUsersDb[userId]) {
    return res.status(404).json({ error: "User not found" });
  }

  const updatedUser = {
    ...fakeUsersDb[userId],
    ...updates,
  };

  fakeUsersDb[userId] = updatedUser;
  res.json(updatedUser);
});

app.delete("/users/:userId", (req, res) => {
  const userId = parseInt(req.params.userId);

  if (!fakeUsersDb[userId]) {
    return res.status(404).json({ error: "User not found" });
  }

  const deletedUser = fakeUsersDb[userId];
  delete fakeUsersDb[userId];

  res.json({ message: "User deleted", deletedUser });
});

// Start server
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Users service running on port ${PORT}`);
});
