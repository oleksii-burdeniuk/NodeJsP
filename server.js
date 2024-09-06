const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config({ path: './config.env' });

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
app.listen(port, () => {
  console.log(`app running on port ${port}`);
});
