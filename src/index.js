
import makeDebug from 'debug';
import isString from 'lodash/isString'
const neo4j=require("neo4j")
const debug = makeDebug('feathers-neo4j-driver');
const promisify=require("es6-promisify")
import isArray from "lodash/isArray"

class Service{
  constructor(options){
    if(!isString(options && options.uri))
      throw new Error('neo4J requires URI path')

    if(!isString(options && options.user))
      throw new Error('neo4J requires auth user')

    if(!isString(options && options.pass))
      throw new Error('neo4J requires auth pass!')
    this.db=new neo4j.GraphDatabase({url:options.uri,auth:{username:options.user,password:options.pass}})

    //this.driver=neo4j.driver(options.uri,neo4j.auth.basic(options.user,options.pass))
  }
  _executeQuery(params,cypher){
    const query=(isArray(params))?{queries:params}:params
    return cypher(query).then((res)=>{
      return res
    }).catch((err)=>{
      //console.log(err)
      throw err
    })
  }

  create(params){
    const cypher=promisify(this.db.cypher,this.db)
    return this._executeQuery(params,cypher)
  }

  queryTransaction(params){
    this._tranx=this._tranx || this.db.beginTransaction()
    const cypher=promisify(this._tranx.cypher,this._tranx)
    return this._executeQuery(params,cypher)
  }

  commitTransaction(){
    const commit=promisify(this._tranx.commit,this._tranx)
    return commit().then(()=>{
      this._tranx=undefined
    })
  }
  rollbackTransaction(){
    const rollback=promisify(this._tranx.rollback,this._tranx)
    return rollback().then(()=>{
      this._tranx=undefined
    })
  }

}
export default function init(options) {
  debug('Initializing feathers-neo4j-driver plugin');
  return new Service(options)
}
init.Service=Service;
