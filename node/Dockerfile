FROM node:10
WORKDIR /root/node/src/
COPY . .
RUN apt-get update && \
    apt-get upgrade -y && \
    npm install --global yarn && \
    yarn
EXPOSE 80
CMD ["yarn", "start"]