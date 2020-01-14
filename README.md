# Room Booking

This project providing an interface to students, so they can reserve the room right in front of the room via a tablet.

## Installing
```
git clone git@github.com:culibraries/room-booking.git room-booking

cd room-booking

npm install

#run at localhost:4200
ng serve -o
```


## Build
PROD:
```
docker build --build-arg app=room-booking -t culibraries/room-booking:[version]
```
TESTING:
```
docker build --build-arg app=room-booking -t culibraries/room-booking:[version]
```
Push to DockerHub:
```
docker push culibraries/room-booking:[version]
```

## License

Libraries IT - University Of Colorado - Boulder
