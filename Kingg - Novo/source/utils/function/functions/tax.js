const database = require('../../../database/main')

module.exports = async (id, value) => {
    if (await database.vip(id) == true) {
        return parseInt(value)
    } else {
        return parseInt((value / 100) * 95)
    }
}