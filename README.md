## 1. What is this?

The purpose of this project was to build an API for a set of data using Node.js - Express framework and storing it in a Mongo DB database. The data is also retrieved using Mongoose methods instead of manipulating the data in the server.

## 2. What did I do?

The API I've built is for a static set of Golden Globes data.
I've decided to build different routes. You can query all nominees and nominations, as well as a specific nominee and its nominations.
There is no pagination for this project, but it is on the to-do list.

- Example url for nominees: /nominees
- Example url for nominations: /nominations
- Example url for specific nominee: /nominees/{id}
- Example url for specific nominee's nominations: /nominees/{id}/nominations

## 3. Where can you see it in action?

You can access the project [here](https://tavferreira-mongo-api.herokuapp.com/).