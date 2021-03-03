const GridFsStorage = require("multer-gridfs-storage");
const crypto = require("crypto");
const { dbURL } = require('../config');
const { resolve } = require('path');
const multer = require("multer");

// Create storage engine
const storage = new GridFsStorage({
  url: dbURL,
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

exports.upload = multer({ storage });