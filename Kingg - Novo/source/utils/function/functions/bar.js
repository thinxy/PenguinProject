module.exports = async (current, total, size, char1, char2) => {
    let progress = Math.round((size * current) / total), result = `${char1}`.repeat(progress) + `${char2}`.repeat(size - progress)
    return result
}