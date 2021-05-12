## Base image
FROM node:10.18-alpine as base
RUN mkdir /workspace
COPY . /workspace/
WORKDIR /workspace
RUN apk add libxext fontconfig libxrender make gcc g++ git
RUN npm install && \
	npm install -g bower && \
	bower install --allow-root
RUN npm run build

## Final image
FROM node:14-alpine
RUN wget -qO- "https://github.com/dustinblackman/phantomized/releases/download/2.1.1/dockerized-phantomjs.tar.gz" | tar xz -C /
RUN apk add postgresql-client unzip
RUN apk add --update ttf-dejavu ttf-droid ttf-freefont ttf-liberation ttf-ubuntu-font-family && rm -rf /var/cache/apk/*
WORKDIR /analytics-center
COPY --from=base /workspace/app ./app
COPY --from=base /workspace/config ./config
COPY --from=base /workspace/preProcessor ./preProcessor
COPY --from=base /workspace/node_modules ./node_modules
COPY --from=base /workspace/public ./public
COPY --from=base /workspace/package* ./
EXPOSE 8000
CMD ["npm","run","start"]
