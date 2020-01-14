FROM node:12
RUN npm i -g pm2

WORKDIR /usr/src/app

# requirements change less than the code
COPY package.json .
COPY package-lock.json .
RUN npm i

# code changes less than the config
COPY app.js .
COPY bin bin
COPY public public
COPY routes routes
COPY util util
COPY views views

# config
COPY config config

VOLUME ["/usr/src/app/files"]

ENV NODE_ENV production
# overrides port
ENV PORT 80
EXPOSE 80
ENTRYPOINT ["pm2-runtime", "bin/www"]
