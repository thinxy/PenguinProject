const { Schema, model: Model } = require('mongoose')

module.exports = Model('reminder', new Schema({
    _id: { type: String, unique: true },
    reminders: { type: Array }
}, {
    versionKey: false,
    autoIndex: false
}))