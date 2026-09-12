FROM node:22-alpine

WORKDIR /app

COPY ["El Bromas/package.json", "./package.json"]
RUN npm install --omit=dev

COPY ["El Bromas/", "./"]

ENV NODE_ENV=production
EXPOSE 10000

CMD ["node", "server2.js"]
