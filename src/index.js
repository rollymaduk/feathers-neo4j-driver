
import makeDebug from 'debug';

const debug = makeDebug('feathers-neo4j-driver');

export default function() {
  return function() {
    debug('Initializing feathers-neo4j-driver plugin');
  };
}
