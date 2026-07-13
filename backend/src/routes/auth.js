import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { register, login, getProfile, oauthCallback, forgotPassword, resetPassword } from "../controllers/authController.js";
import { validate } from "../middleware/validate.js";
import { authSchemas } from "./auth.schemas.js";
import passport from "passport";
import jwt from "jsonwebtoken";
import "../config/passport.js";

const router = Router();

router.get("/saml/login", passport.authenticate("saml"));
router.post("/saml/callback", passport.authenticate("saml", { session: false }), (req, res) => {
  res.json({ message: "SAML login successful", user: req.user });
});

router.post("/register", validate(authSchemas.register), register);

router.post("/login", validate(authSchemas.login), login);
router.get("/profile", requireAuth, getProfile);
router.post("/oauth/callback", validate(authSchemas.oauthCallback), oauthCallback);
router.post("/forgot-password", validate(authSchemas.forgotPassword), forgotPassword);
router.post("/reset-password", validate(authSchemas.resetPassword), resetPassword);

// Google OAuth
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback',
  passport.authenticate('google', { session: false }),
  (req, res) => {
    const token = jwt.sign({ id: req.user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/callback?token=${token}`);
  }
);

// GitHub OAuth
router.get('/github', passport.authenticate('github', { scope: ['user:email'] }));
router.get('/github/callback',
  passport.authenticate('github', { session: false }),
  (req, res) => {
    const token = jwt.sign({ id: req.user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/callback?token=${token}`);
  }
);


export default router;
