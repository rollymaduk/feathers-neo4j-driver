import test from 'tape';
import plugin from '../src';
const feathers=require('feathers');
const rest=require("feathers-rest")
const chai=require("chai")
const chai_http=require('chai-http')
const app=feathers();
const bodyParser=require('body-parser')
const promisify=require('es6-promisify')

chai.use(chai_http)
app.use(bodyParser.json())
  .use(bodyParser.urlencoded({extended: true }))
  .configure(rest())
  .use('/neo4j',plugin({uri:'http://localhost:7474',user:'neo4j',pass:'enter'}))

function _executeQuery(query,cb){
  chai.request('http://neo4j:enter@localhost:7474')
    .post('/db/data/transaction/commit')
    .set('Accept','application/json')
    .send({statements:query})
    .end((err,res)=>{
      cb.call(null,err,res)
    })
}

function _cleanUp(cb){
  return executeQuery([{statement:'MATCH (n:TESTNODE) delete n'}]).then(()=>{
    cb.call(null)
  })
}

const executeQuery=promisify(_executeQuery)

const cleanUp=promisify(_cleanUp)



test("is commonJS compatible",(t)=>{
  t.equal(typeof require('../lib'),'function')
  t.end()
})

test("registers service",(t)=>{
  t.ok(app.service('neo4j'))
  t.end()
})

test('throws error without server URI',(t)=>{
  t.throws(()=>plugin(),"neo4J requires URI path")
  t.end()
})

test('throws error without login auth',(t)=>{
  t.throws(()=>plugin({uri:'path'}),"neo4J requires auth user!")
  t.end()
})

test('throws error without pass auth',(t)=>{
  t.throws(()=>plugin({uri:'path',user:""}),"neo4J requires auth pass!")
  t.end()
})
test.skip('executes single cypher query',(t)=>{
    const service=app.service('neo4j')
    service.create({query:'CREATE (n:TESTNODE {key:{value}})',params:{value:"my value"}})
      .then((res)=>{
        return executeQuery([{statement:'MATCH (n:TESTNODE {key:{value}}) return n',parameters:{value:"my value"}}])
      })
      .then((res)=>{
        const type=res.body.results[0].data[0].meta[0].type
        const value=res.body.results[0].data[0].row[0].key
        t.equal(type,'node')
        t.equal(value,'my value')
      })
      .then(()=>cleanUp())
      .then(()=>{
        t.end()
      })
      .catch((err)=>{
        console.log(err)
      })
})

test.skip('executes batch cypher query',(t)=>{
    const service=app.service('neo4j')
    service.create([
      {query:'CREATE (n:TESTNODE {key:{value}})',params:{value:"my value"}},
      {query:'CREATE (n:TESTNODE {key:{value}})',params:{value:"my value2"}},
      ])
      .then((res)=>{
        return executeQuery([{statement:'MATCH (n:TESTNODE) return n'} ])
      })
      .then((res)=>{
          t.equal(res.body.results[0].data.length,2)
          const value1=res.body.results[0].data[0].row[0].key
          const value2=res.body.results[0].data[1].row[0].key
          t.equal(value1,'my value')
          t.equal(value2,'my value2')

      })
      .then(()=>cleanUp())
      .then(()=>{
        t.end()
      })
      .catch((err)=>{
        console.log(err)
      })
  })
//})
test.skip("cypher error is thrown",(t)=>{
  "use strict";
  const service=app.service('neo4j')
 service.create({query:'CREATE (n:TESTNODE {key:{value}}',params:{value:"my value"}})
   .catch(err=>{
    t.error(err)
     t.end()
 })
})

test.skip('commits cypher transactions',(t)=>{
  const service=app.service('neo4j')
  service.queryTransaction({query:'CREATE (n:TESTNODE {key:{value}})',params:{value:"my value"}})
    .then(()=>{
      //execute another query
      return service.queryTransaction({query:'CREATE (n:TESTNODE {key:{value}})',params:{value:"my value2"}})
    })
    .then((res)=>{
      return executeQuery([{statement:'MATCH (n:TESTNODE) return n'} ])
    })
    .then((res)=>{
      //does not commit
      t.looseEqual(res.body.results[0].data,[])
    })
    .then(()=>service.commitTransaction())
    .then(()=>executeQuery([{statement:'MATCH (n:TESTNODE) return n'} ]))
    .then((res)=>{
      //commits transaction
      t.equals(res.body.results[0].data.length,2)
      const type=res.body.results[0].data[0].meta[0].type
      const value=res.body.results[0].data[0].row[0].key
      t.equal(type,'node')
      t.equal(value,'my value')
    })
    .then(()=>cleanUp())
    .then(()=>{
      t.end()
    })
    .catch((err)=>{
      console.log(err)
    })
})

test.skip('rolls back cypher transactions ',(t)=>{
  const service=app.service('neo4j')
  service.queryTransaction({query:'CREATE (n:TESTNODE {key:{value}})',params:{value:"my value"}})
    .then(()=>{
      //execute another query
      return service.queryTransaction({query:'CREATE (n:TESTNODE {key:{value}})',params:{value:"my value2"}})
    })
    .then((res)=>{
      return executeQuery([{statement:'MATCH (n:TESTNODE) return n'} ])
    })
    .then((res)=>{
      //does not commit
      t.looseEqual(res.body.results[0].data,[])
    })
    .then(()=>service.rollbackTransaction())
    .then(()=>executeQuery([{statement:'MATCH (n:TESTNODE) return n'} ]))
    .then((res)=>{
      //rollsback transaction
      t.looseEqual(res.body.results[0].data,[])
    })
    .then(()=>cleanUp())
    .then(()=>{
      t.end()
    })
    .catch((err)=>{
      console.log(err)
    })
})
