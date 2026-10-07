FROM node:20-alpine
RUN addgroup -S bleed && adduser -S bleed -G bleed
WORKDIR /app
COPY package.json ./
RUN npm install
COPY index.js ./
USER bleed
EXPOSE 4021
CMD ["node", "index.js"]
