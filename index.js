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
  baseURL: `https://localhost:${port}`,
  //baseURL: `https://web2lab1.herokuapp.com/`,
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

var users = [{
  email: "rops@gmail.com",
  latitude: 45.8169859,
  longitude: 18.027589,
  timestamp: '04/10/2021 20:29:05' //
}];

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

app.get("/users", (req, res) => {
  console.log("GET /users")

  let email = req.body
  if(email != undefined){
    console.log(email)
  }
  res.send(JSON.stringify(users));
});

app.post("/users", (req, res) => {
  let user = req.body;
  if(!users.find(u => u.email == user.email)) users.push(user);
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