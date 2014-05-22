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
            coverage: {},
            all: ["spec/"]
        },
        watch: {
            scripts: {
                files: [
                    "main.js",
                    "consultant.js",
                    "lib/**/*.js",
                    "spec/**/*.js"
                ],
                tasks: ["default"]
            }
        }
    });

    grunt.loadNpmTasks("grunt-jslint");
    grunt.loadNpmTasks("grunt-jasmine-node");
    grunt.loadNpmTasks("grunt-jasmine-node-coverage");
    grunt.loadNpmTasks("grunt-contrib-watch");

    grunt.registerTask("default", ["jslint", "jasmine_node"]);
};