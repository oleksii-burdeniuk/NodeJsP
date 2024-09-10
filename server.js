const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config({ path: './config.env' });

process.on('uncaughtException', (err) => {
  console.log(err.name, err.message);
  process.exit(1);
});

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD,
);

mongoose
  .connect(DB, {})
  .then(() => {
    console.log('Database connected successfully');
  })
  .catch((err) => {
    console.log(err);
  });

const app = require('./app');

// console.log(process.env);
//console.log(app.get('env'));

const port = process.env.PORT;
const server = app.listen(port, () => {
  console.log(`app running on port ${port}`);
});

process.on('unhandledRejection', (err) => {
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});
