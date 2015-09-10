module.exports = function(grunt) {

  grunt.initConfig({
    browserify: {
      dist: {
          options: {
            debug: false
          },
          src: 'src/voice-commnand-dispatcher.js',
          dest: 'dist/voice-commnand-dispatcher.js'
        }
    }
  });

  grunt.loadNpmTasks('grunt-browserify');
  grunt.registerTask('default', ['browserify:dist']);

};