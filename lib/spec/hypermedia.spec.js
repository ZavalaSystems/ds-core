/*jslint maxlen: 120*/
/*global
    describe: true,
    it: true,
    expect: true,
    beforeEach: true,
    _: true
*/
(function (_, hypermedia) {
    "use strict";
    describe("hypermedia library", function () {
        describe("hyperlink", function () {
            var myObj = {
                    id: 5,
                    name: "Tudulu",
                    age: 10,
                    username: "tmux",
                    password: "linux"
                };
            describe("when using a whitelist", function () {
                it("should take a whitelist spec and provide a function for objects of that spec.", function () {
                    var linker = hypermedia.hyperlink({
                            sanitize: {
                                white: ["name", "age"]
                            },
                            links: {
                                base: _.template("/object/${id}"),
                                fields: ["yours", "mine", "ours"],
                                self: false
                            }
                        }, _.identity);

                    expect(linker(myObj)).toEqual({
                        payload: {
                            name: "Tudulu",
                            age: 10
                        },
                        links: {
                            yours: "/object/5/yours",
                            mine: "/object/5/mine",
                            ours: "/object/5/ours"
                        }
                    });
                });
            });

            describe("when using a blacklist", function () {
                it("should take a blacklist spec and provide a function for objects of that spec.", function () {
                    var linker = hypermedia.hyperlink({
                            sanitize: {
                                black: ["id", "password"]
                            },
                            links: {
                                base: _.template("/object/${id}"),
                                fields: ["yours"],
                                self: false
                            }
                        }, _.identity);

                    expect(linker(myObj)).toEqual({
                        payload: {
                            name: "Tudulu",
                            age: 10,
                            username: "tmux"
                        },
                        links: {
                            yours: "/object/5/yours"
                        }
                    });
                });
            });

            describe("when using a self link", function () {
                it("should take a spec with self set and provide a linker.", function () {
                    var linker = hypermedia.hyperlink({
                            links: {
                                base: _.template("/object/${id}"),
                                fields: [],
                                self: true
                            }
                        }, _.identity);
                    expect(linker(myObj)).toEqual({
                        payload: myObj,
                        links: {
                            self: "/object/5"
                        }
                    });
                });
            });

            describe("when using a string as a base", function () {
                it("should use the string instead of a function to make the linker.", function () {
                    var linker = hypermedia.hyperlink({
                            sanitize: {
                                white: ["name"]
                            },
                            links: {
                                base: "/base",
                                fields: ["ext"],
                                self: true
                            }
                        }, _.identity);
                    expect(linker(myObj)).toEqual({
                        payload: {name: "Tudulu"},
                        links: {
                            self: "/base",
                            ext: "/base/ext"
                        }
                    });
                });
            });

            describe("when using a custom resolver", function () {
                it("should use the resolver to make the linker.", function () {
                    var linker = hypermedia.hyperlink({
                            sanitize: {
                                white: ["name"]
                            },
                            links: {
                                base: "/base",
                                fields: ["ext"],
                                self: true
                            }
                        }, function (x) { return "http://google.com" + x; });
                    expect(linker(myObj)).toEqual({
                        payload: {name: "Tudulu"},
                        links: {
                            self: "http://google.com/base",
                            ext: "http://google.com/base/ext"
                        }
                    });
                });
            });
        });
    });
}(
    require("lodash"),
    require("../hypermedia")
));