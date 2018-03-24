module.exports = function(grunt) {
      grunt.initConfig({
        responsive_images: {
          dev: {
            options: {
              // engine: 'im',
              sizes: [{
                width: 400,
                suffix: '-400q30',
                quality: 30
              },
              {
                width: 200,
                suffix: '-200q30',
                quality: 30
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
    
        // resize_crop: {
        //   image_group: {
    
        //     options: {
        //       format: "jpg",
        //       gravity: "center",
        //       height: 200,
        //       width: 200
        //     },
    
        //     files: {'img/1.jpg': ['imgSrc/1.jpg']}
        //   },
        // },
    
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
    