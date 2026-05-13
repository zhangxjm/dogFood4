FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN mkdir -p /app/data

RUN chmod +x /app/start.sh

EXPOSE 3000

CMD ["sh", "/app/start.sh"]
