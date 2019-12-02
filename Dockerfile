FROM node:4.2.1-onbuild

VOLUME ["/usr/src/app/files"]

ENV NODE_ENV production
ENV PORT 80
EXPOSE 80
