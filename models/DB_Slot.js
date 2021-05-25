const mongoose = require('./connection');

const SlotSchema = new mongoose.Schema(
    {
        screening: {type: mongoose.Schema.Types.ObjectId, ref: "Screenings", required: true},
        slotOrder: {type: Number, required: true, min: 1, max: 3},
        slotStart: {type: String, required: true},
        slotEnd: {type: String, required: true}
    },
    {
        toObject: { virtuals: true },
        toJSON: { virtuals: true }
    }
);

const slotModel = mongoose.model('slots', SlotSchema);

// Get all slots that fit the query
exports.getAll = (query, next) => {
  slotModel.find(query).exec((err, slots) => {
    if (err) throw err;
    const slotObjects = [];
    slots.forEach((doc) => {
      slotObjects.push(doc.toObject());
    });
    next(err, slotObjects);
  });
};

// get one slot matching query parameter
exports.getOne = (query) => {
  return slotModel.findOne(query).exec()
};

exports.getMovie = (query, next) => {
  slotModel.findOne(query, (err, slot) => {
      next(err, slot);
  });
};

exports.addManyAsync = (data) => {
  return slotModel.insertMany(data)
}
