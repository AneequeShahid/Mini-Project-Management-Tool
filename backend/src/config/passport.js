import passport from "passport";
import { Strategy as SAMLStrategy } from "passport-saml";
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as GitHubStrategy } from 'passport-github2';
import { User } from '../models/user.js';

const samlConfig = {
  entryPoint: process.env.SAML_ENTRY_POINT,
  issuer: process.env.SAML_ISSUER,
  callbackUrl: process.env.SAML_CALLBACK_URL,
  cert: process.env.SAML_CERT,
};

// Only initialize SAML if the required config is present
if (samlConfig.entryPoint && samlConfig.issuer && samlConfig.cert) {
  passport.use('saml', new SAMLStrategy(samlConfig, (profile, done) => {
    return done(null, profile);
  }));
}

// Google Strategy
const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
if (googleClientId && googleClientSecret) {
  passport.use(new GoogleStrategy({
    clientID: googleClientId,
    clientSecret: googleClientSecret,
    callbackURL: `${process.env.API_URL || 'http://localhost:4000'}/api/auth/google/callback`
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      let user = await User.findOne({ email: profile.emails[0].value });
      if (!user) {
        user = await User.create({
          name: profile.displayName,
          email: profile.emails[0].value,
          avatar: profile.photos[0]?.value,
          username: profile.emails[0].value.split('@')[0],
          accounts: [{
            provider: 'google',
            providerId: profile.id,
            accessToken,
            refreshToken
          }]
        });
      }
      return done(null, user);
    } catch (err) {
      return done(err);
    }
  }));
}

// GitHub Strategy
const githubClientId = process.env.GITHUB_CLIENT_ID;
const githubClientSecret = process.env.GITHUB_CLIENT_SECRET;
if (githubClientId && githubClientSecret) {
  passport.use(new GitHubStrategy({
    clientID: githubClientId,
    clientSecret: githubClientSecret,
    callbackURL: `${process.env.API_URL || 'http://localhost:4000'}/api/auth/github/callback`
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      const email = profile.emails?.[0]?.value || `${profile.id}@github.com`;
      let user = await User.findOne({
        $or: [
          { email },
          { 'accounts.providerId': profile.id, 'accounts.provider': 'github' }
        ]
      });
      if (!user) {
        user = await User.create({
          name: profile.displayName || profile.username,
          email,
          avatar: profile.photos?.[0]?.value,
          username: profile.username,
          accounts: [{
            provider: 'github',
            providerId: profile.id,
            accessToken,
            refreshToken
          }]
        });
      }
      return done(null, user);
    } catch (err) {
      return done(err);
    }
  }));
}

export { passport };
