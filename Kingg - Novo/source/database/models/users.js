const { Schema, model: Model } = require('mongoose')

module.exports = Model('users', new Schema({
    _id: { type: String, unique: true },
    money: { type: Number, default: 0 },
    cooldowns: {
        daily: { type: Number, default: 0 },
        work: { type: Number, default: 0 },
        upvote: { type: Number, default: 0 },
        vip: { type: Number, default: 0 },
        rep: { type: Number, default: 0 }
    },
    util: {
        premium: { type: String },
        raffle: { type: Number, default: 0 },
        donated: { type: Number, default: 0 },
        passive: { type: Boolean, default: false },
        votes: { type: Number, default: 0 }
    },
    ban: {
        is: { type: Boolean, default: false },
        reason: { type: String },
        date: { type: Number, default: 0 }
    },
    system: {
        work: {
            experience: { type: Number, default: 0 },
            required: { type: Number, default: 500 },
            multi: { type: Number, default: 1 }
        }
    },
    profile: {
        config: {
            aboutme: { type: String, default: 'Nenhum sobre mim foi definido.' },
            background: { type: String, default: 'bgid-default' },
            layout: { type: String, default: 'lyid-default' }
        },
        data: {
            reputations: { type: Number, default: 0 },
            layouts: { type: Array, default: ['lyid-default'] },
            backgrounds: { type: Array, default: ['bgid-default'] },
            badges: { type: Array, default: [] }
        },
        wedding: {
            is: { type: Boolean, default: false },
            user: { type: String },
            date: { type: Number }
        }
    },
    stats: {
        bet: {
            played: { type: Number, default: 0 },
            win: { type: Number, default: 0 },
            lose: { type: Number, default: 0 },
            bet: { type: Number, default: 0 },
            profit: { type: Number, default: 0 },
            loss: { type: Number, default: 0 },
        }
    },
    actions: {
        transactions: { type: Array, default: [] },
        reputations: { type: Array, default: [] }
    }
}, {
    versionKey: false,
    autoIndex: false
}))