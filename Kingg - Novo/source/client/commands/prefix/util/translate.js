const { EmbedBuilder, ButtonBuilder, ActionRowBuilder, SelectMenuBuilder, ButtonStyle, MessageCollector } = require('discord.js')
const { unabbreviate, abbreviate, durationTime } = require('util-stunks')
const translate = require('@iamtraction/google-translate')

module.exports = {
    name: 'traduzir',
    aliases: ['translate'],
    desc: 'Utilize esse comando para traduzir qualquer texto para inglês ou português.',
    uso: '[pt | en] <texto>',
    cooldown: 2000,
    run: async (client, message, args, config, database) => {

        if (!args[0]) return message?.reply(`${config.emojis.error} **${config.text.separator}** ${message.author}, diga-me ao menos algo para que eu possa traduzir.`)

        if (['pt', 'en'].includes(args[0]?.toLowerCase()) && args[1]) {

            translate(args.slice(1).join(' '), { to: args[0].toLowerCase() }).then(res => {
                message?.reply(`${config.emojis.success} **${config.text.separator}** ${message.author}, o seu texto foi traduzido para **${args[0]?.toLowerCase() == 'en' ? 'Inglês' : 'Português'}** e aqui está ele: \`\`\`\n${res.text}\`\`\``)
            }).catch(err => {
                message?.reply(`${config.emojis.error} **${config.text.separator}** ${message.author}, meu sistema retornou erro, não consegui traduzir esse texto.`)
            })

        } else {
            translate(args.slice(0).join(' '), { to: `en` }).then(res => {
                message?.reply(`${config.emojis.success} **${config.text.separator}** ${message.author}, o seu texto foi traduzido para **Inglês** e aqui está ele: \`\`\`\n${res.text}\`\`\``)
            }).catch(err => {
                message?.reply(`${config.emojis.error} **${config.text.separator}** ${message.author}, meu sistema retornou erro, não consegui traduzir esse texto.`)
            })
        }
    }
}