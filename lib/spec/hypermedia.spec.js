/*jslint maxlen: 120*/
/*global
    describe: true,
    it: true,
    expect: true,
    beforeEach: true,
    _: true
*/
(function (_, bilby, hypermedia) {
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
                        }, _.identity, _.identity);

                    expect(linker(myObj).getOrElse({})).toEqual({
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
                        }, _.identity, _.identity);

                    expect(linker(myObj).getOrElse({})).toEqual({
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
                        }, _.identity, _.identity);
                    expect(linker(myObj).getOrElse({})).toEqual({
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
                        }, _.identity, _.identity);
                    expect(linker(myObj).getOrElse({})).toEqual({
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
                        }, function (x) { return "http://google.com" + x; }, _.identity);
                    expect(linker(myObj).getOrElse({})).toEqual({
                        payload: {name: "Tudulu"},
                        links: {
                            self: "http://google.com/base",
                            ext: "http://google.com/base/ext"
                        }
                    });
                });
            });
            describe("when using functions as fields", function () {
                /*jslint unparam: true */
                it("should include fields that return a truthy value.", function () {
                    var linker = hypermedia.hyperlink({
                        sanitize: {
                            white: ["name"]
                        },
                        links: {
                            base: "/base",
                            fields: ["ext",
                                      ["aged", function (b, d) { return bilby.some("/" + d.age); }],
                                      ["baseaged", function (b, d) { return bilby.some([b, d.age].join("/")); }]]
                        }
                    }, _.identity, _.identity);
                    expect(linker(myObj).getOrElse({})).toEqual({
                        payload: {name: "Tudulu"},
                        links: {
                            ext: "/base/ext",
                            aged: "/10",
                            baseaged: "/base/10"
                        }
                    });
                });
                /*jslint unparam: false */
                it("should skip fields that return a falsey value.", function () {
                    var linker = hypermedia.hyperlink({
                        sanitize: {
                            white: ["name"]
                        },
                        links: {
                            base: "/base",
                            fields: ["ext", ["skip", _.constant(bilby.none)]]
                        }
                    }, _.identity, _.identity);
                    expect(linker(myObj).getOrElse({})).toEqual({
                        payload: {name: "Tudulu"},
                        links: {
                            ext: "/base/ext"
                        }
                    });
                });
            });

            describe("when using an input object lens", function () {
                it("should use the lensed value as the return", function () {
                    var linker = hypermedia.hyperlink({
                        sanitize: {
                            white: ["id"]
                        },
                        links: {
                            base: "/base",
                            fields: ["ext"]
                        }
                    }, _.identity, function (x) { return {id: x.id}; });
                    expect(linker(myObj).getOrElse({})).toEqual({
                        payload: {id: 5},
                        links: {
                            ext: "/base/ext"
                        }
                    });
                });
            });
        });
    });
}(
    require("lodash"),
    require("bilby"),
    require("../hypermedia")
));