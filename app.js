const multer = require("multer");
const session = require("express-session");
const express = require("express");
const mongoose = require("mongoose");
const User = require("./models/users");
const checkDb = require("./utils");
const auth = require("./middleware");
const fs = require("fs");
const serveIndex = require("serve-index");
const path = require("path");
const app = express();

mongoose
  .connect(
    "mongodb+srv://parv:12341234@task-manager.kwcw1do.mongodb.net/FileShare"
  )
  .then(() => {
    console.log("db online");
  })
  .catch((err) => {
    console.error("Connection error", err);
  });

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("./public"));
app.set("view-engine", "./views");
app.use(
  session({
    resave: false,
    saveUninitialized: false,
    secret: "secret",
    // cookie: { maxAge: 30 * 60 * 1000 } // adds age to the session
  })
);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, `./uploads/${req.session.user}`);
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage: storage });

app.get("/", (req, res) => {});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const exists = await checkDb(username, password);
    // console.log(username, password, exists)
    if (!exists.length) {
      res
        .status(403)
        .render("error.ejs", { error: "User Does Not Exist, Please Signin." });
    }

    req.session.user = username;
    res.redirect(`/dashboard/${username}`);
  } catch (error) {
    res.status(404).render("error.ejs", { error: error });
  }
});

app.post("/signin", async (req, res) => {
  const { fullname, username, password } = req.body;

  try {
    const exists = await checkDb(username, password);
    console.log(exists);
    if (exists.length) {
      res
        .status(403)
        .render("error.ejs", { error: "User Already Exists, Please Login." });
    }

    await User.create({
      fullname: fullname,
      username: username,
      password: password,
    });

    fs.mkdir(`./uploads/${username}`, (err) => {
      if (err) {
        res.status(404).render("error.ejs", { error: error });
      }
    });
    req.session.user = username;
    res.status(200).redirect(`/dashboard/username`);
  } catch (error) {
    res.status(404).render("error.ejs", { error: error });
  }
  console.log("user created");
});

app.get("/dashboard/:username", auth, (req, res) => {
  res.status(200).render("dashboard.ejs", { username: req.session.user });
});

app.get("/upload/:username", auth, (req, res) => {
  res.render("upload.ejs", { username: req.session.user });
});

app.post("/upload", upload.single("file"), auth, (req, res) => {
  res.status(200).redirect(`/dashboard/${req.session.user}`);
});

app.get("/files/:username", auth, (req, res, next) => {
  const folder = path.join(__dirname, `./uploads/${req.session.user}`);
  app.use(
    `/files/${req.params.username}`,
    express.static(folder),
    serveIndex(folder, { icons: true })
  );
  next();
});

app.get("/logout", auth, (req, res) => {
  req.session.destroy();
  res.status(200).redirect("/");
});

app.listen(3000, () => {
  console.log("server online");
});
