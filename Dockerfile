
FROM node:latest

WORKDIR /usr/src/app

COPY package.json yarn.lock ./
RUN yarn install

COPY . .
RUN npx tsc

EXPOSE 3000

CMD node app.js
