const { EmbedBuilder, ButtonBuilder, ActionRowBuilder, SelectMenuBuilder, ButtonStyle, MessageCollector, AttachmentBuilder } = require('discord.js')
const { unabbreviate, abbreviate, durationTime } = require('util-stunks')
const ms = require('ms')

module.exports = {
    name: 'passive',
    aliases: ['passivo'],
    desc: 'Ativa ou desativa um modo que bloqueia chamadas de aposta com o comando de cara ou coroa.',
    uso: '',
    cooldown: 7000,
    run: async (client, message, args, config, database) => {

        let doc = await database.get(message.author.id, 'User', 'util')

        if (doc.util.passive == true) {
            message?.reply(`${config.emojis.success} **${config.text.separator}** ${message.author}, o seu **modo passivo** foi \`desativado\` use esse comando novamente para ativa-lo.`)
        } else {
            message?.reply(`${config.emojis.success} **${config.text.separator}** ${message.author}, o seu **modo passivo** foi \`ativado\` use esse comando novamente para desativa-lo.`)
        }

        await database.users.updateOne({ _id: message.author.id }, {
            $set: { 'util.passive': doc.util.passive == true ? false : true }
        })
    }
} 