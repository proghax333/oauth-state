const express = require("express");
const dotenv = require("dotenv");
const passport = require("passport");
const NullStore = require("passport-oauth2/lib/state/null");

const app = express();
dotenv.config();

const GoogleStrategy = require("passport-google-oauth20").Strategy;
const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET } = process.env;

passport.use(
  new GoogleStrategy(
    {
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:5000/auth/google/callback",
    },
    function (accessToken, refreshToken, profile, done) {
      done(null, profile);
    }
  )
);

app.get("/auth/google", (req, res, next) => {
  /**
   * Two types are possible: "login" | "create"
   * Examples:
   *  http://localhost:5000/auth/google?type=login
   *  http://localhost:5000/auth/google?type=create
   */
  const { type } = req.query;
  if (!type || (type !== "login" && type !== "create")) {
    return res.json({
      message: "Error! Invalid login type! Should be `login` or `create`.",
    });
  }

  passport.authenticate("google", {
    scope: ["profile"],
    state: type,
    session: false,
  })(req, res, next);
});

app.get(
  "/auth/google/callback",
  (req, res, next) => {
    passport.authenticate(
      "google",
      {
        failureRedirect: "/login",
        session: false,
      }
      /* You can a use callback here if you don't want to use passport.initialize(). */
      // (err, user, info) => {}
    )(req, res, next);
  },
  (req, res) => {
    req.login("Hello", () => {});
    req.send("OK");
  }
);

app.listen(5000, () => {
  console.log("App started on port 5000.");
});
