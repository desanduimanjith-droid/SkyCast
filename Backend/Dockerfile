FROM node:18-bullseye-slim
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 4001
CMD ["node", "dist/server.js"]
