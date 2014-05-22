module.exports = function (grunt) {
    "use strict";
    grunt.initConfig({
        jslint: {
            dist: {
                options: {
                    errorsOnly: true
                },
                directives: {
                    node: true,
                    nomen: true
                },
                src: [
                    "*.js",
                    "lib/**/*.js",
                    "spec/**/*.js"
                ]
            }
        },
        jasmine_node: {
            options: {

            },
            all: ["spec/"]
        }
    });

    grunt.loadNpmTasks("grunt-jslint");
    grunt.loadNpmTasks("grunt-jasmine-node");

    grunt.registerTask("default", ["jslint", "jasmine_node"]);
};