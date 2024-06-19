FROM node:18.20.3

RUN apt-get update && apt-get install -y dumb-init

RUN mkdir /data && chown 1000 /data

WORKDIR /app

COPY package*.json ./

RUN --mount=type=cache,target=/app/.npm \
  npm set cache /app/.npm && \
  npm ci

USER 1000

COPY --chown=1000 tsconfig.json ./

EXPOSE 8081

# CMD ["dumb-init", "./node_modules/nodemon/bin/nodemon.js", "--watch", "src", "src/server.ts", "--", "--inspect=0.0.0.0:9123"]

CMD ["dumb-init", "./node_modules/nodemon/bin/nodemon.js", "--watch", "src", "-e", "ts,json", "--exec", "node", "--inspect=0.0.0.0:9123", "--expose-gc", "-r", "ts-node/register", "src/server.ts"]