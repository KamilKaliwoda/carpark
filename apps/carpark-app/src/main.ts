import express from 'express';
import dotenv from 'dotenv';
import sql from 'mssql';
import { db_config } from './config/config';
import { Endpoints } from './endpoints';
import cors from 'cors';
import { resolve } from 'path';

//carpark();

dotenv.config();

export const app = express();

app.use(
  cors({
    origin: 'http://localhost:9131',
  }),
);

sql.connect(db_config, function (err) {
  if (err) console.log(err);
});

const endpoints = new Endpoints(app, sql);

const server = app.listen(Number(process.env.SERVER_PORT), '0.0.0.0', () => {
  console.log('Server running...');
});
