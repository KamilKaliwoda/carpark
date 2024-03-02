FROM node:19.3.0-alpine

WORKDIR /app

COPY dist/apps/carpark-app .

RUN npm install

COPY . .

EXPOSE 9132

CMD node ./main.js