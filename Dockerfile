FROM node:18-alpine as node
# Create app directory
WORKDIR /usr/src/app
# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./
COPY public ./public/
#RUN npm install
# If you are building your code for production
RUN npm ci --only=production
# Bundle app source
COPY src ./src/
COPY public ./public/

EXPOSE 3001
#CMD ["/bin/sh","-c","./startup.sh"]
CMD node --es-module-specifier-resolution=node src/seeds.js; npm start
