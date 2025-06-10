export default () => ({
  database: {
    type: process.env.DB_TYPE as any,
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT, 10),
    username: process.env.DB_USERNAME,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    autoLoadEntities: Boolean(process.env.DB_AUTO_LOAD_ENTITIES),
    synchronize: Boolean(process.env.DB_SYNCHRONIZE), //sempre deve estar false em produção
  },
  enviroment: process.env.NODE_ENV || 'development',
});
