module.exports = async (id, client, message, canAuthor = false) => {
    let user = message.mentions.users.first() || client.users.cache.get(id) || client.users.cache.find(x => x.tag?.toLowerCase()?.includes(id?.toLowerCase()) || message.mentions.members.first())
    if (!user) {
        try {
            user = await client.users.fetch(id)
        } catch (e) {

        }
    }
    if (!user) {
        if (canAuthor) return message.author
        else return false
    } else return user
}