//-> users.js
import Connection from "../Events/Listerners/connectdb.js" //importa a conexao ali de cima
import SQL from "sequelize"
const { DataTypes } = SQL

const Ruffle = Connection.define("ruffle", {
  id: {
    type: DataTypes.STRING(25),
    allowNull: false,
    primaryKey: true
  },
  rifatime: {
    type: DataTypes.BIGINT,
    defaultValue: 3600000
  },
  rifavalue: {
    type: DataTypes.BIGINT,
    defaultValue: 0
  },
  rifabilhete: {
    type: DataTypes.BIGINT,
    defaultValue: 0
  },
  rifausers: {
    type: DataTypes.ARRAY(DataTypes.STRING(30)),
    defaultValue: []
  } ,
  rifaganhador: {
    type: DataTypes.STRING,
    defaultValue: "Nenhum ganhador ainda."
  }
})

Ruffle.sync({ force: false })

export default Ruffle