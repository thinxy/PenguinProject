//-> users.js
import Connection from "../Events/Listerners/connectdb.js" //importa a conexao ali de cima
import SQL, { STRING } from "sequelize"
const { DataTypes } = SQL

const Reminder = Connection.define("reminder", {
  id: {
    type: DataTypes.STRING(25),
    allowNull: false,
    primaryKey: true
  },
  reminders: {
    type: DataTypes.ARRAY(DataTypes.STRING(1000)),
    defaultValue: []
  }
})

Reminder.sync({ force: false })

export default Reminder
