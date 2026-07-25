import express from "express";
import { checkAuth, login, logout, signup, updateProfile, sendOtp, verifyOtp, requestEmailChange, verifyEmailChange, registerDevice, loginWithPin, revokeDevice } from "../controllers/auth.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);

router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);
router.post("/register-device", protectRoute, registerDevice);
router.post("/login-with-pin", loginWithPin);
router.delete("/devices/:deviceId", protectRoute, revokeDevice);

router.put("/update-profile", protectRoute, updateProfile);
router.post("/request-email-change", protectRoute, requestEmailChange);
router.post("/verify-email-change", protectRoute, verifyEmailChange);

router.get("/check", checkAuth);

export default router;