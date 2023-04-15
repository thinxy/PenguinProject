module.exports = async (valor1, valor2, precisao) => {
    if (!valor1 || !valor2) return '0%'
    if (!precisao || precisao < 2 || isNaN(precisao)) precisao = 2
    return ((valor1 / valor2) * 100).toFixed(precisao) + "%"
}