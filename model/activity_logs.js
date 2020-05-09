const mongoose = require('mongoose');

const ActivityLogsSchema = new mongoose.Schema({
    email: { type: String, required: true },
    ip: String,
    browser: String,
    timestamp: { type: Date, default: Date.now }
});

const ActivityLogs = mongoose.model('ActivityLog', ActivityLogsSchema);

module.exports = ActivityLogs;