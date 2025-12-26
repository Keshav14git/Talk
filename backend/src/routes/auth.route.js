import express from "express";
import { checkAuth, login, logout, signup, updateProfile, sendOtp, verifyOtp, googleAuth, requestEmailChange, verifyEmailChange } from "../controllers/auth.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);

// New Linear-style Auth Routes
router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);
router.post("/google", googleAuth);

router.put("/update-profile", protectRoute, updateProfile);
router.post("/request-email-change", protectRoute, requestEmailChange);
router.post("/verify-email-change", protectRoute, verifyEmailChange);

router.get("/check", checkAuth);

export default router;