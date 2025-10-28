const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {

    const username = req.body.username;
    const password = req.body.password;
   
    if (username && password) {
        if (!isValid(username)) {

            users.push({"username": username, "password": password});
            return res.status(200).json({message: "User  added"});
        } else {
            return res.status(404).json({message: "User exists"});
        }
    }

    return res.status(404).json({message: "Unable to register user."});
});

// Get the book list available in the shop
public_users.get("/", async (req, res) => {
  try {

    const getBooks = new Promise((resolve, reject) => {
      setTimeout(() => resolve(books), 1000);
    });

    const bookList = await getBooks;
    return res.status(200).json(bookList);

  } catch (error) {
    return res.status(500).json({ message: "Error fetching books", error: error.message });
  }
});

public_users.get("/isbn/:isbn", (req, res) => {
  const isbn = req.params.isbn;

  const getBookByISBN = new Promise((resolve, reject) => {
    if (books[isbn]) {
      resolve(books[isbn]);
    } else {
      reject("Book not found");
    }
  });

  getBookByISBN
    .then(book => res.status(200).json(book))
    .catch(err => res.status(404).json({ message: err }));
});

  
// Get book details based on author

public_users.get("/author/:author", async (req, res) => {
  const author = req.params.author;

  try {
    const getBooksByAuthor = new Promise((resolve, reject) => {
      const booksByAuthor = Object.values(books).filter(
        (book) => book.author.toLowerCase() === author.toLowerCase()
      );

      if (booksByAuthor.length > 0) resolve(booksByAuthor);
      else reject("No books found for this author");
    });

    const result = await getBooksByAuthor;
    return res.status(200).json(result);

  } catch (error) {
    return res.status(404).json({ message: error });
  }
});

// Get all books based on title

public_users.get("/title/:title", (req, res) => {
  const title = req.params.title;

  const getBooksByTitle = new Promise((resolve, reject) => {
    const booksByTitle = Object.values(books).filter(
      (book) => book.title.toLowerCase() === title.toLowerCase()
    );

    if (booksByTitle.length > 0) resolve(booksByTitle);
    else reject("No books found with this title");
  });

  getBooksByTitle
    .then(result => res.status(200).json(result))
    .catch(err => res.status(404).json({ message: err }));
});


//  Get book review
public_users.get('/review/:isbn',function (req, res) {
   
  const isbn = req.params.isbn;
  const book = books[isbn];

  if (book && book.reviews) {
    res.json(book.reviews);
  } else {
    res.json({ message: "No reviews found for this ISBN." });
  }
});


module.exports.general = public_users;
