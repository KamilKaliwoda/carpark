import express from 'express';
import dotenv from 'dotenv';
import { PostUpdate } from './postUpdate';
import sql from 'mssql';
import { Client } from 'pg';
import { db_config, client_config } from './config/config';
import { Endpoints } from './endpoints';
import cors from 'cors';
import { resolve } from 'path';

//carpark();

dotenv.config();

export const app = express();

app.use(
  cors({
    origin: 'http://localhost:8131',
  }),
);

const sql = new Client(client_config);

sql.connect(function(err) {
  if (err) throw err;
  console.log("Connected to database!");
});

const postUpdate = new PostUpdate(app, sql);

const endpoints = new Endpoints(app, sql);

const server = app.listen(Number(process.env.SERVER_PORT), '0.0.0.0', () => {
  console.log('Server running...');
});
