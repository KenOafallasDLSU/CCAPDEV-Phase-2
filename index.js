//requirements
const express = require('express');
const path = require('path');
const exphbs = require('express-handlebars');
const handlebars = require('handlebars');
const bodyParser = require('body-parser');

const mongodb = require('mongodb');
const ObjectId = require('mongodb').ObjectId;

//creates express app
const app = express();
const port = 3000;

//Define all database connection constants
const mongoClient = mongodb.MongoClient;
const databaseURL = "mongodb+srv://OafallasKenneth:a1b2c3d4@ccapdev-mp-bigbrainmovies-mubsx.gcp.mongodb.net/BigBrainDB?retryWrites=true&w=majority";
const dbname = "BigBrainDB";

//models
const userModel = require('./models/users');
const screeningModel = require('./models/screenings');
const slotModel = require('./models/DB_Slot');
const seatModel = require('./models/DB_Seat');
const transactionModel = require('./models/DB_Transaction');

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
  var currSlotId = localStorage.getItem("selectedSlot")

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
              slot: slot
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

/************************ */

/************Ronn Posts */
app.post('/addUser', function(req, res) {
  var user = new userModel({
    first_name: req.body.first_name,
    family_name: req.body.family_name,
    email: req.body.email,
    password: req.body.password,
    usertype: req.body.usertype
  });
  user.save(function(err, user) {
    var result;
    if (err) {
      console.log(err.errors);
      result = {success: false, message: "User was not created. Please try again."};
      res.send(result);
    } else {
      console.log("User creation success!");
      result = {success: true, message: "User was successfully created!"};
      res.send(result);
    }
  });
});

app.post('/searchUser', function(req, res) {
  userModel.findOne({email: req.body.email, password: req.body.password}, function(err, user){
    var result = {cont: user, ok: true};
    if (err)
      console.log('There is an error when searching for a user.');
    console.log("User: " + user);
    if (user == null)
        result.ok = false;
    else
        result.ok = true;
    console.log("Result: " + result.ok);
    res.send(result);
  });
});

app.post('/searchUserExist', function(req, res) {
  userModel.findOne({email: req.body.email}, function(err, user){
    var result;
    if (err)
      console.log('There is an error when searching for a user.');
    console.log("User: " + user);
    if (user == null)
        result = false;
    else
        result = true;
    console.log("Exist: " + result);
    res.send(result);
  });
});

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
/************************ */

/************Ronn Displays */
app.get('/', function(req, res) {
    res.render('login', {
      layout: 'home',
      img: 'img/brain.png',
    });
});

app.get('/movies', function(req, res) {
    var today = new Date(2020, 4, 9); //hardcoded dates
    var tom = new Date(2020, 4, 10);
    var next = new Date(2020, 4, 11);
    var screens1 = [];
    var screens2 = [];
    var screens3 = [];

    mongoClient.connect(databaseURL, options, function(err, client) {
      if(err) throw err;
      const dbo = client.db(dbname);

      screeningModel.find({date: today}).sort({date: 1}).exec(function(err, result){
          result.forEach(function(doc) {
          screens1.push(doc.toObject());
        });
        screeningModel.find({date: tom}).sort({date: 1}).exec(function(err, result){
            result.forEach(function(doc) {
            screens2.push(doc.toObject());
          });
          screeningModel.find({date: next}).sort({date: 1}).exec(function(err, result){
              result.forEach(function(doc) {
              screens3.push(doc.toObject());
          });
          dbo.collection("users").findOne({"_id": ObjectId("3eaeb86894873f1464ff4d00"/*hardcoded employee user*/)}, function(err, resultUser) {
            if(err) throw err;
            var user = resultUser;

            client.close();
            res.render('movies', {
              user: user,
              pageCSS: "BigBrain_Screenings",
              pageJS: "",
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
    });
});
/************************ */

//static hosting
app.use(express.static('public'));

app.listen(port, function() {
  console.log('App listening at port ' + port);
});
