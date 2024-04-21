export const db_config = {
  user: process.env.DB_USERNAME,
  password: process.env.DB_USER_PASSWORD,
  server: process.env.DB_SERVER,
  database: process.env.DB_NAME,
  options: {
    trustServerCertificate: true,
  },
};

export const client_config = {
  user: process.env.DB_USERNAME,
  password: process.env.DB_USER_PASSWORD,
  host: process.env.DB_SERVER,
  database: process.env.DB_NAME,
  port: 5432,
};
