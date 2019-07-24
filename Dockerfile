FROM node:10
WORKDIR /root/node/
COPY /src/package*.json ./
RUN npm install
COPY /src/ .
EXPOSE 80
CMD ["node", "server.js"]

