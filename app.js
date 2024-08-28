const express = require ("express"); //importing express to set up the server and to make sure we can start our server from nodejs

const path = require("path") //importing path

const mysql = require("mysql"); //importing mysql to connect to the database

const dotenv = require ("dotenv"); //importing dotenv to make sure we can use the environment variables

const cookieParser  = require("cookie-parser"); //importing cookie-parser to make sure we can use cookies

dotenv.config({ path: './.env' }); //this is to make sure we can use the environment variables in the .env file

const app = express(); //this makes sure we start the server with "app" //creating an instance of express, which will be our server


//creating a connection for the database
const db = mysql.createConnection({
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE
});

const publicDirectory = path.join(__dirname, './public'); //this is to make sure we can use the public folder to store our CSS, images, etc
app.use(express.static(publicDirectory)); 

app.use(express.urlencoded({ extended: false })); //this is to make sure we can grab the data from a form (we are using this for signup page)

app.use(express.json()); //this is to make sure that the values that we grab from the form, come as json)

app.use(cookieParser()); //this is to make sure we can set up cookies in our browser


//telling nodejs what "view engine" we wanna use to show the HTML
app.set("view engine", "ejs"); //this is to make sure we can use the ejs templating engine


//Now CONNECTING to the database 
db.connect( (error) =>{
  if(error){ 
    console.log(error) //if there is an error output this
  } 
  else {
    console.log("MySQL Connected...")
  }
})

//Defining Routes
app.use('/', require('./routes/pages')); //this is to make sure we can use the routes in the pages.js file

app.use('/auth', require('./routes/auth')); //this is to make sure we can use the routes in the auth.js file

// => arrow function
app.listen(5000, () => {
  console.log("Server started on Port 5000")
})


