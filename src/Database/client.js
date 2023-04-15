//-> users.js
import Connection from "../Events/Listerners/connectdb.js" //importa a conexao ali de cima
import SQL from "sequelize"
const { DataTypes } = SQL

const Clientdb = Connection.define("clientdb", {
  id: {
    type: DataTypes.STRING(25),
    allowNull: false,
    primaryKey: true
  },
  command: {
    type: DataTypes.INTEGER,
    defaultValue: 1
  }
})

Clientdb.sync({ force: false })

export default Clientdb