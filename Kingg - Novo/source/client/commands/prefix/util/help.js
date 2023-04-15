const { EmbedBuilder, ButtonBuilder, ActionRowBuilder, SelectMenuBuilder, ButtonStyle, MessageCollector } = require('discord.js')
const { readdirSync } = require("fs")

const objDesc = {
    config: "Comandos de configuração do servidor",
    fun: "Comandos de jogos e diversão",
    economy: "Comandos voltados a economia do bot",
    social: "Comandos voltado ao social do bot",
    util: "Comandos de utilidade"
}

const names = {
    config: "Configurações",
    fun: "Diversão",
    economy: "Economia",
    social: "Sociais",
    util: "Utilidades"
}

module.exports = {
    name: "help",
    aliases: ['ajuda'],
    run: async (client, message, args, config, database) => {

        let categories = [
            {
                label: "Inicio",
                value: "home",
                description: "volte para a página inicial."
            }
        ], prefix = await database.get(message.guild.id, 'Guild', 'config').then(x => x.config.prefix)

        readdirSync("./source/client/commands/prefix/").forEach(data => {
            if (data === "admin") return; //nao mostrar os comandos de admins obviokkkkkkkkk
            categories.push({
                label: names[data],
                value: data,
                description: objDesc[data]
            })
        })

        let menu = new ActionRowBuilder()
            .addComponents(
                new SelectMenuBuilder()
                    .setPlaceholder("Escolha uma categoria!")
                    .addOptions(categories)
                    .setCustomId("menu-help")
            ),
            btn = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setLabel('Convite')
                        .setEmoji('📨')
                        .setStyle(ButtonStyle.Link)
                        .setURL(config.links.invite),
                    new ButtonBuilder()
                        .setLabel('Servidor')
                        .setEmoji('👑')
                        .setStyle(ButtonStyle.Link)
                        .setURL(config.links.guild),
                    new ButtonBuilder()
                        .setLabel('Vote em Mim')
                        .setEmoji('⭐')
                        .setStyle(ButtonStyle.Link)
                        .setURL(config.links.upvote)
                )

        const emb = new EmbedBuilder()
            .setTitle(`${config.money.emoji} **${config.text.separator}** Painel de Ajuda - **${client.user.username}**`)
            .setDescription(`Olá, eu sou o **${client.user.username}**, sou um simples bot de Economia feito para discord. \nConto atualmente com mais de 30 comandos disponíveis para uso público, vocês podem visualizar meus comandos utilizando o menu de seleção logo abaixo.\n\n Ah... e lembre-se, meu prefixo nesse servidor é \`${prefix}\`, faça bom proveito dos meus comandos! :star:`)

            .setFooter({ text: `Utilizado por ${message.author.tag}`, iconURL: message.author.displayAvatarURL() })
            .setColor(config.colors.default)
            .setTimestamp()
            .setThumbnail(client.user.displayAvatarURL())

        let msg = await message.reply({
            embeds: [emb],
            components: [menu, btn]
        })

        const collector = msg?.createMessageComponentCollector({
            filter: (i) => i.user.id === message.author.id,
            idle: 60 * 1000 * 3
        })

        collector.on("collect", async (int) => {
            await int.deferUpdate().catch(() => null)
            let value = int.values[0]
            if (value === "home") return msg?.edit({ embeds: [emb], components: [menu, btn] })
            await getCommands(value)
        })

        collector.on("end", async (_, r) => {
            if (msg?.components) return msg?.edit({ components: [] }).catch(() => null)
        })


        function getCommands(dir) {
            const commands = readdirSync(`./source/client/commands/prefix/${dir}`)
            const embed = new EmbedBuilder()
                .setTitle(`Comandos: ${names[dir]}`)
                .setDescription(commands.map(x => `\`${prefix}${x.replace(/.js/g, "")}\``).join("\n"))

                .setFooter({ text: `Utilizado por ${message.author.tag}`, iconURL: message.author.displayAvatarURL() })
                .setColor(config.colors.default)
                .setTimestamp()

            return msg.edit({
                embeds: [embed],
                components: [menu]
            })
        }

    }
}