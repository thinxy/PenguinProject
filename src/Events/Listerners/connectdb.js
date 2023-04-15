import { Sequelize } from "sequelize";
const sql = new Sequelize(
  "postgres://yxwyegrg:ash01Yv8fPVRdqtfdWSviUYiP6oH9HC3@heffalump.db.elephantsql.com/yxwyegrg",
  { logging: false },
)
sql.sync({ alter: true })
sql
  .authenticate()
  .then(console.log("[DATABASE] - Banco de dados conectado com sucesso!"))
  .catch(console.error);

export default sql;
