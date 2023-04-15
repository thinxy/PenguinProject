//-> users.js
import Connection from "../Events/Listerners/connectdb.js" //importa a conexao ali de cima
import SQL, { STRING } from "sequelize"
const { DataTypes } = SQL

const Users = Connection.define("users", {
  id: {
    type: DataTypes.STRING(25),
    allowNull: false,
    primaryKey: true
  },
  money: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  tr: {
    type: DataTypes.ARRAY(DataTypes.STRING(1000)),
    defaultValue: []
  },
  xp: {
    type: DataTypes.BIGINT,
    defaultValue: 0
  },
  level: {
    type: DataTypes.BIGINT,
    defaultValue: 1
  },

  //<------------------------ BOT -------------------------------->

  verify: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  ban: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  motiveban: {
    type: DataTypes.STRING,
    defaultValue: "Nenhum motivo especificado para o banimento."
  },
  dateban: {
    type: DataTypes.BIGINT,
    defaultValue: 0
  },
  command: {
    type: DataTypes.BIGINT,
    defaultValue: 1
  },
  staff: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },

  //<------------------------ PERFIL -------------------------------->

  background: {
    type: DataTypes.ARRAY(DataTypes.STRING(500)),
    defaultValue: ["https://cdn.discordapp.com/attachments/1006035026967801916/1029520334602387506/images_5.jpg"]
  },
  bgatual: {
    type: DataTypes.STRING,
    defaultValue: "https://cdn.discordapp.com/attachments/1006035026967801916/1029520334602387506/images_5.jpg"
  },
  sobremim: {
    type: DataTypes.STRING(192),
    defaultValue: "Olá você gosta de Penguins? para mudar este sobremim clique no botão abaixo."
  },
  curtidas: {
    type: DataTypes.BIGINT,
    defaultValue: 0
  },
  usermarry: {
    type: DataTypes.BIGINT,
    defaultValue: 0
  },
  marry: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },

  //<------------------------ AFK -------------------------------->

  afkuser: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  motiveafk: {
    type: DataTypes.STRING(290),
    defaultValue: "Undefined"
  },

  //<------------------------ MINES -------------------------------->

  mines: {
    type: DataTypes.BIGINT,
    defaultValue: 500
  },
  bitcoins: {
    type: DataTypes.BIGINT,
    defaultValue: 0
  },
  bitcoinValue: {
    type: DataTypes.BIGINT,
    defaultValue: 100
  },
  bitcoinTime: {
    type: DataTypes.BIGINT,
    defaultValue: 0
  },
  CodigosArray: {
    type: DataTypes.ARRAY(DataTypes.STRING(200)),
    defaultValue: []
  },
  CodeUser: {
    type: DataTypes.STRING(100),
    defaultValue: ""
  },
  timeTeste: {
    type: DataTypes.BIGINT,
    defaultValue: 0
  },
  proName: {
    type: DataTypes.STRING(100),
    defaultValue: "DualCore (Gratis)"
  },

  //<------------------------ LEMBRETES -------------------------------->

  lembreteWork: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  lembreteDaily: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  lembreteCrime: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  lembreteVic: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  channelDaily: {
    type: DataTypes.BIGINT,
    defaultValue: 0
  },
  channelVic: {
    type: DataTypes.BIGINT,
    defaultValue: 0
  },
  channelWork: {
    type: DataTypes.BIGINT,
    defaultValue: 0
  },
  channelCrime: {
    type: DataTypes.BIGINT,
    defaultValue: 0
  },

  //<------------------------ COOLDOWNS -------------------------------->

  daily: {
    type: DataTypes.BIGINT,
    defaultValue: 0
  },
  rep: {
    type: DataTypes.BIGINT,
    defaultValue: 0
  },
  crime: {
    type: DataTypes.BIGINT,
    defaultValue: 0
  },
  vip: {
    type: DataTypes.BIGINT,
    defaultValue: 0
  },
  comando: {
    type: DataTypes.BIGINT,
    defaultValue: 0
  },
  countcmd: {
    type: DataTypes.BIGINT,
    defaultValue: 0
  },
  bancmd: {
    type: DataTypes.BIGINT,
    defaultValue: 0
  },
  processador: {
    type: DataTypes.BIGINT,
    defaultValue: 0
  },
  work: {
    type: DataTypes.BIGINT,
    defaultValue: 0
  },
  vic: {
    type: DataTypes.BIGINT,
    defaultValue: 0
  }
})

Users.sync({ force: false })

export default Users