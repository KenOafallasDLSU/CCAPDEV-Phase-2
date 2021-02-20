//requirements
require('dotenv').config();
const express = require('express');
const path = require('path');
const exphbs = require('express-handlebars');
const handlebars = require('handlebars');
const bodyParser = require('body-parser');
const mongodb = require('mongodb');
const mongoose = require('./models/connection');
const session = require('express-session');
const flash = require('connect-flash');
const ObjectId = require('mongodb').ObjectId;
const MongoStore = require('connect-mongo')(session);
const {envPort, sessionKey} = require('./config');
const methodOverride = require('method-override');


//creates express app
const app = express();
const port = envPort || 3000;

//Define all database connection constants
const mongoClient = mongodb.MongoClient;
const databaseURL = "mongodb+srv://OafallasKenneth:a1b2c3d4@ccapdev-mp-bigbrainmovies-mubsx.gcp.mongodb.net/BigBrainDB?retryWrites=true&w=majority";
const dbname = "BigBrainDB";

//models
const userModel = require('./models/DB_User');
const screeningModel = require('./models/DB_Screening');
const slotModel = require('./models/DB_Slot');
const seatModel = require('./models/DB_Seat');
const transactionModel = require('./models/DB_Transaction');

//others
const bcrypt = require('bcrypt');
const {validationResult} = require('express-validator');
const {userRegisterValidation, userLoginValidation} = require('./validators.js');
const options = { useUnifiedTopology: true };

/*
// additional connection options
const options = { useUnifiedTopology: true };

//create mongodb collections if they do not exist
mongoClient.connect(databaseURL, options, function(err, client) {
    if (err) throw err;
    const dbo = client.db(dbname);

    dbo.createCollection("users", function(err, res) {
      if (err) throw err;

      dbo.createCollection("screenings", function(err, res) {
        if (err) throw err;

        dbo.createCollection("slots", function(err, res) {
          if (err) throw err;

          dbo.createCollection("seats", function(err, res) {
            if (err) throw err;

            dbo.createCollection("transactions", function(err, res) {
              if (err) throw err;
              client.close();
            });
          });
        });
      });
    });
});
*/

/*************Multer File Uploads */
/*
const crypto = require("crypto");
const mongoose = require("mongoose");
const multer = require("multer");
const GridFsStorage = require("multer-gridfs-storage");

const mongoURI = 'mongodb://localhost:27017/mpdb';

const conn = mongoose.createConnection(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

// init gfs
let gfs;
conn.once("open", () => {
    // init stream
    gfs = new mongoose.mongo.GridFSBucket(conn.db, {
      bucketName: "uploads"
    });
});

// Storage
const storage = new GridFsStorage({
    url: mongoURI,
    file: (req, file) => {
      return new Promise((resolve, reject) => {
        crypto.randomBytes(16, (err, buf) => {
          if (err) {
            return reject(err);
          }
          const filename = buf.toString("hex") + path.extname(file.originalname);
          const fileInfo = {
            filename: filename,
            bucketName: "uploads"
          };
          resolve(fileInfo);
        });
      });
    }
});

const upload = multer({
    storage
});
*/
/******************************** */

//create engine
app.engine('hbs', exphbs({
    extname: 'hbs',
    defaultView: 'main',
    layoutsDir: path.join(__dirname, '/views/layouts'),
    partialsDir: path.join(__dirname, '/views/partials')
}));

app.set('view engine', 'hbs');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(methodOverride("_method"));

// sessions - server configuration
app.use(session({
  secret: sessionKey,
  store: new MongoStore({mongooseConnection: mongoose.connection}),
  resave: false,
  saveUninitialized: true.valueOf,
  cookie: {secure: false, maxAge: 1000 * 60 * 60 * 24 * 7}
}));

// flash
app.use(flash());

// global variable messages
app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  next();
});

/************Ken Posts */
app.post("/addScreening", function(req, res) {
  const screening = new screeningModel({
    date: req.body.date,
    screenNum: req.body.screenNum,
    title: req.body.title,
      //poster
    desc: req.body.desc,
    rating: req.body.rating,
    duration: req.body.duration,
    price: req.body.price,
    time1: req.body.time1start,
    time2: req.body.time2start,
    time3: req.body.time3start
  });

  mongoClient.connect(databaseURL, options, function(err, client) {
    if(err) throw err;
    const dbo = client.db(dbname);

    dbo.collection("screenings").insertOne(screening, function(err, res) {
      if (err) throw err;
        //console.log("1 screening inserted");
        //client.close();

        dbo.collection("screenings").findOne({date: screening.date, screenNum: screening.screenNum}, function(err, result) {
          if(err) throw err;

          var screeningId;
          screeningId = result._id;

          const slot1 = new slotModel({
            screening: screeningId,
            slotOrder: 1,
            slotStart: req.body.time1start,
            slotEnd: req.body.time1end
          });
          const slot2 = new slotModel({
            screening: screeningId,
            slotOrder: 2,
            slotStart: req.body.time2start,
            slotEnd: req.body.time2end
          });
          const slot3 = new slotModel({
            screening: screeningId,
            slotOrder: 3,
            slotStart: req.body.time3start,
            slotEnd: req.body.time3end
          });

          dbo.collection("slots").insertMany([slot1, slot2, slot3], function(err, res) {
            if (err) throw err;
            //console.log("3 slots inserted");
            //client.close();

            dbo.collection("screenings").findOne({date: screening.date, screenNum: screening.screenNum}, function(err, result1) {
              if(err) throw err;
              var screeningId;
              screeningId = result1._id;

              dbo.collection("slots").find({screening: screeningId}).toArray(function(err, result2) {
                if (err) throw err;

                //console.log(result2);

                var aSeats = [];
                var letter = 'A';
                var number = 1;

                var i = 0, j = 0, slotNum = 0;
                for(slotNum = 0; slotNum < 3; slotNum++)
                {
                  letter = 'A';
                  number = 1;

                  for(i = 0; i < 10; i++)
                  {
                    for(j = 0; j < 10; j++)
                    {
                      var tempSeat = seatModel({
                        seatNum: String.fromCharCode(letter.charCodeAt() + i).concat(number + j),
                        status: "A",
                        slot: result2[slotNum]._id
                      });

                      aSeats.push(tempSeat);
                    }
                  }
                }

                dbo.collection("seats").insertMany(aSeats, function(err, res) {
                  if (err) throw err;
                  //console.log("300 seats inserted");
                  client.close();
                });
              });
          });
        });
      });
    });
  });
});

app.post('/getSeatStatus', function(req, res) {
  var query = {
    slot:ObjectId(req.body.slot)
  };

    mongoClient.connect(databaseURL, options, function(err, client) {
      if(err) throw err;

      const dbo = client.db(dbname);

      dbo.collection("seats").find(query).toArray(function(err, result) {
        if(err) throw err;

        client.close();

        res.send(result);
      });
    });
});

app.post("/reserveSeats", function(req, res) {
  mongoClient.connect(databaseURL, options, function(err, client) {
    if(err) throw err;
    const dbo = client.db(dbname);

    dbo.collection("seats").updateMany({slot: ObjectId(req.body.slot), seatNum: {$in: req.body.reservedSeats}}, {$set: {status: "R", owner: ObjectId("3eaeb86894873f1464ff4d00"/*hardcoded client user*/)}}, function(err, result) {
      if (err) throw err;

      client.close();
    });
  });
});

/************************ */

/************Ken Displays */
app.get("/seatSelection", function(req, res) {
  var currSlotId = "5ec0c846ca85a61340446897"

    mongoClient.connect(databaseURL, options, function(err, client) {
      if(err) throw err;
      const dbo = client.db(dbname);

      dbo.collection("slots").findOne({"_id": ObjectId(currSlotId)}, function(err, result1) {
        if(err) throw err;
        var slot = result1;

        dbo.collection("screenings").findOne({"_id": slot.screening}, function(err, result2) {
          if(err) throw err;
          var screening = result2;

          dbo.collection("users").findOne({"_id": ObjectId("3eaeb86894873f1464ff4d00"/*hardcoded client user*/)}, function(err, resultUser) {
            if(err) throw err;
            var user = resultUser;

            client.close();

            res.render("BigBrain_Seats", {
              //header
              user: user,

              //main head
              pageCSS: "BigBrain_Seats",
              pageJS: "BigBrain_Seats",
              pageTitle: "Seat Selection",
              header: "header",
              footer: "footer",

              //body
              screening: screening,
              slot: slot,
              dateFormatted: screening.date.toDateString()
            });
          });
        });
      });
    });
});

app.get("/employeeFacing", function(req, res) {
  mongoClient.connect(databaseURL, options, function(err, client) {
    if(err) throw err;
    const dbo = client.db(dbname);

    //user's name
    dbo.collection("users").findOne({"_id": ObjectId("5ec0cd81474d4f15d0f4fd0a"/*hardcoded employee user*/)}, function(err, resultUser) {
      if(err) throw err;
      var user = resultUser;

      client.close();

      res.render("BigBrain_EmployeeFacing", {
        //header
        user: user,

        //head
        pageCSS: "BigBrain_EmployeeFacing",
        pageJS: "BigBrain_EmployeeFacing",
        pageTitle: "Employee Service",
        header: "BigBrain_EmployeeHeader",
        footer: "BigBrain_EmployeeFooter"
      });
    });
  });
});

/* Login Page */
app.get('/', function(req, res) {
    res.render('login', {
      layout: 'home',
      img: 'img/brain.png',
    });
});

//login posts
app.post('/user-register', userRegisterValidation, (req, res) => {
  const errors = validationResult(req);
  if(errors.isEmpty()) {
    const {fname, lname, emailreg, passreg, typeuser} = req.body;
    userModel.getOne({email: emailreg}, (err, result) => {
      if(result) {
        req.flash('error_msg', 'User already exists. Please login.');
        res.redirect('/');
      } else {
        const saltRounds = 10;
        bcrypt.hash(passreg, saltRounds, (err, hashed) => {
          const newUser = {
            first_name: fname,
            family_name: lname,
            email: emailreg,
            password: hashed,
            usertype: typeuser
          };
          userModel.create(newUser, (err, user) => {
            if(err) {
              req.flash('error_msg', 'Error creating new account. Please try again.');
              res.redirect('/');
            } else {
              req.flash('success_msg', 'Registration successful! Please login.');
              res.redirect('/');
            }
          });
        });
      }
    });
  } else {
    const messages = errors.array().map((item) => item.msg);
    req.flash('error_msg', messages.join(' '));
    res.redirect('/');
  }
});

app.post('/user-login', userLoginValidation, (req, res) => {
  const errors = validationResult(req);
  if(errors.isEmpty()) {
    const {emaillog, passlog} = req.body;
    userModel.getOne({email: emaillog}, (err, user) => {
      if(err) {
        console.log(err); //testing
        res.redirect('/login');
      } else {
        if(user) {
          bcrypt.compare(passlog, user.password, (err, result) => {
            if (result) {
              req.session.user = user._id;
              req.session.fullname = user.full_name;
              res.redirect('/movies');
            } else {
              req.flash('error_msg', 'Incorrect password. Please try again.');
              res.redirect('/');
            }
          });
        } else {
          req.flash('error_msg', 'User not found. Please try again.');
          res.redirect('/');
        }
      }
    });
  } else {
    const messages = errors.array().map((item) => item.msg);
    req.flash('error_msg', messages.join(' '));
    res.redirect('/');
  }
});

/* transaction history page */

app.get('/transaction-history',function(req,res) {
    var user
    var today = new Date(2020, 4, 9);
    if (req.session.fullname != null)
      user = req.session.user
    else
      user = false
    if (user){
      userModel.getOne({_id:user}, (err,client) => {
        if (err) {
          console.log("error")
          throw err
        }
        else{
          var transArray =[]
          var transObj;
          transactionModel.getUserTransactions(client, (err, transactions) => {
            if (err) throw err
            if (transactions) {
              transactions.foreach(element =>{
                screeningModel.getOne(element.screening,(err,movie) => {
                  if (err) throw err
                  if (movie) {
                    transObj['title'] = movie.title
                    transObj['date'] = element.date
                    transObj['seats'] = element.seats
                    if (element.date < today)
                      transObj['status'] = 'Completed' /* placeholder */
                    else
                      transObj['status'] = 'Reserved'
                    transArray.push(transObj)

                    res.render('BigBrain_TransactionHistory', {
                      user:user,
                      pageCSS: "BigBrain_TransactionHistory",
                      pageTitle: "Transaction History",
                      header: "header",
                      footer: "footer",
                      transactions: transArray
                    })
                  }
                })
              })
            }
          })
        }
      })
    }
})

/* Screenings Page */
app.get('/movies', function(req, res) {
    var today = new Date(2020, 4, 9); //hardcoded dates
    var tom = new Date(2020, 4, 10);
    var next = new Date(2020, 4, 11);
    var screens1 = [];
    var screens2 = [];
    var screens3 = [];
    var username;

      screeningModel.getAll({date: today}, (err, result) => {
          result.forEach(function(doc) {
          screens1.push(doc);
        });
        screeningModel.getAll({date: tom}, (err, result) => {
            result.forEach(function(doc) {
            screens2.push(doc);
          });
          screeningModel.getAll({date: next}, (err, result) => {
              result.forEach(function(doc) {
              screens3.push(doc);
          });

          if (req.session.fullname != null)
            username= req.session.fullname;
          else
            username= "guest";

            console.log(req.session);

            res.render('movies', {
              user: username,
              pageCSS: "BigBrain_Screenings",
              pageJS: "BigBrain_Screenings",
              pageTitle: "Movie Screenings",
              header: "header",
              footer: "footer",
              day1: screens1,
              day2: screens2,
              day3: screens3,
              date1: today.toDateString(),
              date2: tom.toDateString(),
              date3: next.toDateString()
            });
        });
      });
    });
});


//screening posts
app.post('/searchScreening', function(req, res) {
  screeningModel.find({date: req.body.date}, function(err, screenings){
    var result = {cont: screenings, empty: true};
    if (err)
      console.log('There is an error when searching for a screenings.');
    console.log("Screenings: " + screenings);
    if(screenings == null)
      result.empty = true;
    else
      result.empty = false;
    console.log("Result: " + result.empty);
    res.send(result);
  });
});

/*Header*/
//for user logout
app.get('/logout', (req, res) => {
  if(req.session){
    console.log(req.session);
    req.session.destroy(() => {
      res.clearCookie('connect.sid');
      res.redirect('/');
    });
  };
});



//static hosting
app.use(express.static('public'));

app.listen(port, function() {
  console.log('App listening at port ' + port);
});
