const mongoose = require('./connection');

const multer = require("multer");
const GridFsStorage = require("multer-gridfs-storage");
const Grid = require('gridfs-stream');
const { resolve } = require('path');
const { dbURL } = require('../config');

// init gfs
let gfs;
const conn = mongoose.createConnection(dbURL, {
  useNewUrlParser: true
})
conn.once("open", () => {
  // Init stream
  gfs = Grid(conn.db, mongoose.mongo);
  gfs.collection('posters');

  app.locals.gfs = gfs
});
