FROM node:carbon
WORKDIR /usr/src/app

RUN apt-get update && \
  apt-get install -y zip apt-transport-https ca-certificates curl && \
  npm i -g yarn

EXPOSE 3303

CMD ["rm", "-rf", "node_modules"]
CMD ["yarn"]
CMD ["yarn", "serve"]
