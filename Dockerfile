### STAGE 1: Build ###

FROM node:lts-alpine as builder

RUN mkdir /app

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm ci

COPY . /app

RUN npm run ng build -- --prod --output-path=dist --base-href /room-booking-accessibility-testing/


# ### STAGE 2: Setup ###

FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html/room-booking-accessibility-testing