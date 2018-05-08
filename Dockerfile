FROM node:carbon
WORKDIR /usr/src/app

RUN apt-get update && \
  apt-get install -y zip curl && \
  npm i -g yarn

EXPOSE 3303

CMD rm -rf node_modules && \
  yarn && \
  yarn serve