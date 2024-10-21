var mongoose = require("mongoose");

var SplitSchema = new mongoose.Schema({
    userEmailId: {
        type: String,
        required: true,
    },
    amount: {
        type: Number,
        required: true,
    },
    percentage: {
        type: Number,
    },
});

var TransactionSchema = new mongoose.Schema({
    transactionId: {
        type: Number,
        required: true,
        unique: true,
    },
    groupId: {
        type: Number,
        required: true,
    },
    transactionName: {
        type: String,
        required: true,
    },
    initiatedBy: {
        type: String,
        required: true,
    },
    amount: {
        type: Number,
        required: true,
    },
    splitMethod: {
        type: String,
        enum: ['EQUAL', 'EXACT', 'PERCENTAGE'],
        required: true,
    },
    splits: [SplitSchema],
    createdDate: {
        type: Date,
        default: Date.now,
    },
});

var Transaction = mongoose.model("Transaction", TransactionSchema);

module.exports = Transaction;