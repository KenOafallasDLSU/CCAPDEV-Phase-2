//requirements
require('dotenv').config();
const express = require('express');
const path = require('path');
const exphbs = require('express-handlebars');
const _handlebars = require('handlebars');
const bodyParser = require('body-parser');
const mongoose = require('./models/connection');
const session = require('express-session');
const flash = require('connect-flash');
const ObjectId = require('mongodb').ObjectId;
const MongoStore = require('connect-mongo')(session);
const {envPort, dbURL, sessionKey} = require('./config');
const methodOverride = require('method-override');
const {allowInsecurePrototypeAccess} = require('@handlebars/allow-prototype-access');
const {isCustomer, isEmp} = require('./middlewares/checkRoutes.js');


//creates express app
const app = express();
const port = envPort || 3000;

//Define all database connection constants
//const mongoClient = mongodb.MongoClient;
const databaseURL = dbURL
//const dbname = "BigBrainDB";

//models
const userModel = require('./models/DB_User');
const screeningModel = require('./models/DB_Screening');
const slotModel = require('./models/DB_Slot');
const seatModel = require('./models/DB_Seat');
const transactionModel = require('./models/DB_Transaction');

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

/*************Multer File Uploads */
const crypto = require("crypto");
const multer = require("multer");
const GridFsStorage = require("multer-gridfs-storage");
const Grid = require('gridfs-stream');
const { resolve } = require('path');

// init gfs
let gfs;
const conn = mongoose.createConnection(databaseURL, {
  useNewUrlParser: true
})
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
  //res.redirect('/employeeFacing');
});

app.get('/filenames', (req,res) => {
  gfs.files.find().toArray((err, files) => {
    if(!files || files.length === 0)
      return -1
    else
      return res.json(files)
  })
})

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

// initialize routes
const userRouter = require('./routes/userRoutes');
const screeningRouter = require('./routes/screeningRoutes');
const seatRouter = require('./routes/seatRoutes')

// use routes
app.use('/', userRouter);
app.use('/', screeningRouter);
app.use('/seatSelection', seatRouter);

/* checkout page */
app.get('/checkout', isCustomer, function (req,res) {
  var user
  var username
  var today = new Date(2020, 4, 9);
  var sort = {seatNum: 1}
  var slotp;
  console.log(req.session)
  if (req.session.fullname != null) {
    user = req.session.user
    username = req.session.fullname
  }
  else
    user = false
  if (req.session.slot != null) {
    slotp = req.session.slot;
  }
  if (user) {
    userModel.getOne({_id:user},(err,client) => {
      if (err) throw err
      if (client) {
        seatModel.getUserSeats(client,slotp,sort,(err,seats)=> {
          if (err) throw err
          if (seats) {
            var seatArray =[];
            var mov = {};
            seats.forEach(item => {
              var seatObj = {};
              seatObj['seatNum'] = item.seatNum
              seatObj['id'] = item._id
              seatArray.push(seatObj)
            })
            slotModel.getMovie({_id:slotp},(err,slot)=> {
              if (err) throw err
              console.log(slot)
              if (slot){
                screeningModel.getOne({_id:slot.screening},(err,screening) => {
                  if (err) throw err
                  if (screening) {
                    var totalPrice = screening.price * seatArray.length
                    console.log(seatArray)
                    res.render('BigBrain_Checkout', {
                      user: username,
                      pageCSS: "BigBrain_Checkout",
                      pageJS: "BigBrain_Checkout",
                      pageTitle: "Checkout",
                      header: "header",
                      footer: "footer",
                      seats: seatArray,
                      title: screening.title,
                      img: screening.posterUrl,
                      slotStart: slot.slotStart,
                      slotEnd: slot.slotEnd,
                      cost: totalPrice
                    })
                  }
                })
              }
            })
          }
        })
      }
    })
  }
})

app.post('/cancelSeats',function(req,res) {
  console.log(req.session)
  var user;
  var slotp;
  if (req.session.fullname != null)
    user = req.session.user
  else
    user = false
  if (req.session.slot != null)
    slotp = req.session.slot
  if (user){
    userModel.getOne({_id:user}, (err,client) => {
      if (err) throw err
      if (client) {
        seatModel.reserveSeats({status:'R',slot:slotp,owner: client},{$set: {status: "A", owner: ObjectId('nilnilnilnil')}},(err,result) => {
          if (err) throw err
          res.send(result)
        })
      }
    })
  }
})
/* transaction history page */

app.get('/transactions', async (req,res) => {
  let user
  const today = new Date(2020, 5, 8);
  const sort = {date: 1}
  if (req.session.fullname != null)
    user = req.session.user
  else
    user = false

  let getSingleTrans = element => {
    return new Promise(async (resolve, reject) => {
      const movie = await screeningModel.getOneAsync({_id:element.screening})
      const result = await slotModel.getOne({_id:element.slot})
      if (movie && result) {
        resolve({
          title: movie.title,
          date: movie.datetxt,
          seats: element.seats,
          status: element.date < today ? 'Completed' : 'Reserved',
          start: result.slotStart,
          end: result.slotEnd
        })
        //console.log(transArray)
      }
    })
  }

  const transactions = await transactionModel.getUserTransactionsAsync(ObjectId(user), sort)
  let getAllTrans = await Promise.all(
    transactions.map(async element => {
      let trans = await getSingleTrans(element)
      return trans
    })
  )

  res.render('BigBrain_TransactionHistory', {
    user: req.session.fullname,
    user_email: req.session.email,
    pageCSS: "BigBrain_TransactionHistory",
    pageTitle: "Transaction History",
    header: "header",
    footer: "footer",
    transactions: getAllTrans
  })
})

app.listen(port, function() {
  console.log('App listening at port ' + port);
});
