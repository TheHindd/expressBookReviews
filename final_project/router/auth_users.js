const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [
  {
    "username": "hind",
    "password": "123"
}
];

const isValid = (username)=>{ 
  let userswithsamename = users.filter((user) => {
        return user.username === username;
    });
    if (userswithsamename.length > 0) {
        return true;
    } else {
        return false;
    }
}


const authenticatedUser = (username,password)=>{ 

  let isAuthenticated = users.filter((user) => {
    return (user.username ==username && user.password== password);
  });

  if (isAuthenticated.length >0 ){
    return true;
  } else {
    return false;
  }
}


regd_users.post("/login", (req,res) => {
  
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
    return  res.status(404).json({ message: "please provide username & password" });
  }

  if (authenticatedUser(username, password)) {
        
        let accessToken = jwt.sign({
            data: password
        }, 'access', { expiresIn: 60 * 60 });

        req.session.authorization = {
            accessToken, username
        }
        return res.status(200).send("User successfully logged in");
    } else {
        return res.status(208).json({ message: "Invalid Login. Check username and password" });
    }
});


 
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const review = req.query.review;
  const username = req.session.authorization?.username; // ✅ fixed

  if (!username) {
    return res.status(403).json({ message: "User not logged in" });
  }

  if (!review) {
    return res.status(400).json({ message: "Review query parameter is required" });
  }

  const book = books[isbn];
  if (!book) {
    return res.status(404).json({ message: "Book not found" });
  }

  // Initialize reviews object if not present
  if (!book.reviews) {
    book.reviews = {};
  }

  // Add or update review
  book.reviews[username] = review;

  return res.status(200).json({
    message: "Review added or updated successfully",
    reviews: book.reviews,
  });
});


regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const username = req.session.authorization?.username;

  if (!username) {
    return res.status(403).json({ message: "User not logged in" });
  }

  const book = books[isbn];
  if (!book) {
    return res.status(404).json({ message: "Book not found" });
  }

  if (!book.reviews[username]) {
    return res.status(404).json({ message: "No review found for this user on this book" });
  }

  // Delete only that user's review
  delete book.reviews[username];

  return res.status(200).json({
    message: "Review deleted successfully",
    reviews: book.reviews,
  });
});


module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
