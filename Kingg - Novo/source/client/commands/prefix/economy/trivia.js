const { EmbedBuilder, ButtonBuilder, ActionRowBuilder, SelectMenuBuilder, ButtonStyle, MessageCollector } = require('discord.js')
const { unabbreviate, abbreviate, durationTime } = require('util-stunks')
const ms = require('ms')
const { perguntas } = require('../../../../utils/json/questions.json')

module.exports = {
    name: "trivia",
    aliases: ["conhecimento"],
    desc: 'Chama um usuário para uma aposta de conhecimento, o bot irá fazer uma pergunta aleatória e o usuário que responder corretamente mais rápido leva o valor apostado.',
    uso: '<usuário> <valor>',
    cooldown: 7000,
    run: async (client, message, args, config, database) => {

        let user = await client.function.find(args[0], client, message, false),
            doc = await database.get(message.author.id, 'User', 'money profile especial'),
            value = parseInt(unabbreviate(args[1]))

        if (!user) return message?.reply(`${config.emojis.error} **${config.text.separator}** ${message.author}, diga-me com quem você deseja apostar.`)
        if (user.id == message.author.id) return message?.reply(`${config.emojis.error} **${config.text.separator}** ${message.author}, você não pode apostar consigo mesmo.`)

        let doc2 = await database.get(user.id, 'User', 'money profile especial ban'), ban = await database.ban(user.id)

        if (!value || value < 20) return message?.reply(`${config.emojis.error} **${config.text.separator}** ${message.author}, você precisa apostar no mínimo **20 ${config.money.name}**!`)
        if (value > doc.money) return message?.reply(`${config.emojis.error} **${config.text.separator}** ${message.author}, você não tem **${Number(value).toLocaleString('de-DE')} ${config.money.name}** para apostar.`)
        if (value > doc2.money) return message?.reply(`${config.emojis.error} **${config.text.separator}** ${message.author}, \`${user.tag}\` não tem **${Number(value).toLocaleString('de-DE')} ${config.money.name}** para apostar.`)
        if (ban.is == true) return message?.reply(ban.msg)

        let question = perguntas[parseInt(Math.random() * perguntas.length)], button = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setStyle(ButtonStyle.Secondary)
                    .setCustomId('accept')
                    .setLabel("Aceitar")
                    .setEmoji('✅')
            )

        let msg = await message?.reply({
            content: `${config.emojis.question} **${config.text.separator}** ${user}, ${message.author} quer apostar com você em um jogo de perguntas \`(conhecimentos gerais)\` valendo **${Number(value).toLocaleString('de-DE')} ${config.money.name}**, o usuário que responder a pergunta corretamente mais rápido leva o prêmio!`,
            components: [button]
        }), collector = msg?.createMessageComponentCollector({ time: 30000 })

        collector.on("collect", async (int) => {
            await int.deferUpdate().catch(() => { })
            if (int.user.id != user.id) return

            doc = await database.get(message.author.id, 'User', 'money profile especial'), doc2 = await database.get(user.id, 'User', 'money profile especial')

            if (int.customId === 'accept') {
                if (doc.money >= value && doc2.money >= value) {
                    await msg?.delete().catch(() => { })
                    message?.channel.send(`${config.emojis.success} **${config.text.separator}** ${message.author} e ${user} preparem-se, o jogo está começando!`)

                    await client.await(3000)
                    return startGame()
                }
            }

        })

        collector.on('end', () => {
            msg?.edit({ components: [] }).catch(() => { })
        })

        async function startGame() {

            doc = await database.get(message.author.id, 'User', 'money profile especial'), doc2 = await database.get(user.id, 'User', 'money profile especial')

            if (doc.money < value || doc2.money < value) return message?.channel.send(`${config.emojis.error} **${config.text.separator}** ${message.author} e ${user}, pelo visto um de vocês ficou sem ${config.money.name.toLowerCase()} suficientes para completar essa aposta, o jogo foi cancelado.`)

            let msgq = await message?.reply({ content: `${config.emojis.question} **${config.text.separator}** ${message.author} e ${user}, **o jogo começou**, a pergunta é \`${question.pergunta}\``, })
            let win = false, collectorm = new MessageCollector(message.channel, {
                filter: (m) => {
                    if (m.author.id === message.author.id || m.author.id === user.id ? false : true) return false
                    if (!question.respostas.includes(m.content.toLowerCase())) return false
                    return true
                },
                max: 1,
                time: 60000
            })

            collectorm.on('collect', async (m) => {

                win = true

                let ganhador = await client.users.fetch(m.author.id == message.author.id ? message.author.id : user.id), perdedor = await client.users.fetch(m.author.id != user.id ? user.id : message.author.id),
                    tax = await client.function.tax(ganhador.id, value)

                database.add(ganhador.id, tax), database.sub(perdedor.id, value)

                let embed = new EmbedBuilder()

                    .setTitle(`${config.emojis.success} **${config.text.separator}** Correto`)
                    .setDescription(question.descricao)
                    .setColor(config.colors.green)
                    .setTimestamp()
                    .setFooter({ text: `Respondido por ${m.author.tag}`, iconURL: m.author.displayAvatarURL() })

                m?.reply({
                    embeds: [embed],
                    content: `${m.author}, você acertou a resposta da pergunta, como recompensa você ganhou **${tax == value ? value.toLocaleString('de-DE') : tax.toLocaleString('de-DE') + ` \`(Taxa de ${(value - tax).toLocaleString('de-DE')})\``} ${config.money.name}**! *${perdedor} perdeu **${value.toLocaleString('de-DE')} ${config.money.name}***.`
                })

                database.tr(ganhador, true, value, `em um trivia contra \`${perdedor.tag}\` \`(${perdedor.id})\``)
                database.tr(perdedor, false, value, `em um trivia contra \`${ganhador.tag}\` \`(${ganhador.id})\``)
            })

            collectorm.on('end', async () => {
                if (win) return;
                msgq?.reply({
                    content: `${config.emojis.waiting} **${config.text.separator}** ${message.author} e ${user}, como ninguém adivinhou a resposta, o jogo foi cancelado.`
                }).catch(() => { })
            })

        }

    }
}