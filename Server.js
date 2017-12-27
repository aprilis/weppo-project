var http = require("http")
var express = require("express")
var multer = require("multer")
var cookieParser = require("cookie-parser")
var session = require("express-session")
var FileStore = require("session-file-store")(session)
var csurf = require("csurf")

var app = express()
var upload = multer({
    dest: "files/"
})
var csrfProtect = csurf()

app.set("view engine", "ejs")
app.use(cookieParser())
app.use(session({
    store: new FileStore({
        path: "./sessions"
    }),
    resave: true,
    saveUninitialized: true,
    secret: "vueig7rewuigdvyufw"
}));

app.get("/", csrfProtect, (req, res) => {
    res.render("index.ejs", { token: req.csrfToken() })
})

app.post("/", upload.array(), csrfProtect, (req, res) => {
    req.session.login = req.body.user
    res.redirect("/games")
})

app.get("/games", checkLogin, (req, res) => {
    res.render("games.ejs", { user: req.session.login })
})

app.get("/games/crossncircle", checkLogin, (req, res) => {
    res.render("games/crossncircle.ejs", { user: req.session.login })
})

app.post("/games/crossncircle", checkLogin, upload.single("file"), (req, res) => {
    console.log(req.file)
    res.setHeader("Content-type", "text/html; charset=utf-8")
    res.end("OK")
})

function checkLogin(req, res, next) {
    if(req.session.login != "admin") {
        next()
    }
    else {
        res.setHeader("Content-type", "text/html; charset=utf-8")
        res.end("Nie masz uprawnień do wyświetlenia tej strony")
    }
}

app.get("/logout", (req, res) => {
    delete req.session.login
    res.redirect("/")
})

http.createServer(app).listen(3000)