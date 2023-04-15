const { EmbedBuilder, ButtonBuilder, ActionRowBuilder, SelectMenuBuilder, ButtonStyle, MessageCollector } = require('discord.js')
const { unabbreviate, abbreviate, durationTime } = require('util-stunks')
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args))

module.exports = {
    name: 'userinfo',
    aliases: ['infouser', 'ui', 'usuarioinfo', 'infousuario', 'whois'],
    desc: 'Veja as informações de um usuário ou as suas próprias.',
    uso: '[usuário]',
    run: async (client, message, args, config, database) => {


        let json = {
            badges: {
                'Staff': '<:kbe_eStaff:975066974881194035>',
                'Partner': '<:kbe_ePartner:975067002685227038>',
                'Hypesquad': '<:kbe_eEvents:975067018812325959>',
                'BugHunterLevel1': '<:kbe_eBugHunter1:975066404799778917>',
                'HypeSquadOnlineHouse1': '<:kbe_BadgeBravery:980909110092500992>',
                'HypeSquadOnlineHouse2': '<:kbe_BadgeBrilliance:980909072209576007>',
                'HypeSquadOnlineHouse3': '<:kbe_BadgeBalance:980909040093757440>',
                'PremiumEarlySupporter': '<:kbe_ePig:975066189506175026>',
                'TeamPseudoUser': '',
                'BugHunterLevel2': '<:kbe_eBugHunter2:975067066702897203>',
                'VerifiedBot': '<:kbe_botVerified:980907999403073546>',
                'VerifiedDeveloper': '<:kbe_eDev:975065710810255420>',
                'CertifiedModerator': '<:kbe_eModerator:975065761959784503>',
                'BotHTTPInteractions': '',
                'Spammer': ''
            }, perms: {
                'CreateInstantInvite': 'Criar um Convite Instantâneo',
                'KickMembers': 'Expulsar Membros',
                'BanMembers': 'Banir Membros',
                'Administrator': 'Administrator',
                'ManageChannels': 'Gerenciar Canais',
                'ManageGuild': 'Gerenciar Servidor',
                'AddReactions': 'Adicionar Reações',
                'ViewAuditLog': 'Ver o Registro de Auditoria',
                'PrioritySpeaker': 'Voz Prioritária',
                'Stream': 'Vídeo',
                'ViewChannel': 'Ver Canais',
                'SendMessages': 'Enviar Mensagens',
                'SendTTSMessages': 'Enviar mensagens em TTS',
                'ManageMessages': 'Gerenciar Mensagens',
                'EmbedLinks': 'Incorporar Links',
                'AttachFiles': 'Anexar Arquivos',
                'ReadMessageHistory': 'Ler o Histórico de Mensagens',
                'MentionEveryone': 'Mencionar a Todos (everyone/here)',
                'UseExternalEmojis': 'Usar Emojis Externos',
                'ViewGuildInsights': 'Ver Análises do Servidor',
                'Connect': 'Conectar',
                'Speak': 'Falar',
                'MuteMembers': 'Silenciar Membros',
                'DeafenMembers': 'Ensurdecer Membros',
                'MoveMembers': 'Mover Membros',
                'UseVAD': 'Usar Detectação de Voz',
                'ChangeNickname': 'Trocar Apelido',
                'ManageNicknames': 'Gerenciar Apelidos',
                'ManageRoles': 'Gerenciar Cargos',
                'ManageWebhooks': 'Gerenciar Webhooks',
                'ManageEmojisAndStickers': 'Gerenciar Figurinhas e Emojis',
                'UseApplicationCommands': 'Usar Comandos de Aplicação',
                'RequestToSpeak': 'Pedir para Falar',
                'ManageEvents': 'Gerenciar Eventos',
                'ManageThreads': 'Gerenciar Tópicos',
                'CreatePublicThreads': 'Criar Tópico Público',
                'CreatePrivateThreads': 'Criar Tópico Privado',
                'UseExternalStickers': 'Usar Figurinhas Externas',
                'SendMessagesInThreads': 'Enviar Mensagens em Tópicos',
                'UseEmbeddedActivities': 'Usar Atividades',
                'ModerateMembers': 'Moderar Membros'
            }
        },
            fields = [],
            user = await client.function.find(args[0], client, message, args),
            member = await message.guild.members.cache.get(user.id),
            find = await fetch(`https://canary.discord.com/api/v9/users/${user.id}/profile`, {
                method: 'GET',
                headers: {
                    Authorization: process.env.USER_TOKEN
                },
            }).then(res => res.json())

        let embed = new EmbedBuilder()

            .setFooter({ text: `Utilizado por ${message.author.tag}`, iconURL: message.author.displayAvatarURL() })
            .setColor(`${user.flags.toArray().includes('HypeSquadOnlineHouse1') ? '9C84EF' : `${user.flags.toArray().includes('HypeSquadOnlineHouse2') ? 'F47B67' : `${user.flags.toArray().includes('HypeSquadOnlineHouse3') ? '45DDC0' : config.colors.blue}`}`}`)
            .setTimestamp()
            .setThumbnail(user.displayAvatarURL())
            .setTitle(`${find.premium_since ? `<:kbe_eNitro:975067040744374362>` : ``}${user.flags.toArray().map(b => json.badges[b]).join('')} ${user.username} `)

        let buttons = (disabled) => [
            new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setLabel('Início')
                        .setEmoji('🏠')
                        .setDisabled(disabled)
                        .setStyle(ButtonStyle.Secondary)
                        .setCustomId(`back`),
                    new ButtonBuilder()
                        .setLabel('Detalhes')
                        .setEmoji('📄')
                        .setDisabled(disabled)
                        .setStyle(ButtonStyle.Secondary)
                        .setCustomId(`details`),
                    new ButtonBuilder()
                        .setLabel('Permissões')
                        .setEmoji('🧩')
                        .setDisabled(disabled)
                        .setStyle(ButtonStyle.Secondary)
                        .setCustomId(`permissions`)
                )
        ]

        fields.push({ name: `Nome`, value: `\`${user.tag}\``, inline: true })
        fields.push({ name: `Identidade`, value: `\`${user.id}\``, inline: true })
        if (user.bot) fields.push({ name: `Aplicação`, value: `Esse "usuário" é uma aplicação.`, inline: true })
        fields.push({ name: `Avatar`, value: `[${user.avatar ? 'Clique aqui.' : 'Sem avatar...'}](${user.displayAvatarURL()})`, inline: false })
        fields.push({ name: `Data de Criação`, value: `<t:${parseInt(user.createdTimestamp / 1000)}:F> \`(${durationTime(user.createdTimestamp, { removeMs: true, displayAtMax: 2 })})\``, inline: false })
        if (member) fields.push({ name: `Data de Entrada`, value: `<t:${parseInt(member.joinedTimestamp / 1000)}:F> \`(${durationTime(member.joinedTimestamp, { removeMs: true, displayAtMax: 2 })})\``, inline: false })

        if (fields.length >= 1) embed.addFields(fields)

        let msg = await message?.reply({ content: message.author.toString(), embeds: [embed], components: buttons(false) }),
            collector = msg?.createMessageComponentCollector({
                time: 120000, filter: (i) => {
                    if (i.user.id == message.author.id) return true
                    return false
                }
            })

        collector.on('collect', async (i) => {
            await i.deferUpdate().catch(() => { })

            if (i.customId == 'details') {

                let embfields = [], emb = new EmbedBuilder()

                    .setFooter({ text: `Utilizado por ${message.author.tag}`, iconURL: message.author.displayAvatarURL() })
                    .setColor(`${user.flags.toArray().includes('HypeSquadOnlineHouse1') ? '9C84EF' : `${user.flags.toArray().includes('HypeSquadOnlineHouse2') ? 'F47B67' : `${user.flags.toArray().includes('HypeSquadOnlineHouse3') ? '45DDC0' : config.setup.colors.blue}`}`}`)
                    .setTimestamp()
                    .setThumbnail(user.displayAvatarURL())
                    .setTitle(`${find.premium_since ? `<:kbe_eNitro:975067040744374362>` : ``}${user.flags.toArray().map(b => json.badges[b]).join('')} ${user.username} `)

                if (find && find.user?.bio) {
                    embfields.push({ name: `Sobre Mim`, value: `\`\`\`\n${find.user.bio}\`\`\``, inline: false })
                }
                if (find && find.premium_guild_since) {
                    let Boost_Date = new Date(find.premium_guild_since)
                    Boost_Date = Boost_Date.getTime()

                    embfields.push({ name: `Impulsionando Desde`, value: `<t:${parseInt(Boost_Date / 1000)}:F> \`(${durationTime(Boost_Date, { removeMs: true, displayAtMax: 2 })})\``, inline: false })
                }
                if (find && find.premium_since) {
                    let Nitro_Date = new Date(find.premium_since)
                    Nitro_Date = Nitro_Date.getTime()

                    embfields.push({ name: `Assinante Desde`, value: `<t:${parseInt(Nitro_Date / 1000)}:F> \`(${durationTime(Nitro_Date, { removeMs: true, displayAtMax: 2 })})\``, inline: false })
                }

                if (embfields.length >= 1) emb.addFields(embfields)

                msg?.edit({ content: message.author.toString(), embeds: [emb], components: buttons(false) })
            }

            if (i.customId == 'permissions') {

                if (!member) return

                let embfields = [], emb = new EmbedBuilder()

                    .setFooter({ text: `Utilizado por ${message.author.tag}`, iconURL: message.author.displayAvatarURL() })
                    .setColor(`${user.flags.toArray().includes('HypeSquadOnlineHouse1') ? '9C84EF' : `${user.flags.toArray().includes('HypeSquadOnlineHouse2') ? 'F47B67' : `${user.flags.toArray().includes('HypeSquadOnlineHouse3') ? '45DDC0' : config.setup.colors.blue}`}`}`)
                    .setTimestamp()
                    .setThumbnail(user.displayAvatarURL())
                    .setTitle(`${find.premium_since ? `<:kbe_eNitro:975067040744374362>` : ``}${user.flags.toArray().map(b => json.badges[b]).join('')} ${user.username} `)

                embfields.push({ name: `Cargos`, value: `${member.roles.cache.size <= 1 ? 'Nenhum cargo.' : member.roles.cache.sort((a, b) => b.position - a.position).map(r => '<@&' + r + '>').slice(0, -1)}`, inline: false })
                embfields.push({ name: `Permissões`, value: `${member.permissions.toArray().includes('Administrator') ? 'Administrador. \`(todas as permissões estão inclusas)\`' : member.permissions.toArray().map(p => '`' + json.perms[p] + '`')}`, inline: false })

                if (embfields.length >= 1) emb.addFields(embfields)

                msg?.edit({ content: message.author.toString(), embeds: [emb], components: buttons(false) })
            }

            if (i.customId == 'back') {
                msg?.edit({ content: message.author.toString(), embeds: [embed], components: buttons(false) })
            }
        })

    }
}