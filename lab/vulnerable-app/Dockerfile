FROM node:20-alpine
RUN addgroup -S bleed && adduser -S bleed -G bleed
WORKDIR /app
COPY package.json ./
RUN npm install
COPY src/ ./src/
USER bleed
EXPOSE 4010
CMD ["node", "src/index.js"]
