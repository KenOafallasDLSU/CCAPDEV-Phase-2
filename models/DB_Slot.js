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

module.exports = mongoose.model('slots', SlotSchema);

