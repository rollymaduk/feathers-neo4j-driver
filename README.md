# feathers-neo4j-driver

[![Build Status](https://travis-ci.org/rollymaduk/feathers-neo4j-driver.png?branch=master)](https://travis-ci.org/rollymaduk/feathers-neo4j-driver)

> A feathers service wrapper around node-neo4j
## About
This is a simple feathers plugin wrapper around the excellent [node-neo4j](https://github.com/thingdom/node-neo4j/blob/v2/API_v2.md) library

## Installation
```
npm install feathers-neo4j-driver --save
```

## Documentation
```js
// configure options
const options={uri:'http://localhost:7474',user:"username",pass:"password"}

// Register the service
app.use('/neo4j', plugin(options));

// Use the service
const service =app.service('neo4j');

 // to batch multiple requests over a single network connection use an array object of {query,params}: returns a promise
service.create([{query:'CREATE (n:TESTNODE {key:{value})',params:{value:"my value"}}]).then((res)=>{
    
}).catch(err=>err)

//for single request per network connection use object {query,params}: returns a promise
service.create({query:'CREATE (n:TESTNODE {key:{value})',params:{value:"my value"}}).then((res)=>{
    
}).catch(err=>err)
```
## API
- **create(pluginOptions):** creates a new cypher query in neo4j _see plugin options below_
- **queryTransaction(pluginOptions):** creates a new cypher query as a transaction neo4j _see plugin options below_
- **commitTransaction():** commits a cypher transaction  
- **rollbackTransaction():** rolls back a cypher transaction  

## Config Options
- **uri:_String_** neo4j server url
- **user:_String_** username for basic authentication to neo4j db
- **pass:_String_** password for basic authentication to neo4j db
- **pass:_String_** password for basic authentication to neo4j db
- **[headers](https://github.com/thingdom/node-neo4j/blob/v2/API_v2.md#core):_{}_**    // optional defaults, e.g. User-Agent
- **[proxy](https://github.com/thingdom/node-neo4j/blob/v2/API_v2.md#core):_null_**    // optional URL
- **[agent](https://github.com/thingdom/node-neo4j/blob/v2/API_v2.md#core):_null_**    // optional http.Agent instance, for custom socket pooling
 
## Plugin Options
- **query:_String_:** Cypher Query
- **params:_Object_:** Query parameters
- **[lean](https://github.com/thingdom/node-neo4j/blob/v2/API_v2.md#cypher):_Boolean_:** nodes and relationships will be transformed to Node and Relationship objects 
- **[headers](https://github.com/thingdom/node-neo4j/blob/v2/API_v2.md#cypher):_Object_:** custom headers 

## Todo
- fix tests for connecting to neo4j in travis
- write more tests

## License

Copyright (c) 2016

Licensed under the [MIT license](LICENSE).
