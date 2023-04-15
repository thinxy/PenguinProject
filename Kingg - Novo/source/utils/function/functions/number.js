const { unabbreviate } = require('util-stunks')

module.exports = async (arg, max = 0, max2 = 0) => {
    let value = 0

    if (['max', 'all', 'tudo'].includes(arg)) {
        if (max2 == 0) {
            value = max
        } else {
            if (max > max2) value = Number(max2)
            else value = Number(max)
        }
    }
    else if (['metade', 'half'].includes(arg)) {
        value = Number(max / 2)
    }
    else if (['sobras'].includes(arg)) {
        let sobras = max.toLocaleString('de-DE').split('.')
        let val1 = Number(sobras[sobras.length - 1]), val2 = sobras[sobras.length - 2]?.substring(sobras.length <= 2 ? 2 : 1)

        value = val1 && val2 ? Number((val2 * 1000) + val1) : val1 ? Number(val1) : val2 ? Number(val2 * 1000) : 0
    }
    else {
        try {
            if (!arg.includes('%') || isNaN(`${arg}`.replace('%', '')) || Number(`${arg}`.replace('%', '')) > 100 || Number(`${arg}`.replace('%', '')) < 1) {
                value = Number(unabbreviate(arg))
            }
            else {
                value = Number((max / 100) * Number(`${arg}`.replace('%', '')))
            }
        } catch {
            value = Number(unabbreviate(arg))
        }
    }

    return parseInt(value)
}