module.exports = function(grunt) {
      grunt.initConfig({
        responsive_images: {
          dev: {
            options: {
              // engine: 'im',
              sizes: [{
                width: 270,
                suffix: 'min1x',
                quality: 30
              },
              {
                width: 540,
                suffix: 'min2x',
                quality: 50
              },
              {
                width: 800,
                suffix: '',
                quality: 100
              }]
            },
            files: [{
              expand: true,
              src: ['*.{gif,jpg,png}'],
              cwd: 'img/',
              dest: 'img-resized/'
            }]
          }
        },

        clean: {
          dev: {
            src: ['img-resized'],
          },
        },

        mkdir: {
          dev: {
            options: {
              create: ['img-resized'] 
            },
          },
        },
    
      });
    
      grunt.loadNpmTasks('grunt-responsive-images');
      grunt.loadNpmTasks('grunt-resize-crop');
      grunt.loadNpmTasks('grunt-contrib-clean');
      grunt.loadNpmTasks('grunt-contrib-copy');
      grunt.loadNpmTasks('grunt-mkdir');
      grunt.registerTask('default', ['clean', 'mkdir', 'responsive_images']);
    };
    