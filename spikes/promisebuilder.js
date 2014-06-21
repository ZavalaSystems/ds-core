module.exports = (function (bilby, q, _) {
    "use strict";
    function oneArg() {
        return arguments.length === 1;
    }

    function funcarr() {
        var args = _.toArray(arguments);
        return args.length === 2 &&
            _.isFunction(args[0]) &&
            _.isArray(args[1]);
    }

    function funcobj() {
        var args = _.toArray(arguments);
        return args.length === 2 &&
            _.isFunction(args[0]) &&
            _.isObject(args[1]);
    }

    function funcfuncfunc() {
        var args = _.toArray(arguments);
        return args.length === 3 &&
            _.all(args, _.isFunction);
    }

    function funcarrfunc() {
        var args = _.toArray(arguments);
        return args.length === 3 &&
            _.isFunction(args[0]) &&
            _.isArray(args[1]) &&
            _.isFunction(args[2]);
    }

    function funcarrfuncfunc() {
        var args = _.toArray(arguments);
        return args.length === 4 &&
            _.isFunction(args[0]) &&
            _.isArray(args[1]) &&
            _.isFunction(args[2]) &&
            _.isFunction(args[3]);
    }

    function funcarrarrfunc() {
        var args = _.toArray(arguments);
        return args.length === 4 &&
            _.isFunction(args[0]) &&
            _.isArray(args[1]) &&
            _.isArray(args[2]) &&
            _.isFunction(args[3]);
    }

    var local = bilby.environment()
        .property("defaultParams", {
            fargs: [],
            fail: [],
            succ: _.identity
        })
        //one arg is assumed to be a simple async function with a single return value
        .method("asPromise", oneArg, function (f) {
            return local.asPromise(f, {});
        })
        //two arg is assumed to be an async function with args, with a single return value
        .method("asPromise", funcarr, function (f, fargs) {
            return local.asPromsie(f, {fargs: fargs});
        })
        .method("asPromise", funcobj, function (f, params) {
            var df = q.defer(),
                opts = _.merge({}, local.defaultParams, params);
            function cb() {
                var args = _.toArray(arguments);
                _.each(opts.fail, function (rej) {
                    var msg = rej.apply(null, args);
                    if (msg) {
                        df.reject(msg);
                        return;
                    }
                });
                df.resolve(opts.succ.apply(undefined, args));
            }
            f.apply(null, opts.fargs.concat(cb));
            return df.promise;
        })
        .method("asPromise", funcfuncfunc, function (f, fail, succ) {
            return local.asPromise(f, {fail: [fail], succ: succ});
        })
        .method("asPromise", funcarrfunc, function (f, fargs, succ) {
            return local.asPromise(f, {fargs: fargs, succ: succ});
        })
        .method("asPromise", funcarrfuncfunc, function (f, fargs, fail, succ) {
            return local.asPromise(f, {fargs: fargs, fail: [fail], succ: succ});
        })
        .method("asPromise", funcarrarrfunc, function (f, fargs, fail, succ) {
            return local.asPromise(f, {fargs: fargs, fail: fail, succ: succ});
        });

    return local;
}(
    require("bilby"),
    require("q"),
    require("lodash")
));