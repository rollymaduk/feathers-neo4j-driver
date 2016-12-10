import test from 'tape';
import plugin from '../src';
const feathers=require('feathers');
const rest=require("feathers-rest")
const chai=require("chai")
const chai_http=require('chai-http')
const port=3020;
const app=feathers();
const bodyParser=require('body-parser')
chai.use(chai_http)
app.use(bodyParser.json())
  .use(bodyParser.urlencoded({extended: true }))
  .configure(rest())
  .use('/neo4j',plugin({uri:'http://localhost:7474',user:'neo4j',pass:'enter'}))

function cleanUp(url,cb){
  chai.request(url)
    .post('/db/data/transaction/commit')
    .set('Accept','application/json')
    .send({statements:[{statement:'MATCH (n:TESTNODE) DELETE n'}]})
    .end((err,res)=>{
      cb.call(null)
    })

}

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
test('executes single cypher query',(t)=>{
  const server=app.listen(port);
  server.once('listening',()=>{
    const service=app.service('neo4j')
    service.create({query:'CREATE (n:TESTNODE {key:{value}})',params:{value:"my value"}}).then((res)=>{
      chai.request('http://neo4j:enter@localhost:7474')
        .post('/db/data/transaction/commit')
        .set('Accept','application/json')
        .send({statements:[{statement:'MATCH (n:TESTNODE {key:{value}}) return n',parameters:{value:"my value"}}]})
        .end((err,res)=>{
          server.close()
          const type=res.body.results[0].data[0].meta[0].type
          const value=res.body.results[0].data[0].row[0].key
          t.equal(type,'node')
          t.equal(value,'my value')
          cleanUp('http://neo4j:enter@localhost:7474',()=>{
            t.end()
          })
        })
    })
  })

})

test('executes batch cypher query',(t)=>{

  const server=app.listen(port);
  server.once('listening',()=>{
    const service=app.service('neo4j')
    service.create([{query:'CREATE (n:TESTNODE {key:{value}})',params:{value:"my value"}}]).then((res)=>{
      chai.request('http://neo4j:enter@localhost:7474')
       .post('/db/data/transaction/commit')
       .set('Accept','application/json')
       .send({statements:[{statement:'MATCH (n:TESTNODE {key:{value}}) return n',parameters:{value:"my value"}}]})
       .end((err,res)=>{
         server.close()
       const type=res.body.results[0].data[0].meta[0].type
       const value=res.body.results[0].data[0].row[0].key
       t.equal(type,'node')
       t.equal(value,'my value')
       cleanUp('http://neo4j:enter@localhost:7474',()=>{
           t.end()
       })

       })
    })
  })
})

