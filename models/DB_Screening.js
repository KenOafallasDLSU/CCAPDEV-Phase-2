const mongoose = require('./connection');

const screeningSchema = new mongoose.Schema(
  {
    date: {type: Date, required: true},
    screenNum: {type: Number, required: true, min: 1, max: 4, get: v => Math.round(v), set: v => Math.round(v)},
    title: {type: String, required: true, max: 100},
    posterUrl: {type: String, required: true},
    desc: {type: String, required: true},
    rating: {type: String, required: true, max: 30},
    duration: {type: Number, required: true, min: 1},
    price: {type: Number, required: true},
    time1: {type: String, required: false},
    time2: {type: String, required: false},
    time3: {type: String, required: false}
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

// look for an existing screening in the db
exports.getOne = (query, next) => {
    screeningModel.findOne(query, (err, screening) => {
        next(err, screening);
    });
};

module.exports = mongoose.model('Screenings', screeningSchema);
