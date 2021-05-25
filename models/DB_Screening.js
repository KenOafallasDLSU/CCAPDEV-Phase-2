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
  screeningModel.find(query).exec((err, screens) => {
    if (err) throw err;
    const screenObjects = [];
    screens.forEach((doc, i) => {
      slotModel.getAll({screening: doc._id}, (err, slots) => {
        var sc = {
          date: doc.date,
          screenNum: doc.screenNum,
          title: doc.title,
          posterUrl: doc.posterUrl,
          desc: doc.desc,
          rating: doc.rating,
          duration: doc.duration,
          price: doc.price,
          slots: slots
        }
        screenObjects.push(sc);
        if ((i + 1) == screens.length)
          next(err, screenObjects);
      });
    });
  });
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
