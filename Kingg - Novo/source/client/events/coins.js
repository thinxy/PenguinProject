const { EmbedBuilder, ButtonBuilder, ActionRowBuilder, SelectMenuBuilder, ButtonStyle, MessageCollector } = require('discord.js')
const { unabbreviate, abbreviate, durationTime } = require('util-stunks')

module.exports = {
    name: 'ready',
    once: false,
    execute: async (client) => {

        console.log('Loaded CPM - Event.')

        setInterval(async () => {
            Cpm()
        }, 60000)

        async function Cpm() {
            let vip = await client.database.users.find({}, 'util').then(x => x.filter(x => x.util.premium == 'perm' || Number(x.util.premium) >= Date.now())).then(x => x.map(x => x._id)),
                monarca = await client.database.users.find({}, 'util').then(x => x.filter(x => x.util.donated > 0)).then(x => x.map(x => x._id)),
                guild = client.guilds.cache.get('930108325834686485')

            for (let i of monarca) {
                await client.database.add(i, 5)
                if (guild) {
                    try {
                        if (!guild.members.cache.get(i).roles.cache.get('930109190461075458')) {
                            guild.members.cache.get(i).roles.add('930109190461075458')
                        }
                    } catch { }
                }
            }

            for (let i of vip) {
                await client.database.add(i, 15)

                if (guild) {
                    try {
                        if (!guild.members.cache.get(i).roles.cache.get('998006177768153168')) {
                            guild.members.cache.get(i).roles.add('998006177768153168')
                        }
                    } catch { }
                }
            }

        }
    }
}