FROM node:20-alpine
RUN addgroup -S bleed && adduser -S bleed -G bleed
WORKDIR /app
COPY package.json ./
RUN npm install
COPY index.js ./
USER bleed
EXPOSE 4022
CMD ["node", "index.js"]
