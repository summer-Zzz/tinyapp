const express = require("express");
const app = express();
const PORT = 8080;

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
const cookieParser = require('cookie-parser');
app.use(cookieParser());
app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": {longURL: "http://www.lighthouselabs.ca", urlUser: "82dfba"},
  "9sm5xK": {longURL: "http://www.google.com", urlUser: "ca645c"}
};

const users = {
  "82dfba": {
    id: "82dfba",
    email: "mary0283@gmail.com",
    password: "ilikeapples"
  },
  "ca645c": {
    id: "ca645c",
    email: "sleepysmith@gmail.com",
    password: "0283930ddaa"
  }
};

const generateRandomString = () => {
  return Math.floor((1 + Math.random()) * 0x1000000).toString(16).substring(1);
};

const findUserByEmail = (email) => {
  for (let userId in users) {
    if (users[userId].email === email) {
      return users[userId];
    }
  }
  return false;
};

//check the email and password
const authenticateUser = (email, password) => {
  const userId = findUserByEmail(email);
  if (userId.password === password) {
    return true;
  } else {
    return false;
  }
};

//display hello in the home page
app.get("/", (req, res) => {
  res.send("Hello!"); 
});

// app.get("/urls.json", (req, res) => {
//   res.json(urlDatabase);
// });

// to loop through the database
app.get("/urls", (req, res) => {
  const templateVars =
  { urls: urlDatabase,
    user: req.cookies["user_id"]
  };
  // if (templateVars.user) {
  res.render("urls_index", templateVars);
});

//create new shorturl and redirect to /urls/:shortURL
app.post("/urls", (req, res) => {
  const user = req.cookies["user_id"];
  if (user){
  const newShortUrl = generateRandomString();
  urlDatabase[newShortUrl] = {
   longURL: req.body.longURL,
   urlUser: user.id,
  }
  // const templateVars =
  // { 
  //   user: req.cookies["user_id"]
  // };
  res.redirect(`/urls/${newShortUrl}`);
  } else {
    res.redirect("/login");
  }
});

//delete the shortened url
app.post("/urls/:shortURL/delete", (req, res) => {
  const user = req.cookies["user_id"];
  if (user){
  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  //redirect
  res.redirect('/urls');
  } else {
    res.send("You Only Edit or Delete Your Own URLs!");
  }
});

//create new url
app.get("/urls/new", (req, res) => {
  const templateVars = {
    user: req.cookies["user_id"]
  }
  if (templateVars.user) {
    res.render("urls_new", templateVars);
  } else {
    res.redirect("/login")
  }
});

// app.post("/urls/new", (req, res) => {
//   const userFound = findUserByEmail(email);
//   if (req.cookies["user_id"]){
//   } else {
//     res.redirect("/login")
//   }
// })

app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const user = req.cookies["user_id"];
  const urlUser = urlDatabase[shortURL].urlUser;
  const longURL = urlDatabase[shortURL].longURL;
  const templateVars =
  { shortURL,
    longURL,
    urlUser,
    user };
  res.render("urls_show", templateVars);
});

//redirect to the longURL page by using a shortURL
app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL].longURL;
  res.redirect(longURL);
});

//update a url
app.post("/urls/:shortURL", (req, res) => {
  const user = req.cookies["user_id"];
  if (user){
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
    user: req.cookies["user_id"]
  };
  res.render("urls_login", templateVars);
});

//login
app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const userFound = findUserByEmail(email);
  if (email && password) {
    if (userFound) {
      if (authenticateUser(email, password)) {
        res.cookie('user_id', userFound);
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
  res.clearCookie('user_id');
  res.redirect("/urls");
});

app.get("/register", (req, res) => {
  //render the regitser template
  const templateVars = {
    user: req.cookies["user_id"]
  };
  res.render("urls_register", templateVars);
});

app.post("/register", (req, res) => {
  //the endpoint that handles the registration form data
  const newUserId = generateRandomString();
  const newEmail = req.body.newemail;
  const newPassword = req.body.newpassword;
  const userFound = findUserByEmail(newEmail);
  if (newEmail && newPassword) { //check if they put email and password
    if (!userFound) { // check if user exists
      users[newUserId] =
      {
        id: newUserId,
        email: newEmail,
        password: newPassword
      };
      res.cookie('user_id', users[newUserId]);
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

// app.get("/set", (req, res) => {
//   const a = 1;
//   res.send(`a = ${a}`);
//  });
 
//  app.get("/fetch", (req, res) => {
//   res.send(`a = ${a}`);
//  });


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});