const config = require('../../utils/json/config.json')
const { EmbedBuilder } = require('discord.js')

module.exports = {
    name: 'ready',
    once: false,
    execute: async (client) => {

        setInterval(async () => {
            let allRemind = await client.database.remind.find({}), remindData = allRemind.map(x => x.reminders)
            for (let data of remindData) {
                for (let remind of data) {
                    if (remind.endsIn < Date.now()) {

                        let user = await client.users.fetch(remind.user),
                            guild = await client.guilds.cache.get(remind.guild),
                            channel = guild?.channels.cache.get(remind.channel),
                            emb = new EmbedBuilder()

                                .setColor(config.colors.default)
                                .setDescription(`[Redirecionar a mensagem](${remind.url})`)

                        try {
                            await channel?.send({ embeds: [emb], content: `🔔 **${config.text.separator}** ${user}, você me pediu para lembrar de \`${remind.content}\` <t:${parseInt(remind.startedIn / 1000)}:R> atrás!` })
                        } catch (e) {
                            await user?.send({ embeds: [emb], content: `🔔 **${config.text.separator}** ${user}, você me pediu para lembrar de \`${remind.content}\` <t:${parseInt(remind.startedIn / 1000)}:R> atrás!` }).catch(() => { })
                        }

                        await client.database.remind.updateOne({ _id: user.id }, {
                            $pull: { reminders: remind }
                        })

                    }
                }
            }
        }, 8000)
        console.log(`Loaded Reminder - Event.`)
    }
}