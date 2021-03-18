const express = require("express");
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');
const saltRound = 10;
const app = express();
const PORT = 8080;
const findUserByEmail = require('./helpers');


app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
}))

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");


const urlDatabase = {
  "b2xVn2": {longURL: "http://www.lighthouselabs.ca", urlUser: "82dfba"},
  "9sm5xK": {longURL: "http://www.google.com", urlUser: "ca645c"}
};

const users = {
  "82dfba": {
    id: "82dfba",
    email: "mary0283@gmail.com",
    password: bcrypt.hashSync("ilikeapples", saltRound)
  },
  "ca645c": {
    id: "ca645c",
    email: "sleepysmith@gmail.com",
    password: bcrypt.hashSync("0283930ddaa", saltRound)
  }
};

//check the email and password
const authenticateUser = (email, password) => {
  const userId = findUserByEmail(email, users);
  if (bcrypt.compareSync(password, userId.password)) {
    return true;
  } else {
    return false;
  }
};

const generateRandomString = () => {
  return Math.floor((1 + Math.random()) * 0x1000000).toString(16).substring(1);
};


//display hello in the home page
app.get("/", (req, res) => {
  res.send("Hello!");
});

// to loop through the database
app.get("/urls", (req, res) => {
  const templateVars =
  { urls: urlDatabase,
    user: req.session["user_id"]
  };
  res.render("urls_index", templateVars);
});

//create new shorturl and redirect to /urls/:shortURL
app.post("/urls", (req, res) => {
  const user = req.session["user_id"];
  if (user) {
    const newShortUrl = generateRandomString();
    urlDatabase[newShortUrl] = {
      longURL: req.body.longURL,
      urlUser: user.id
    };
    res.redirect(`/urls/${newShortUrl}`);
  } else {
    res.redirect("/login");
  }
});

//delete the shortened url
app.post("/urls/:shortURL/delete", (req, res) => {
  const user = req.session["user_id"];
  if (user) {
    const shortURL = req.params.shortURL;
    delete urlDatabase[shortURL];
    res.redirect('/urls');
  } else {
    res.send("You Only Edit or Delete Your Own URLs!");
  }
});


//create new url
app.get("/urls/new", (req, res) => {
  const templateVars = {
    user: req.session["user_id"]
  };
  if (templateVars.user) {
    res.render("urls_new", templateVars);
  } else {
    res.redirect("/login");
  }
});


app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const user = req.session["user_id"];
  if (user) {
    if (urlDatabase[shortURL]) {
      if (urlDatabase[shortURL].urlUser === user.id) {
    const longURL = urlDatabase[shortURL].longURL;
    const templateVars =
    { shortURL,
      longURL,
      user };
    res.render("urls_show", templateVars);
      } else {
        res.send("You don't own this URL!");
      }
    } else {
        res.send("Given ID does not exist!");
    }
  } else {
    res.send ('Please Login')
  }
});

//redirect to the longURL page by using a shortURL
app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  if (urlDatabase[shortURL]) {
  const longURL = urlDatabase[shortURL].longURL;
  res.redirect(longURL);
  } else {
    res.send ('Given ID does not exist!')
  }
});

//update a url
app.post("/urls/:shortURL", (req, res) => {
  const user = req.session["user_id"];
  if (user) {
    const shortURL = req.params.shortURL;
    const longURL = req.body.longURL;
    urlDatabase[shortURL].longURL = longURL;
    res.redirect('/urls');
    return;

  } else {
    res.send("You Only Edit or Delete Your Own URLs!");
  }
});




app.get("/login", (req, res) => {
  const templateVars = {
    user: req.session["user_id"]
  };
  res.render("urls_login", templateVars);
});

//login
app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const userFound = findUserByEmail(email, users);
  if (email && password) {
    if (userFound) {
      if (authenticateUser(email, password)) {
        req.session["user_id"] = userFound;
        res.redirect("/urls");
      } else {
        res.status(403).send('Wrong Password!');
      }
    } else {
      res.status(403).send('User Not Found');
    }
  } else {
    res.status(403).send('Put Something Here!');
  }
});

app.post("/logout", (req, res) => {
  req.session["user_id"] = null;
  res.redirect("/urls");
});

 //render the regitser template
app.get("/register", (req, res) => {
  const templateVars = {
    user: req.session["user_id"]
  };
  res.render("urls_register", templateVars);
});

//the endpoint that handles the registration form data
app.post("/register", (req, res) => {
  const newUserId = generateRandomString();
  const newEmail = req.body.newemail;
  const newPassword = req.body.newpassword;
  const hashedPassword = bcrypt.hashSync(newPassword, saltRound);
  const userFound = findUserByEmail(newEmail, users);
  if (newEmail && newPassword) { //check if they put email and password
    if (!userFound) { // check if user exists
      users[newUserId] =
      {
        id: newUserId,
        email: newEmail,
        password: hashedPassword
      };
      req.session["user_id"] = users[newUserId];
      res.redirect('/urls');
    } else {
      res.status(400).send('The user already exists!');
    }
  } else {
    res.status(400).send('Put Something Here!');
  }
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});