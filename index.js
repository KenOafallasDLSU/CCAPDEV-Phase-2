//requirements
require('dotenv').config();
const express = require('express');
const path = require('path');
const exphbs = require('express-handlebars');
const _handlebars = require('handlebars');
const bodyParser = require('body-parser');
const mongodb = require('mongodb');
const mongoose = require('./models/connection');
const session = require('express-session');
const flash = require('connect-flash');
const ObjectId = require('mongodb').ObjectId;
const MongoStore = require('connect-mongo')(session);
const {envPort, dbURL, sessionKey} = require('./config');
const methodOverride = require('method-override');
const {allowInsecurePrototypeAccess} = require('@handlebars/allow-prototype-access')


//creates express app
const app = express();
const port = envPort || 3000;

//Define all database connection constants
const mongoClient = mongodb.MongoClient;
const databaseURL = dbURL
const dbname = "BigBrainDB";

//models
const userModel = require('./models/DB_User');
const screeningModel = require('./models/DB_Screening');
const slotModel = require('./models/DB_Slot');
const seatModel = require('./models/DB_Seat');
//const transactionModel = require('./models/DB_Transaction');

//others
const bcrypt = require('bcrypt');
const {validationResult} = require('express-validator');
const {userRegisterValidation, userLoginValidation} = require('./validators.js');
const options = { useUnifiedTopology: true };

/*************Multer File Uploads */
const crypto = require("crypto");
const multer = require("multer");
const GridFsStorage = require("multer-gridfs-storage");
const Grid = require('gridfs-stream');

// init gfs
let gfs;
const conn = mongoose.createConnection(databaseURL)
conn.once("open", () => {
  // Init stream
  gfs = Grid(conn.db, mongoose.mongo);
  gfs.collection('posters');
});

// Create storage engine
const storage = new GridFsStorage({
  url: databaseURL,
  file: (req, file) => {
    return new Promise((resolve, reject) => {
      //crypto.randomBytes(16, (err, buf) => {
      //  if (err) {
      //    return reject(err);
      //  }
      //  const filename = buf.toString('hex') + path.extname(file.originalname);
        const fileInfo = {
          filename: file.originalname, //filename,
          bucketName: 'posters'
        };
        resolve(fileInfo);
      //});
    });
  }
});
const upload = multer({ storage });

app.post('/upload', upload.single('posterSubmit'), (req, res) => {
  // res.json({ file: req.file });
  // res.redirect('/');
});

// @route GET /image/:filename
// @desc Display Image
app.get('/:prefix?/image/:filename', (req, res) => {
  gfs.files.findOne({ filename: req.params.filename }, (err, file) => {
    // Check if file
    if (!file || file.length === 0) {
      return res.status(404).json({
        err: 'No file exists'
      });
    }

    // Check if image
    if (file.contentType === 'image/jpeg' || file.contentType === 'image/png') {
      // Read output to browser
      const readstream = gfs.createReadStream(file.filename);
      readstream.pipe(res);
    } else {
      res.status(404).json({
        err: 'Not an image'
      });
    }
  });
});
/******************************** */

//create engine
app.engine('hbs', exphbs({
    extname: 'hbs',
    defaultView: 'main',
    layoutsDir: path.join(__dirname, '/views/layouts'),
    partialsDir: path.join(__dirname, '/views/partials'),
    handlebars: allowInsecurePrototypeAccess(_handlebars)
}));

app.set('view engine', 'hbs');

//middleware
app.use('/static', express.static(path.join(__dirname, 'public')))
app.use(express.static('public'));
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

/*
app.post("/addScreening", function(req, res) {
  const screening = new screeningModel({
    date: req.body.date,
    screenNum: req.body.screenNum,
    title: req.body.title,
    posterUrl: req.body.poster,
    desc: req.body.desc,
    rating: req.body.rating,
    duration: req.body.duration,
    price: req.body.price,
    time1: req.body.time1start,
    time2: req.body.time2start,
    time3: req.body.time3start
  });

  screeningModel.insertOne(screening, function(err, res1) {
    if (err) throw err;
    const screeningId = res1.ops[0]

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

    dbo.collection("slots").insertMany([slot1, slot2, slot3], function(err, res2) {
      if (err) throw err;

      console.log(res2)

      let aSeats = [];
      let letter = 'A';
      let number = 1;

      for(let slotNum = 0; slotNum < 3; slotNum++){
        letter = 'A';
        number = 1;

        for(let i = 0; i < 10; i++){
          for(let j = 0; j < 10; j++){
            const tempSeat = seatModel({
              seatNum: String.fromCharCode(letter.charCodeAt() + i).concat(number + j),
              status: "A",
              slot: result2[slotNum]._id
            });

            aSeats.push(tempSeat);
          }
        }
      }

      dbo.collection("seats").insertMany(aSeats, function(err, res3) {
        if (err) throw err;
        //console.log("300 seats inserted");
      });
    });
  });
});
*/

/**
 * POST route
 * get statis of seats, whether A,R,U
 */
app.post('/seatSelection/getSeatStatus', function(req, res) {  
  //console.log("Status of " + req.session.slot)
  seatModel.find().where("slot", ObjectId(req.session.slot))
  .exec(function(err, result) {
    if(err) throw err;
    res.send(result);
  });
});

/**
 * POST route
 * updates seats selected to Reserved then redirects to checkout
 */
app.post("/seatSelection/reserveSeats", function(req, res) {
  //console.log("Reserving for " + req.session.slot)
  //console.log("Reserving " + req.body.reservedSeats)
  seatModel.updateMany({slot: ObjectId(req.session.slot), seatNum: {$in: req.body.reservedSeats}}, {$set: {status: "R", owner: ObjectId(req.session.user)}}, function(err, result) {
    if (err) throw err;
    res.redirect('/checkout');
  });
});

/**
 * Render seatSelection page
 */
app.get("/seatSelection/:slotid", async (req, res) => {
  req.session.slot = req.params.slotid
  let currSlotId = req.session.slot
  let slot = await slotModel.getOne({"_id": ObjectId(currSlotId)})

  screeningModel.getOne({"_id": slot.screening}, function(err, result) {
    if(err) throw err;
    var screening = result;

    res.render("BigBrain_Seats", {
      //header
      user: req.session.fullname,

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

app.get("/employeeFacing", function(req, res) {
  res.render("BigBrain_EmployeeFacing", {
    //header
    user: req.session.fullname,

    //head
    pageCSS: "BigBrain_EmployeeFacing",
    pageJS: "BigBrain_EmployeeFacing",
    pageTitle: "Employee Service",
    header: "BigBrain_EmployeeHeader",
    footer: "BigBrain_EmployeeFooter"
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

/* Screenings Page */
app.get('/movies', function(req, res) {
    var today = new Date(2020, 4, 9); //hardcoded dates
    var tom = new Date(2020, 4, 10);
    var next = new Date(2020, 4, 11);
    var screens1 = [];
    var screens2 = [];
    var screens3 = [];
    var username;

      screeningModel.forMovies({date: today}, (err, result) => {
          result.forEach(function(doc) {
          screens1.push(doc);
        });
        console.log(screens1[0].slots);
        screeningModel.forMovies({date: tom}, (err, result) => {
            result.forEach(function(doc) {
            screens2.push(doc);
          });
          screeningModel.forMovies({date: next}, (err, result) => {
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

app.listen(port, function() {
  console.log('App listening at port ' + port);
});
