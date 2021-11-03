const express = require("express");
const path = require("path");
var fs = require("fs");
var https = require("https");

const dotenv = require("dotenv");
dotenv.config();

const port = process.env.PORT || 3000;

const app = express();
app.use(express.static(path.join(__dirname, "public")));
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

const { auth, requiresAuth } = require("express-openid-connect");

const config = {
  authRequired: false,
  idpLogout: true, //login not only from the app, but also from identity provider
  secret: process.env.SECRET,
  baseURL: `https://localhost:${port}`,
  clientID: process.env.CLIENT_ID,
  issuerBaseURL: "https://dev-3ifzacnj.us.auth0.com",
  clientSecret: process.env.CLIENT_SECRET,
  authorizationParams: {
    response_type: "code",
    //scope: "openid profile email"
  },
};

// auth router attaches /login, /logout, and /callback routes to the baseURL
app.use(auth(config));

// req.isAuthenticated is provided from the auth router
app.get("/", (req, res) => {
  res.send(req.oidc.isAuthenticated() ? "Logged in" : "Logged out");
});

//app.get("/", (req, res) => res.render("pages/index"));

app.get("/profile", requiresAuth(), (req, res) => {
  res.send(JSON.stringify(req.oidc.user));
});

if(process.env.port) {
  https.createServer({
        key: fs.readFileSync("server.key"),
        cert: fs.readFileSync("server.cert"),
      },
        app).listen(port, function () {
        console.log(`Server running at https://localhost:${port}/`);
      });
} else {
  app.listen(port, () => console.log(`Listening on ${port}`));
}