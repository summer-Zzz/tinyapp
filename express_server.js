const express = require("express");
const app = express();
const PORT = 8080; 

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
const cookieParser = require('cookie-parser');
app.use(cookieParser());
app.set("view engine", "ejs") 

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
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
}

 function generateRandomString() {
  return Math.floor((1 + Math.random()) * 0x1000000).toString(16).substring(1);
}

const findUserByEmail = (email) => {
  for (userId in users) {
    if (users[userId].email === email) {
      return users[userId];
    }
  }
  return false;
}

const authenticateUser = (email, password) => {
  const foundUser = findUserByEmail(email);
  if(foundUser && userFound.password === password){
    return userFound;
  } else {
    return false;
  }
}

app.get("/", (req, res) => {
  res.send("Hello!"); //display hello in the home page
});

// app.get("/urls.json", (req, res) => {
//   res.json(urlDatabase);
// });

app.get("/urls", (req, res) => {
  const templateVars = 
  { urls: urlDatabase,
    user: req.cookies["user"]
  };
  res.render("urls_index", templateVars);
  // to loop through the database
});

app.post("/urls", (req, res) => {
  const newShortUrl = generateRandomString();
  urlDatabase[newShortUrl] = req.body.longURL;
  res.redirect(`/urls/${newShortUrl}`);
})

app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL
  //delete the shortened url
  delete urlDatabase[shortURL];
  //redirect
  res.redirect('/urls');
})

app.get("/urls/new", (req, res) => {
  const templateVars = 
  {
    user: req.cookies["user"]
  };
  res.render("urls_new", templateVars);
  //create new url
});

app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL; 
  const templateVars = 
  { shortURL: shortURL, 
    longURL: urlDatabase[shortURL],
    user: req.cookies["user"] };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL; 
  const longURL = urlDatabase[shortURL];
  res.redirect(longURL);
  //redirect to the longURL page by using a shortURL
});

// app.get("/urls/:shortURL", (req, res) => {
//   const templateVars = 
//   {shortURL: req.params.shortURL,
//     longURL: req.query.longURL}
//   res.render('urls_show', templateVars);
// })


app.post("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = req.body.longURL;
  // const longURL = urlDatabase[shortURL];
  // updateURL(shortURL, longURL);
  urlDatabase[shortURL] = longURL;
  res.redirect('/urls');
  return;
  //update a url
})

// app.post("/login", (req, res) => {
//   res.cookie('username', req.body.username);
//   res.redirect("/urls");
// })

app.post("/logout", (req, res) => {
  res.clearCookie('user');
  res.redirect("/urls");
})

app.get("/register", (req, res) => {
  //render the regitser template
  const templateVars = {
    user: req.cookies["user"]
  };
  res.render("urls_register", templateVars)
})

app.post("/register", (req, res) => {
  //the endpoint that handles the registration form data
  const newUserId = generateRandomString();
  const newEmail = req.body.email;
  const newPassword = req.body.password;
  console.log(users)
  const userFound = findUserByEmail(newEmail);
  if (newEmail && newPassword) { //check if they put email and password
    if (!userFound ) { // check if user exist
      users[newUserId] = 
      {
        id: newUserId,
        email: newEmail,
        password: newPassword
      }
      res.cookie('user', users[newUserId]);
      res.redirect('/urls');
    } else {
      res.status(400).send('The user already exists!');
    }
  } else {
    res.status(400).send('Put Something Here!');
  }
})

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