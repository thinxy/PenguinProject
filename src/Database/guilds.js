//-> users.js
import Connection from "../Events/Listerners/connectdb.js" //importa a conexao ali de cima
import SQL, { STRING } from "sequelize"
const { DataTypes } = SQL

const Guilds = Connection.define("guilds", {
  id: {
    type: DataTypes.STRING(25),
    allowNull: false,
    primaryKey: true
  },
  prefixo: {
    type: DataTypes.STRING(3),
    defaultValue: "p!"
  },
  welcomeChannel: {
    type: DataTypes.STRING(30),
    defaultValue: "null"
  },
  welcomeStatus: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  welcomeMessage: {
    type: DataTypes.STRING(350),
    defaultValue: "null"
  }
})

Guilds.sync({ force: false })

export default Guilds
