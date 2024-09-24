//the files in here are going to be all the routes for all the different html pages 

const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth'); //importing the auth controller so that only users who are logged in can acess the profile page or the home page
const db = require('../db'); // Import the db connection from db.js

router.get("/", authController.isLoggedIn, (req, res) => { //this is a route, which is a URL that the user can visit
  //req is the request object, which contains information about the request that was made to the server, what you grab
  //res is the response object, which contains methods for sending what you want to the client (to the front end)
  res.render("index", {
    user: req.user
  }) //this is to render the index.ejs file (to output the HTML in that file)
});

//to able to access the register page do this
router.get("/register", (req, res) => {
  res.render("register") //this is to render the register.ejs file
});

//to able to access the login page do this
router.get("/login", (req, res) => {
  res.render("login") //this is to render the login.ejs file
});

//to able to access the profile page do this
//authController allows only the user who is logged in to be able to access the profile page. 
//If the user is not logged in, they will be redirected to the login page

//When you go inside the /profile URL, then you will go inside the authController which we imported in this file on the top, then we run the function IsLoggedIn, this function is created inside the auth.js controllers. THe function in that auth.js controller is doing a message, then we are rendering the profile page by adding next() at the end of the function. By Adding next() we are telling the function to go to the next function which is the res.render("profile") in this file.

router.get("/profile", authController.isLoggedIn, (req, res) => {
  //authController.isLoggedIn is a middleware that checks if the user is logged
  
  //if someone tries to go to the profile page, while they don't have any token, they just didnt sign up. THen they will be redirected to the login page. 
  if (req.user){
    res.render("profile", {
      user: req.user
    }) //this is to render profile.ejs file
  }
  else{
    res.redirect("/login")
  }
});

// Ensure user is logged in before accessing the gym page
router.get("/gym", authController.isLoggedIn, (req, res) => {
  if (req.user) {

    // Fetch the data for the gym page and render it
    db.query("SELECT * FROM gym2", function(err, result) {
      if (err) {
        console.error('Database query error:', err);
        return res.status(500).send('Database query error');
      }

      // Render the gym page with user and gym data
      res.render("gym", { 
        user: req.user,
        data: result // Pass the fetched gym data to the EJS template
      });
    });
  } else {
    res.redirect("/register");
  }
});

/* to render the finance page if it was in ejs
router.get("/finance", authController.isLoggedIn, (req, res) => {
  if (req.user){
    res.render("finance", {  //this is to render finance.ejs file
  
  })
  }
  else{
    res.redirect("/register")
  }
});
*/

//to delete a workout from the table
router.get('/gym/delete/:id', authController.isLoggedIn, authController.deleteWorkout);

module.exports = router; //this is to make sure we can use the routes in other files, we need to export em that's what we doing in this line