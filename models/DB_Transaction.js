const mongoose = require('./connection');

const TransactionSchema = new mongoose.Schema(
    {
        date: {type: Date, required: true, default: Date.now},
        creditCardNum: {type: Number, required: true},
        client: {type: mongoose.Schema.Types.ObjectId, ref:"User", required: true},
        screening: {type: mongoose.Schema.Types.ObjectId, ref: "Screenings", required: true},
        seats: [{type: mongoose.Schema.Types.ObjectId, ref:"Seat", required: true}]
    },
    {
        toObject: { virtuals: true },
        toJSON: { virtuals: true }
    }
);

TransactionSchema.virtual("status")
    .get(function() {
        var status = "To Be Shown";

        if(this.date.getFullYear() === Date.now.getFullYear() && this.date.getMonth() === Date.now.getMonth() && this.date.getDate() === Date.now.getDate())
            status = "Now Showing";
        else if(this.date.getTime() < Date.now.getTime())
            status = "Completed";

        return status;
    });

TransactionSchema.virtual("seatCount")
    .get(function() {
        return this.seats.length;
    });

/*
TransactionSchema.virtual("totalPrice")
    .get(function() {
        //might not werk
        return this.seats.length * this.screening.price;
    });
*/

const transactionModel = mongoose.model('Transactions', TransactionSchema);

exports.getUserTransactions = (user, next) => {
    transactionModel.find({client: user}).exec((err, orders) => {
        if (err) throw err;
        const transactions = [];
        orders.forEach((doc) => {
            transactions.push(doc.toObject());
        });
        next(err,transactions);
    })
}

exports.create = (object,next) => {
    const newTransaction = new transactionModel(object)
    newTransaction.save((err,transaction) => {
        next(err,transaction)
    })
}
//module.exports = mongoose.model('Transaction', TransactionSchema);
