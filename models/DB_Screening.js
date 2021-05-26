const mongoose = require('./connection');
const slotModel = require('../models/DB_Slot');

const screeningSchema = new mongoose.Schema(
  {
    date: {type: Date, required: true},
    screenNum: {type: Number, required: true, min: 1, max: 4, get: v => Math.round(v), set: v => Math.round(v)},
    title: {type: String, required: true, max: 100},
    posterUrl: {type: String, required: true},
    desc: {type: String, required: true},
    rating: {type: String, required: true, max: 30},
    duration: {type: Number, required: true, min: 1},
    price: {type: Number, required: true}
  },
  {
    toObject: { virtuals: true },
    toJSON: { virtuals: true }
  }
);

screeningSchema.virtual('datetxt')
.get(function() {
  return this.date.toDateString();
})

const screeningModel = mongoose.model('screenings', screeningSchema);

// Get all screenings for movies page
exports.forMovies = (query, next) => {
  return screeningModel.find(query).exec();
};

// Get all screenings that fit the query
exports.getAll = (query, next) => {
  screeningModel.find(query).exec((err, screens) => {
    if (err) throw err;
    const screenObjects = [];
    screens.forEach((doc) => {
      screenObjects.push(doc.toObject());
    });
    next(err, screenObjects);
  });
};

// look for an existing screening in the db
exports.getOne = (query, next) => {
    screeningModel.findOne(query, (err, screening) => {
        next(err, screening);
    });
};

exports.getOneAsync = (query) => {
  return screeningModel.findOne(query).exec()
};

exports.addOneAsync = (data) => {
  return screeningModel.create(data)
}
