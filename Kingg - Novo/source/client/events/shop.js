const { EmbedBuilder, ButtonBuilder, ActionRowBuilder, SelectMenuBuilder, ButtonStyle, MessageCollector } = require('discord.js')
const { unabbreviate, abbreviate, durationTime } = require('util-stunks')
const cron = require('node-cron')
const json = require('../../utils/json/resources.json')

module.exports = {
    name: 'ready',
    once: false,
    execute: async (client) => {

        console.log('Loaded Shop - Event.')

        cron.schedule('0 0 * * *', () => {
            console.log('Shop Event - Started')
        }, {
            scheduled: true,
            timezone: "America/Sao_Paulo"
        })
    }
}