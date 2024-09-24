const mysql = require("mysql"); //importing mysql to connect to the database

const jwt = require("jsonwebtoken"); //importing jwt to make sure we can use the tokens for the user

const bcrypt = require("bcryptjs"); //importing bcrypt to make sure we can hash the password

const { promisify } = require("util"); //importing promisify to make sure we can use async await

//creating a connection for the database
const db = mysql.createConnection({
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE
});


//Querying into DB
//this allows us to look into our db
//Selecting email from the table users where the email = to a ? (which is a placeholder)
//? is the value that we want to look for in our db
//this code also allows us to have one person register one time, not register twice with the same email
//in the array, we put the value of the email whch is coming from the FORM

//Function to login the user
exports.login = async (req, res) => {
  //try catch to catch an error
  try{
    const { email, password } = req.body; //grabbing the email and password from the form

    if (!email || !password) { //if the email or password is empty
      return res.status(400).render('login', {
        message: 'Please provide an email and password'
      });
    }
  db.query('SELECT * FROM users WHERE email = ?', [email], async (error, results) => {
    console.log(results);
    //if the email does not exist or the password is incorrect
    //bcrypt compare, compares the password that is written downn in the login with the password that is completely hashed in the database
    if (!results || !(await bcrypt.compare(password, results[0].password))) {
      //401 status is forbidden
      res.status(401).render('login', {
        message: 'Email or Password is incorrect'
      })
    }
    else{
      const id = results[0].id; //grabbing the id from the results
      //remove the comment below to see the password in the console
      // console.log("This is the password: " + password);

      //JWT Token Code
      //This will help us to create a unique token for the users when they login. This token will help us to keep the user logged in
      //firstWhat value "id:" is a variable, second value is id of the user ^^
      const token = jwt.sign({ id: id }, process.env.JWT_SECRET, {
        //when the token expires
        expiresIn: process.env.JWT_EXPIRES_IN
      });
      console.log("The token is: " + token);

      //starting the cookie code
      const cookieOptions = {
        //when the cookie expires
        expires: new Date(
          //date.now is current date. We are adding the number of days the cookie will expire in. Then we convert it to milliseconds
          //in one day there is 24 hours, in one hour there is 60 minutes, in one minute there is 60 seconds, in one second there is 1000 milliseconds
          Date.now() + process.env.JWT_COOKIE_EXPIRES * 24 * 60 * 60 * 1000
        ),
        //this is to make sure that the cookie is only sent in HTTP and not in JavaScript
        //if we are on an http only environment, this just makes sure that it helps to protect the cookie from hacking, and so they can only access from the browser. It is more secure.
        httpOnly: true
      }

      //this is what is going to set up the cookie in the brower
      //and after the user has logged in, we put a cookie in the browser.
      res.cookie('jwt', token, cookieOptions) //name of the cookie it can be anything
      //after user logs in, we are redirecting them to the home page
      res.status(200).redirect("/");

    }
 
  })
}  catch(error){
    console.log(error);
    }
}


//Function to register the user
exports.register = (req, res) => {
  console.log(req.body)


const { name, email, password, passwordConfirm } = req.body; //grabbing all the values from the form


//Querying into DB
//this allows us to look into our db
//Selecting email from the table users where the email = to a ? (which is a placeholder)
//? is the value that we want to look for in our db
//this code also allows us to have one person register one time, not register twice with the same email
//in the array, we put the value of the email whch is coming from the FORM above
//then created a function that takes an error or result
db.query('SELECT email FROM users WHERE email = ?', [email], async (error, results) => {

  if(error){
    console.log(error);
  }
  if(results.length > 0){ //this means that their is already an email with that value in our DB
    return res.render('register', {
      message: 'Please fill in the form.'
    });
  }
  else if(password !== passwordConfirm){ //if the passwords do not match
    return res.render('register', {
      message: 'Passwords do not match'
    });
  }

  //encrypting our passwords (hashing them)
  //in the function we put async because we are using await because it takes time to hash the password
  let hashedPassword = await bcrypt.hash(password, 8); //8 is the number of rounds of hashing
  //Another SQL query where we are sending something into our DB (table of users)
  //the "name:" is the column name in the table same with the email and password
  //the second value right after is what we are grabbing from the FORM expect for password. We are grabbing the hashed password
  db.query('INSERT INTO users SET ?', {name: name, email: email, password: hashedPassword}, (error, results) => {
    if(error){
      console.log(error);
    }
    else{
      console.log(results);
      return res.render('register', {
        message1: 'You have sucessfully registered',
        success1: true
        });
      }
    });
  });
}; 

//Function to check if the user is logged in
//This function is inside the pages.js file
exports.isLoggedIn = async (req, res, next) => {
  //console.log(req.cookies) //this checks if you have any cookies (jwt token) in our browser. (to show user is logged in)
  if (req.cookies.jwt) { //if there is a cookie (jwt token) in the browser 
    try {
      //Step 1: Verify the Token
      //we are going to decode the token (the cookie) to make sure that we grab the id of the right user
      //jwt.verify checks the token
      //process.env.JWT_SECRET checks the secret password that we used, when we created the token in the first place
      const decoded = await promisify(jwt.verify)(req.cookies.jwt, process.env.JWT_SECRET);
      console.log(decoded); 
      //it shows the id of the user, the iat is when the password was issued at, the exp is when the token was issued at and when it's expiring

      //Step 2: Check if the user still exists
      //SELECT selects all the columns in the db, from the table users where the id of the user is equal to ? (which is a placeholder). To replace the ? we put the decoded.id
      db.query('SELECT * FROM users WHERE id = ?', [decoded.id], (error, result) => {
        console.log(result) //just to see if the user exists
        if (!result) { //if the user does not exist
          return next(); 
        }

        req.user = result[0]; //grabbing the user information from the results
        return next();
      })
    } 
    catch (error) {
      console.error(error);
      return res.redirect('/register'); //When the user logs out, the token is invalid and shows error, so then redirect to the register page
    }
  } 
  else{
    return res.redirect('/register'); //When the user has not logged in at all, then redirect them to the register page
  }
}

//Creating logged out function
exports.logout = async (req, res) => {
  res.cookie('jwt', 'Logout', {
    expires: new Date(Date.now() + 2 * 1000), //after you press the logout, the cookie will expire in 2 second. this means that the cookie will be automaticall removed from the browser 
    httpOnly: true //This is to make sure that this only happens via the brower, via http.
  });

  //200 means all good all is fine
  res.status(200).redirect('/');
}

//Function to add a workout
exports.gym = (req, res) => {
    const { exercise, sets, reps, date } = req.body;

    console.log("Form data received:", req.body); // Log the received form data

    const query = 'INSERT INTO gym2 (exercise, sets, reps, date) VALUES (?, ?, ?, ?)';
    db.query(query, [exercise, sets, reps, date], (err, results) => {
        if (err) {
            console.error('Error inserting data into the database:', err);
            res.status(500).send('Error inserting data into the database.');
            return;
        }
        console.log('Data inserted successfully:', results); // Log the success
        res.redirect('/gym');
    });
}

//Function to delete a workout
exports.deleteWorkout = (req, res) => {
  const workoutId = req.params.id; //Get the ID from the URL

  //Query to delete the workout by its ID
  const query = 'DELETE FROM gym2 WHERE id = ?';
  
  db.query(query, [workoutId], (err, result) => {
      if (err) {
          console.error('Error deleting workout:', err);
          return res.status(500).send('Error deleting workout.');
      }
      console.log('Workout', workoutId, 'deleted successfully:', result);
      res.redirect('/gym'); //Redirect back to the gym page after deletion
  });
};