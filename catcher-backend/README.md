# backend for catcher game

The backend uses Node.Js with express, redis and SQLite with typeorm to support the game and leaderboard web app.
It provides APIs to access game and player info, and also provide web socket for realtime leaderboard.

## Setup and run unit tests
Please install and run redis locally first before running the commands

https://redis.io/docs/getting-started/installation/
```sh
npm install  # run this at the first time
npm start
```
Run ```npm test``` to run the unit tests

## Main Files
`index.ts`: main startup file for the backend app

`routes.ts`: contains all the API endpoints definition

`services.ts`: contains the core logic of the actions for the API and web socket

`db.ts`: provides connection to db and repositories for services to manipulate the db

`socket.ts`: socket connections

## APIs
`POST /player`: create a player for first time users and give player id, will emit event to socket if a top play is added

request
```json
{
  "name": "test"
}
```
response
```json
{
  "id": 1,
  "name": "test"
}
```
if name is already taken, it will append a number at the end of name
```json
{
  "id": 1,
  "name": "test_1"
}
```

`POST /game`: create a game record for a player and get the best rank of the player
request
```json
{
  "playerId": 1,
  "score": 1000
}
```
response
```json
{
  "gameId": 1,
  "rank": 1
}
```
`GET /leaderboard`: get top 100 players score and name
response

```json
[
  {
    "id": 1,
    "name": "test",
    "score": 1000
  },
  {
    "id": 2,
    "name": "test_1",
    "score": 900
  },
  ...
]
```

It also provides a socket connection to get realtime leaderboard data with the same response as the above, 
which will be updated when a new game is submitted
