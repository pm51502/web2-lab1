const express = require("express");
const path = require("path");
var fs = require("fs");
var https = require("https");
const cors = require('cors');

const app = express();

app.use(cors());
app.options('*', cors());

const dotenv = require("dotenv");
dotenv.config();
const port = process.env.PORT || 3000;

app.use(express.json())
app.use(express.urlencoded({ extended: true}))

app.use(express.static(path.join(__dirname, "public")));
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

const { auth, requiresAuth } = require("express-openid-connect");

const config = {
  authRequired: false,
  idpLogout: true, //login not only from the app, but also from identity provider
  secret: process.env.SECRET,
  //baseURL: `https://localhost:${port}`,
  baseURL: `https://web2lab1.herokuapp.com/`,
  clientID: process.env.CLIENT_ID,
  issuerBaseURL: "https://dev-3ifzacnj.us.auth0.com",
  clientSecret: process.env.CLIENT_SECRET,
  authorizationParams: {
    response_type: "code"
    //scope: "openid profile email"
  }
};

// auth router attaches /login, /logout, and /callback routes to the baseURL
app.use(auth(config));

var users = [];

app.get("/", (req, res) => {
  req.user = {
    isAuthenticated : req.oidc.isAuthenticated()
  };
  if(req.user.isAuthenticated) {
    let email = req.oidc.user.email;
    req.user.email = email;
  }
  res.render("pages/index", {user : req.user});
});

app.get("/profile", requiresAuth(), (req, res) => {
  res.send(JSON.stringify(req.oidc.user));
});

app.get("/user", (req, res) => {
  if(req.oidc.user != undefined){
    res.send(JSON.stringify(req.oidc.user));
  } else {
    res.send(JSON.stringify({}));  
  }
});

app.get("/users", requiresAuth(), (req, res) => {
  res.send(JSON.stringify(users));
});

app.post("/users", requiresAuth(), (req, res) => {
  let user = req.body;

  let currentUser = users.find(u => u.email == user.email);

  if(currentUser == undefined){
    users.push(user);
  } else {
    let i = users.indexOf(currentUser);
    if(i > -1) users.splice(i, 1);

    users.push(user);

    //currentUser.latitude = user.latitude;
    //currentUser.longitude = user.longitude;
    //currentUser.timestamp = user.timestamp;
  }
});


if(port == 443) {
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