### STAGE 1: Build ###

FROM node:lts-alpine as builder

# Set working directory.
RUN mkdir /app
WORKDIR /app


COPY package.json package-lock.json ./

RUN npm ci

COPY . /app

## Build the angular app in production mode and store the artifacts in dist folder

RUN npm run ng build --prod --output-path=dist


# ### STAGE 2: Setup ###

FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html/room-booking
COPY /nginx.conf /etc/nginx/conf.d/default.conf