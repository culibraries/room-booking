### STAGE 1: Build ###

FROM node:lts-alpine as builder

#This is default value
#Use 'app' as an argument from command line to build PROD or TESTING enviroment
ARG app=room-booking-test

RUN mkdir /app

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm ci

COPY . /app

RUN npm run ng build -- --prod --aot --vendor-chunk --common-chunk --output-path=dist --buildOptimizer  --base-href /${app}/



# ### STAGE 2: Setup ###

FROM nginx:alpine

#This is default value
#Use app as an argument from command line to build PROD or STAGING enviroment
ARG app=room-booking-test

COPY --from=builder /app/dist /usr/share/nginx/html/${app}