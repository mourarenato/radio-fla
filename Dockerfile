FROM node:latest

RUN npm install -g ts-node

RUN apt-get update && apt-get install -y ffmpeg

WORKDIR /app
COPY . /app

CMD ["yarn", "start"]
