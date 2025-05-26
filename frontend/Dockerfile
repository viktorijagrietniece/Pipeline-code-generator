FROM node:20-bullseye

WORKDIR /app

COPY package*.json ./
RUN npm install --include=dev --no-optional

COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev"]
