//requirements
//require('dotenv').config();
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
const seatRouter = require('./routes/seatRoutes');
const transRouter = require('./routes/transactionRoutes');

// use routes
app.use('/', userRouter);
app.use('/', screeningRouter);
app.use('/seatSelection', seatRouter);
app.use('/transactions', transRouter);


app.listen(port, function() {
  console.log('App listening at port ' + port);
});
