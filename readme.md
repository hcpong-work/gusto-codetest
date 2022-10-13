# Gusto Code Test Readme

## -- Updated 2022-10-13--
### Test
0. Assumption
- simple testing only with the same database used in the api server
1. Finish (1) Setup
2. npm run test

## 1. Setup
1. Git pull from source
2. Run command `docker build -t api-server --no-cache .`
3. Run command `docker-compose up`
4. Access `http://localhost/api-docs` to see swagger ui page.

## Assumption
### a. User
- In normal production environment, user should be recognized in oauth2 way. But in this simple case, only used a user id to put in header `Authorization` for convenient
### b. Cut off time
- As mentioned in the requirement, each user can participate in the lucky draw once a day. It is assumed that the cut off time of a day is at 00:00.

## 2. Explain
### a. Terminology
- Prize
  - A category of prize that is possible to win
- Winner
  - Player that drew a prize

### b. Database
- Prize
  - id: unique id of a prize
  - name: display name of a prize
  - total: total supply of a prize. `-1` means unlimited.
  - daily: daily quota of a prize. `-1` means unlimited.
  - odds: possibility of a prize being drawn, range from 0 to 1. `0` means 0%, `1` means 100%.
  - isDefault: set `true` if this is the fallback/default prize

- Winner
  - id: unique winner id
  - entryId: unique winner id for display
  - customerId: to identify the user of the prize
  - phone: a phone number field for user to input
  - prizeId: the prize of this win
  - createdAt: timestamp of the win
  - redeemedAt: timestamp of user input phone number

### c. Tech
1. Redis
- Used to prevent race condition
2. MySQL
- Used as the main database
3. Express
- Used as api server

### d. Endpoints
- Please refers to `http://localhost/api-docs`