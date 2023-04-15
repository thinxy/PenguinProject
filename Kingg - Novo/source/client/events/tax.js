const { EmbedBuilder, ButtonBuilder, ActionRowBuilder, SelectMenuBuilder, ButtonStyle, MessageCollector } = require('discord.js')
const { unabbreviate, abbreviate, durationTime } = require('util-stunks')
const cron = require('node-cron')
const ms = require('ms')

module.exports = {
    name: 'ready',
    once: false,
    execute: async (client) => {

        console.log('Daily Tax - Event.')

        cron.schedule('00 00 * * *', async () => {
            console.log('Daily Tax - Started')

            let users = await client.database.users.find({ money: { $gt: 100_000 } }, 'cooldowns money')

            for (let i of users) {
                if (i.money >= 50_000_000 && (Date.now() - i.cooldowns.daily) > ms('2d')) {
                    // 50% DE TAXA APÓS 2 DIAS (CASO O USUÁRIO TENHA MAIS DE 50.000.000 DE LIBRAS)
                    client.database.tr(i._id, false, parseInt(tax(i.money, 50)), 'para inatividade da recompensa diária')
                    client.database.sub(i._id, parseInt(tax(i.money, 50)))

                    console.log(i._id + ' ' + tax(i.money, 50).toLocaleString('de-DE'))
                } else if (i.money >= 25_000_000 && (Date.now() - i.cooldowns.daily) > ms('2d')) {
                    // 50% DE TAXA APÓS 2 DIAS (CASO O USUÁRIO TENHA MAIS DE 25.000.000 DE LIBRAS)
                    client.database.tr(i._id, false, parseInt(tax(i.money, 50)), 'para inatividade da recompensa diária')
                    client.database.sub(i._id, parseInt(tax(i.money, 50)))

                    console.log(i._id + ' ' + tax(i.money, 50).toLocaleString('de-DE'))
                } else if (i.money >= 10_000_000 && (Date.now() - i.cooldowns.daily) > ms('3d')) {
                    // 40% DE TAXA APÓS 3 DIAS (CASO O USUÁRIO TENHA MAIS DE 10.000.000 DE LIBRAS)
                    client.database.tr(i._id, false, parseInt(tax(i.money, 40)), 'para inatividade da recompensa diária')
                    client.database.sub(i._id, parseInt(tax(i.money, 40)))

                    console.log(i._id + ' ' + tax(i.money, 50).toLocaleString('de-DE'))
                } else if (i.money >= 5_000_000 && (Date.now() - i.cooldowns.daily) > ms('4d')) {
                    // 40% DE TAXA APÓS 4 DIAS (CASO O USUÁRIO TENHA MAIS DE 5.000.000 DE LIBRAS)
                    client.database.tr(i._id, false, parseInt(tax(i.money, 40)), 'para inatividade da recompensa diária')
                    client.database.sub(i._id, parseInt(tax(i.money, 40)))

                    console.log(i._id + ' ' + tax(i.money, 40).toLocaleString('de-DE'))
                } else if (i.money >= 2_500_000 && (Date.now() - i.cooldowns.daily) > ms('5d')) {
                    // 30% DE TAXA APÓS 5 DIAS (CASO O USUÁRIO TENHA MAIS DE 2.500.000 DE LIBRAS)
                    client.database.tr(i._id, false, parseInt(tax(i.money, 30)), 'para inatividade da recompensa diária')
                    client.database.sub(i._id, parseInt(tax(i.money, 30)))

                    console.log(i._id + ' ' + tax(i.money, 30).toLocaleString('de-DE'))
                } else if (i.money >= 1_000_000 && (Date.now() - i.cooldowns.daily) > ms('7d')) {
                    // 20% DE TAXA APÓS 7 DIAS (CASO O USUÁRIO TENHA MAIS DE 1.000.000 DE LIBRAS)
                    client.database.tr(i._id, false, parseInt(tax(i.money, 20)), 'para inatividade da recompensa diária')
                    client.database.sub(i._id, parseInt(tax(i.money, 20)))

                    console.log(i._id + ' ' + tax(i.money, 20).toLocaleString('de-DE'))
                } else if (i.money >= 500_000 && (Date.now() - i.cooldowns.daily) > ms('9d')) {
                    // 15% DE TAXA APÓS 9 DIAS (CASO O USUÁRIO TENHA MAIS DE 500.000 DE LIBRAS)
                    client.database.tr(i._id, false, parseInt(tax(i.money, 15)), 'para inatividade da recompensa diária')
                    client.database.sub(i._id, parseInt(tax(i.money, 15)))

                    console.log(i._id + ' ' + tax(i.money, 15).toLocaleString('de-DE'))
                } else if (i.money >= 100_000 && (Date.now() - i.cooldowns.daily) > ms('10d')) {
                    // 10% DE TAXA APÓS 10 DIAS (CASO O USUÁRIO TENHA MAIS DE 100.000 DE LIBRAS)
                    client.database.tr(i._id, false, parseInt(tax(i.money, 10)), 'para inatividade da recompensa diária')
                    client.database.sub(i._id, parseInt(tax(i.money, 10)))

                    console.log(i._id + ' ' + tax(i.money, 10).toLocaleString('de-DE'))
                }
            }

            console.log('Daily Tax - Finished')
        }, {
            scheduled: true,
            timezone: "America/Sao_Paulo"
        })

    }
}

function tax(value, tax) {
    return (value / 100) * tax
}