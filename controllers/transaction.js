const Transaction = require("../models/transaction");
const User = require("../models/user");



exports.createTransaction = async (req, res, next) => {
    try {
        const { groupId, transactionName, initiatedBy, amount, splitMethod, splits } = req.body;

        if (!['EQUAL', 'EXACT', 'PERCENTAGE'].includes(splitMethod)) {
            return res.status(400).json({ code: 400, message: "Invalid split method" });
        }

        if (splitMethod === 'EXACT' || splitMethod === 'PERCENTAGE') {
            const totalSplit = splits.reduce((sum, split) => sum + (splitMethod === 'EXACT' ? split.amount : split.percentage), 0);
            if ((splitMethod === 'EXACT' && totalSplit !== amount) || (splitMethod === 'PERCENTAGE' && Math.abs(totalSplit - 100) !== 0)) {
                return res.status(400).json({ code: 400, message: "Invalid split amounts or percentages" });
            }
        }

        const lastTransaction = await Transaction.findOne().sort({ transactionId: -1 });
        const newTransactionId = lastTransaction ? lastTransaction.transactionId + 1 : 1;

        const newTransaction = new Transaction({
            transactionId: newTransactionId,
            groupId,
            transactionName,
            initiatedBy,
            amount,
            splitMethod,
            splits: splitMethod === 'EQUAL' ? [] : splits,
        });

        await newTransaction.save();
        res.status(201).json({ code: 201, message: "Transaction Created Successfully", data: newTransaction });
    } catch (error) {
        res.status(500).json({ code: 500, message: "Error creating transaction", error: error.message });
    }
};

exports.getUserExpenses = async (req, res, next) => {
    try {
        const { userEmailId } = req.params;
        const transactions = await Transaction.find({ 
            $or: [
                { initiatedBy: userEmailId },
                { 'splits.userEmailId': userEmailId }
            ]
        });

        const expenses = transactions.map(transaction => {
            let userExpense = 0;
            if (transaction.splitMethod === 'EQUAL') {
                userExpense = transaction.amount / (transaction.splits.length + 1);
            } else {
                const userSplit = transaction.splits.find(split => split.userEmailId === userEmailId);
                if (userSplit) {
                    userExpense = transaction.splitMethod === 'EXACT' ? userSplit.amount : (transaction.amount * userSplit.percentage / 100);
                }
            }
            return {
                transactionId: transaction.transactionId,
                transactionName: transaction.transactionName,
                amount: transaction.amount,
                userExpense: userExpense,
                date: transaction.createdDate
            };
        });

        res.status(200).json({ code: 200, message: "User expenses fetched successfully", data: expenses });
    } catch (error) {
        res.status(500).json({ code: 500, message: "Error fetching user expenses", error: error.message });
    }
};

exports.getOverallExpenses = async (req, res, next) => {
    try {
        const transactions = await Transaction.find();
        const overallExpenses = transactions.reduce((sum, transaction) => sum + transaction.amount, 0);
        res.status(200).json({ code: 200, message: "Overall expenses fetched successfully", data: { overallExpenses } });
    } catch (error) {
        res.status(500).json({ code: 500, message: "Error fetching overall expenses", error: error.message });
    }
};

exports.downloadBalanceSheet = async (req, res, next) => {
    try {
        const transactions = await Transaction.find();
        const users = await User.find();

        let balanceSheet = {};
        users.forEach(user => {
            balanceSheet[user.userEmailId] = { paid: 0, owed: 0 };
        });

        transactions.forEach(transaction => {
            const initiator = transaction.initiatedBy;
            balanceSheet[initiator].paid += transaction.amount;

            if (transaction.splitMethod === 'EQUAL') {
                const splitAmount = transaction.amount / (transaction.splits.length + 1);
                transaction.splits.forEach(split => {
                    balanceSheet[split.userEmailId].owed += splitAmount;
                });
                balanceSheet[initiator].owed += splitAmount;
            } else {
                transaction.splits.forEach(split => {
                    const amount = transaction.splitMethod === 'EXACT' ? split.amount : (transaction.amount * split.percentage / 100);
                    balanceSheet[split.userEmailId].owed += amount;
                });
            }
        });

        let balanceSheetText = "Balance Sheet\n\n";
        Object.entries(balanceSheet).forEach(([userEmailId, balance]) => {
            const netBalance = balance.paid - balance.owed;
            balanceSheetText += `${userEmailId}:\n`;
            balanceSheetText += `  Paid: $${balance.paid.toFixed(2)}\n`;
            balanceSheetText += `  Owed: $${balance.owed.toFixed(2)}\n`;
            balanceSheetText += `  Net Balance: $${netBalance.toFixed(2)}\n\n`;
        });

        res.setHeader('Content-Type', 'text/plain');
        res.setHeader('Content-Disposition', 'attachment; filename=balance_sheet.txt');
        res.send(balanceSheetText);
    } catch (error) {
        res.status(500).json({ code: 500, message: "Error generating balance sheet", error: error.message });
    }
};