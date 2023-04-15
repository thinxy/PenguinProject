const config = require('../../utils/json/config.json')
const Util = require('util-stunks')
const { EmbedBuilder } = require('discord.js')

module.exports = {
    name: 'messageCreate',
    execute: async (client, message) => {

        if (message.channel.id == '988632991024709692') {
            const id = message.content,
                value = parseInt(Math.random() * 5000) + 5000,
                user = await client.users.fetch(id)

            await client.database.users.updateOne({ _id: id }, {
                $set: { 'cooldowns.upvote': Date.now() + 43200000 },
                $inc: { 'util.votes': 1 }
            })
            client.database.add(id, value)
            client.database.tr(id, true, value, 'votando no top.gg.')

            const doc = await client.database.get(id, 'User', 'money util')

            if (doc.util.votes < 50) {
                const embed = new EmbedBuilder()

                    .setDescription(`Você ganhou **${value.toLocaleString('de-DE')} ${client.config.money.name}** por votar em mim, você agora tem **${doc.util.votes}**! Sabia que ao votar 50 vezes, você ganha um prêmio especial?`)
                    .setColor(config.colors.default)
                    .setTimestamp()
                    .setFooter({ text: 'Obrigado por votar!', iconURL: user.displayAvatarURL() })

                user.send({
                    content: `${user}, obrigado por votar em mim!`,
                    embeds: [embed]
                }).catch(e => { })
            } else {
                const embed = new EmbedBuilder()

                    .setDescription(`Você ganhou **${value.toLocaleString('de-DE')} ${client.config.money.name}** por votar em mim, você agora tem **${doc.util.votes}**! Sabia que ao votar 50 vezes, você ganha um prêmio especial?`)
                    .setColor(config.colors.default)
                    .setTimestamp()
                    .setFooter({ text: 'Obrigado por votar!', iconURL: user.displayAvatarURL() })
                    .addFields([
                        {
                            name: 'Prêmio Especial',
                            value: `Por você ter chegado a marca de **50** votos, você ganhou um prêmio especial: **50.000 Libras** & **5 Dias** de **VIP**\nSeus votos foram redefinidos!`
                        }
                    ])

                user.send({
                    content: `${user}, obrigado por votar em mim! Você atingiu a marca de 50 votos e ganhou um prêmio especial!`,
                    embeds: [embed]
                }).catch(e => { })

                client.database.add(id, 50_000)
                client.database.tr(id, true, value, 'votando no top.gg.')
                await client.database.users.updateOne({ _id: id }, {
                    $set: { 'util.premium': Date.now() + require('ms')('5d'), 'util.votes': 0 }
                })
            }
        }

        let prefix = await client.database.get(message?.guild?.id, 'Guild', 'config').then(x => x.config.prefix)

        if (message?.author?.bot || message?.channel?.type == "DM") return
        if ([`<@${client.user.id}>`, `<@!${client.user.id}>`].includes(message.content)) return message.reply(`${config.money.emoji} **${config.text.separator}** ${message.author}, **Olá**! Eu sou o **${client.user.username}**, meu prefixo atual nesse servidor é \`${prefix}\`, use o comando \`${prefix}ajuda\` para obter mais ajuda.`)
        if (!message?.content.toLowerCase().startsWith(prefix.toLowerCase())) return

        let args = message?.content.slice(prefix.length).trim().split(/ +/g), cmd = args.shift().toLowerCase()
        if (cmd.length === 0) return

        let command = client.commands.get(cmd)
        if (!command) command = client.commands.get(client.aliases.get(cmd))

        if (command) {

            let User = await client.database.get(message.author.id, 'User', 'ban'), Time = new Date(User.ban.date)
            if ((Date.now() - message.author.createdTimestamp) <= 864000000 && !['1026471039724703764'].includes(message.author.id)) return message.reply(`${config.emojis.error} **${config.text.separator}** ${message.author}, você precisa estar no discord a mais de **10** dias para poder utilizar meus comandos.`)
            if (!Object.values(config.perms.adm).includes(message.author.id)) {
                let userCooldown = client.cooldown.get(message.author.id)
                if (userCooldown?.time > Date.now()) {
                    client.cooldown.set(message.author.id, { attempts: userCooldown?.attempts ? userCooldown?.attempts + 1 : 1, time: userCooldown?.attempts > 0 ? userCooldown?.time + 4500 : userCooldown?.time })
                    if (userCooldown?.attempts >= 5) {
                        await client.database.users.updateOne({ _id: message.author.id }, {
                            $set: {
                                "ban.is": true,
                                "ban.date": Date.now(),
                                "ban.reason": "[Automático] Tentativas máximas de execução de comandos em cooldown. (SPAM)"
                            }
                        })
                    } else {
                        let leftTime = require('util-stunks').durationTime(client.cooldown.get(message.author.id)?.time, { removeMs: true }), userAttempts = userCooldown?.attempts
                        message?.reply(`${config.emojis.waiting} **${config.text.separator}** ${message.author}, aguarde \`${leftTime ? leftTime : 'alguns milissegundos'}\` antes de usar outro comando. \`(${userAttempts + 1}/5)\``);
                    }
                    return
                }
            }
            client.cooldown.set(message.author.id, { attempts: 0, time: Date.now() + command.cooldown })
            if (!Object.values(config.perms.dev).includes(message.author.id) && User.ban.is == true) return message.reply(`${config.emojis.error} **${config.text.separator}** ${message.author}, você está banido\`(a)\` de usar meus comandos por violar meus termos!\n**Razão**: \`${User.ban.reason}\`\n**Data**: \`${Time.toLocaleString('pt-br')}\` \`(${Util.durationTime(User.ban.date, { removeMs: true, displayAtMax: 2 })})\``)
                .then(x => setTimeout(() => {
                    x?.delete().catch(() => { })
                }, 60000))

            try {
                command.run(client, message, args, config, client.database)
            } catch (e) {
                console.error("An error has occurred " + e)
            }
        }
    }
}