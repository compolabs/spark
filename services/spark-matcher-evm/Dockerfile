FROM node:14-slim
RUN mkdir -p /home/node/app/node_modules && \
         chown -R node:node /home/node/app
COPY . /home/node/app
WORKDIR /home/node/app
RUN npm install
RUN npm run build

EXPOSE 5000
CMD [ "node", "dist/server.js" ]
