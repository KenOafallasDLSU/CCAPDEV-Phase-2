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
const databaseURL = "mongodb://localhost:27017/mpdb";
const dbname = "mpdb";

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
  });

  mongoClient.connect(databaseURL, options, function(err, client) {
    if(err) throw err;
    const dbo = client.db(dbname);
  
    dbo.collection("screenings").insertOne(screening, function(err, res) {
      if (err) throw err;
        //console.log("1 screening inserted");
      client.close();
    });
  });
});

app.post("/addSlots", function(req, res) {
  const screening = new screeningModel({
    date: req.body.date,
    screenNum: req.body.screenNum,
    title: req.body.title,
      //poster
    desc: req.body.desc,
    rating: req.body.rating,
    duration: req.body.duration,
    price: req.body.price,
  });

  mongoClient.connect(databaseURL, options, function(err, client) {
    if(err) throw err;
    const dbo = client.db(dbname);
  
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
        client.close();
      });
    });
  });
});

app.post("/addSeats", function(req, res) {
  const screening = new screeningModel({
    date: req.body.date,
    screenNum: req.body.screenNum,
    title: req.body.title,
      //poster
    desc: req.body.desc,
    rating: req.body.rating,
    duration: req.body.duration,
    price: req.body.price,
  });

  mongoClient.connect(databaseURL, options, function(err, client) {
    if(err) throw err;
    const dbo = client.db(dbname);
  
    dbo.collection("screenings").findOne({date: screening.date, screenNum: screening.screenNum}, function(err, result1) {
      if(err) throw err;
      var screeningId;
      screeningId = result1._id;

      dbo.collection("slots").find({screening: screeningId}).toArray(function(err, result2) {
        if (err) throw err;

        console.log(result2);

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

/*
app.post("/updateReservedSeats", function(req, res) {
  mongoClient.connect(databaseURL, options, function(err, client) {
    if(err) throw err;
    const dbo = client.db(dbname);

    console.log(req.body);
  
    dbo.collection("seats").updateMany({seatNum: req.body}, {$set: {status: "R"}}, function(err, result) {
      if (err) throw err;

      client.close();
    });
  });
});
  */
  /*
  app.post("/searchScreensOnDay", function(req, res) {
    var queryDate = new Date();
  
    var query = {
      date: queryDate
    }
  
    mongoClient.connect(databaseURL, options, function(err, client) {
      if(err) throw err;
  
      // Connect to the same database
      const dbo = client.db(dbname);
  
      dbo.collection("screenings").find(query).toArray(function(err, result) {
        if(err) throw err;
  
        client.close();
    
        res.send(result);
      });
    });
  });
  */
/************************ */

/************Ken Displays */
app.get("/seatSelection", function(req, res) {
    mongoClient.connect(databaseURL, options, function(err, client) {
      if(err) throw err;
      const dbo = client.db(dbname);

      dbo.collection("screenings").findOne({"_id": ObjectId("5eaeb86894873f1464ff4cfa"/*hardcoded screening*/)}, function(err, result1) {
        if(err) throw err;
        var screening = result1;
        
        dbo.collection("slots").findOne({screening: screening._id, slotOrder: 1}, function(err, result2) {
          if(err) throw err;
          var slot = result2;

          dbo.collection("users").findOne({"_id": ObjectId("3eaeb86894873f1464ff4d00"/*hardcoded user*/)}, function(err, resultUser) {
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
    //user's name
    dbo.collection("users").findOne({"_id": ObjectId("3eaeb86894873f1464ff4d00"/*hardcoded user*/)}, function(err, resultUser) {
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

/************************ */

//static hosting
app.use(express.static('public'));

app.listen(port, function() {
  console.log('App listening at port ' + port);
});