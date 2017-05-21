
FROM node:latest
LABEL Name=vscode-spotify-lyrics Version=0.0.1 
COPY . /usr/src/app
RUN cd /usr/src/app && yarn install
WORKDIR /usr/src/app
EXPOSE 3000
CMD node app.js
