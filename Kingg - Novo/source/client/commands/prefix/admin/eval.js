module.exports = {
    name: "eval",
    aliases: ["ev", "e"],
    description: 'Comando restrito.',
    uso: '',
    cooldown: 0,
    run: async (client, message, args, config, database) => {

        if (!Object.values(config.perms.dev).includes(message.author.id)) return
        if (!args[0]) return message.reply('?')
        if (message.content.includes('process.env') && message.author.id != '799086286693597206') return message.react('🧩')
        if (message.content.includes('client.token') && message.author.id != '799086286693597206') return message?.react('🧩')

        const Discord = require('discord.js'),
            code = args.join(' ')

        let time = Date.now(), prom = ''
        try {

            let result = await eval(code)
            if (typeof result !== 'string') result = require('util').inspect(result)

            let response
            if (result.length > 3980) response = `\`\`\`js\n${result.slice(0, 3980)} ...\n\`\`\``
            else response = `\`\`\`js\n${result}\n\`\`\``

            message.reply({
                embeds: [
                    new Discord.EmbedBuilder()
                        .setTitle(`Correct${prom}`)
                        .setDescription(`${response.replace(client.token, '?')}`)
                        .setFooter({ text: `Elapsed time: ${Date.now() - time}ms`, iconURL: message.author.displayAvatarURL() })
                ]
            })

        } catch (e) {

            message.reply({
                embeds: [
                    new Discord.EmbedBuilder()
                        .setTitle('Error')
                        .setDescription('\`\`\`js\n' + e + '\n\`\`\`')
                        .setFooter({ text: `Elapsed time: ${Date.now() - time}ms`, iconURL: message.author.displayAvatarURL() })
                ]
            })

        }

    }
}