/**
 * Created by rolly_000 on 12/9/2016.
 */
// Wallaby.js configuration

/*var wallabyWebpack = require('wallaby-webpack');
var wallabyPostprocessor = wallabyWebpack({
    // webpack options, such as
    // module: {
    //   loaders: [...]
    // },
    // externals: { jquery: "jQuery" }
  }
);*/

module.exports = function (wallaby) {
  return {
    // set `load: false` to all source files and tests processed by webpack
    // (except external files),
    // as they should not be loaded in browser,
    // their wrapped versions will be loaded instead
    files: [
      // {pattern: 'lib/jquery.js', instrument: false},
      {pattern: 'src/**/*.js', load: true},
      {pattern: 'lib/**/*.js', load: true}

    ],
    workers:{
      recycle:true
    },
    compilers: {
      '**/*.js': wallaby.compilers.babel()
    },
    tests: [
      {pattern: 'test/**/*test.js', load: true}
    ],
    env:{
      type:'node'
    },
    testFramework:'tape'
    /*postprocessor: wallabyPostprocessor,

    setup: function () {
      // required to trigger test loading
      window.__moduleBundler.loadTests();
    }*/
  };
};
