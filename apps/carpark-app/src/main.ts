import express from 'express';
import dotenv from 'dotenv';
import { PostUpdate } from './postUpdate';
import sql from 'mssql';
import { Client } from 'pg';
import { db_config, client_config } from './config/config';
import { Endpoints } from './endpoints';
import cors from 'cors';
import { resolve } from 'path';
import https from 'https';
import fs from 'fs';


dotenv.config();
// const httpsOptions = {
//   key: fs.readFileSync(resolve(__dirname, '../../../../../../certs/private.pem')),
//   cert: fs.readFileSync(resolve(__dirname, '../../../../../../certs/certificate.pem'))
// };


export const app = express();

app.use(
  cors({
    origin: ['https://www.carpark.site', 'https://carpark.site', 'https://www.carpark.site.', 'https://carpark.site']
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
  console.log(`HTTP server running on port ${process.env.SERVER_PORT}...`);
});

// const server = https.createServer(httpsOptions, app).listen(Number(process.env.SERVER_PORT), '0.0.0.0', () => {
//   console.log(`HTTPS server running on port ${process.env.SERVER_PORT}...`);
// });
