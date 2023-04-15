const { Schema, model: Model } = require('mongoose')

module.exports = Model('raffle', new Schema({
    _id: { type: String, unique: true },
    time: { type: Number, default: 0 },
    users: { type: Array, default: [] },
    last: { type: String, default: 'Ninguém...' },
    value: { type: Number, default: 0 },
    tickets: { type: Number, default: 0 }
}, {
    versionKey: false,
    autoIndex: false
}))