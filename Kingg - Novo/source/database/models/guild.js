const { Schema, model: Model } = require('mongoose')

module.exports = Model('guilds', new Schema({
    _id: { type: String, unique: true },
    config: {
        prefix: { type: String, default: '.' },
        channels: {
            blocked: { type: Array, default: [] },
            system: { String }
        }
    }
}, {
    versionKey: false,
    autoIndex: false
}))