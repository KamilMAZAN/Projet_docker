FROM node:16

WORKDIR /app

COPY package*.json ./

RUN npm install

RUN apt-get update && apt-get install -y default-jre

COPY . .

EXPOSE 80

CMD ["npm", "start"]
