const User = require('./models/users')
const Guild = require('./models/guild')
const Reminder = require('./models/remind')
const ClientRaffle = require('./models/raffle')

const config = require('../utils/json/config.json')

class Database {

    constructor() {
        this.users = User
        this.guilds = Guild
        this.remind = Reminder
        this.raffle = ClientRaffle
    }

    async get(id, type, filter = '') {
        if (type == 'User') {
            let data = await User.findOne({ _id: id }, filter)
            if (!data) data = await User.create({ _id: id })
            return data
        } else if (type == 'Guild') {
            let data = await Guild.findOne({ _id: id }, filter)
            if (!data) data = await Guild.create({ _id: id })
            return data
        } else if (type == 'Reminder') {
            let data = await Reminder.findOne({ _id: id }, filter)
            if (!data) data = await Reminder.create({ _id: id })
            return data
        } else if (type == 'Raffle') {
            let data = await ClientRaffle.findOne({ _id: id }, filter)
            if (!data) data = await ClientRaffle.create({ _id: id })
            return data
        }
    }

    async add(id, amount) {
        if (!amount || !id || isNaN(amount)) return 'error'
        await User.updateOne({ _id: id }, { $inc: { money: amount } }, { upsert: true })
    }

    async sub(id, amount) {
        if (!amount || !id || isNaN(amount)) return 'error'
        await User.updateOne({ _id: id }, { $inc: { money: -amount } }, { upsert: true })
    }

    async tr(id, action, value, msg) {
        let data = new Date()
        data.setHours(data.getHours() - 3)
        await User.updateOne({ _id: id }, { $push: { 'actions.transactions': `\`[${data.toLocaleString('pt-br')}]\` ${action == true ? '📥 **|** Recebeu' : '📤 **|** Enviou'} **${value.toLocaleString('de-DE')} ${config.money.name}** ${msg}` } }, { upsert: true })
    }

    async reminder(id, content, message, start, ends) {
        await Reminder.updateOne({ _id: id }, {
            $push: {
                reminders: {
                    user: id,
                    channel: message.channel.id,
                    guild: message.guild.id,
                    message: message.id,
                    url: message.url,
                    content: content,
                    endsIn: ends,
                    startedIn: start
                }
            }
        }, { upsert: true })
    }

    async ban(id) {
        let data = await User.findOne({ _id: id }, 'ban')
        data = {
            is: data.ban.is,
            msg: `${config.emojis.error} **${config.text.separator}** <@${id}>, esse comando não pode ser executado com esse usuário pois o mesmo está banido\`(a)\`.`
        }
        return data
    }

    async vip(id) {
        let data = await User.findOne({ _id: id }, 'util')
        data = data.util.premium

        if (!isNaN(data)) {
            if (Date.now() <= Number(data)) return true
            else return false
        } else {
            if (data == 'perm') return true
            else return false
        }
    }

    async bet(loser, winner, value) {
        await User.updateOne({ _id: loser }, {
            $inc: { 'stats.bet.played': 1, 'stats.bet.lose': 1, 'stats.bet.loss': value, 'stats.bet.bet': value }
        }, { upsert: true })
        await User.updateOne({ _id: winner }, {
            $inc: { 'stats.bet.played': 1, 'stats.bet.win': 1, 'stats.bet.profit': value, 'stats.bet.bet': value }
        }, { upsert: true })
    }

}

module.exports = new Database()