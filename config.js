module.exports = {
  database: process.env.DATABASE_NAME || 'asl',
  host: process.env.DATABASE_HOST || 'localhost',
  password: process.env.DATABASE_PASSWORD,
  port: process.env.DATABASE_PORT,
  username: process.env.DATABASE_USERNAME
};
