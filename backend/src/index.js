import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";

import path from "path";

import { connectDB } from "./lib/db.js";

import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import connectionRoutes from './routes/connection.route.js';
import groupRoutes from './routes/group.route.js';
import organizationRoutes from "./routes/organization.route.js";
import projectRoutes from "./routes/project.route.js";
import channelRoutes from "./routes/channel.route.js";
import calendarRoutes from "./routes/calendar.route.js";
import { app, server } from "./lib/socket.js";

dotenv.config();

const PORT = process.env.PORT;
const __dirname = path.resolve();

app.use(express.json({ limit: "50mb" }));
app.use(cookieParser());
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      process.env.CLIENT_URL, // Allow Vercel URL from env
    ].filter(Boolean), // Remove undefined if variable not set
    credentials: true,
  })
);

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/connections", connectionRoutes);
app.use("/api/groups", groupRoutes);
app.use("/api/orgs", organizationRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/channels", channelRoutes);
app.use("/api/calendar", calendarRoutes);

// Serve static files from the frontend build directory
const frontendPath = path.join(__dirname, "../frontend/dist");
app.use(express.static(frontendPath));

// Handle React routing, return all requests to React app
app.get("*", (req, res) => {
  res.sendFile(path.join(frontendPath, "index.html"));
});

server.listen(PORT, () => {
  console.log("server is running on PORT:" + PORT);
  connectDB();
});
// Forced restart for route updates