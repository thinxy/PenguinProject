const { EmbedBuilder, ButtonBuilder, ActionRowBuilder, SelectMenuBuilder, ButtonStyle, MessageCollector } = require('discord.js')
const { unabbreviate, abbreviate, durationTime } = require('util-stunks')

module.exports = {
    name: 'saldo',
    aliases: ['atm', 'bal', 'carteira', 'diamantes', 'dinheiro'],
    description: 'Verifica seu saldo atual ou o de um outro usuário em específico.',
    uso: '[usuário]',
    cooldown: 1700,
    run: async (client, message, args, config, database) => {

        let user = await client.function.find(args[0], client, message, true), doc = await database.get(user.id, 'User', 'money')
        let rank = await database.users.find({ 'money': { $gt: 0 } }, 'money', { sort: { 'money': -1 } }), position = parseInt(rank.findIndex(x => x.id === user.id) + 1)

        message?.reply({ content: `${config.money.emoji} **${config.text.separator}** ${message.author}, ${user.id == message.author.id ? 'você' : `\`${user.tag}\` \`(${user.id})\``} tem **${doc.money.toLocaleString('de-DE')} ${config.money.name}** em mãos${position >= 1 ? ` e está em **#${position}** no placar dos usuários mais ricos` : ''}, você pode ver a lista dos usuários mais ricos usando o comando \`${await database.get(message.guild.id, 'Guild', 'config').then(x => x.config.prefix)}placar\`.` })
    }
}