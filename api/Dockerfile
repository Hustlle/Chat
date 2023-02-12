FROM node:14 AS development

WORKDIR /nikita/src/app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

EXPOSE 3000

################
## PRODUCTION ##
################
FROM node:14 AS production

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

WORKDIR /nikita/src/app

COPY --from=development /nikita/src/app/ .

EXPOSE 3000

CMD [ "node", "dist/main"]