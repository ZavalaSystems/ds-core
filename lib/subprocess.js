/*jslint nomen: true*/
module.exports = (function (cp, q, _) {
    "use strict";
    function run() {
        var args = _.toArray(arguments),
            command = _.head(args),
            argv = _.initial(_.tail(args)),
            stdin = _.last(_.tail(args)),
            proc = cp.spawn(command, argv, {
                stdio: ["pipe", "pipe", "pipe"]
            }),
            defer = q.defer(),
            out = [],
            err = [];

        proc.stdout.setEncoding("utf-8");
        proc.stderr.setEncoding("utf-8");

        proc.stdout.on("data", function (data) {
            out.push(data);
        });

        proc.stderr.on("data", function (data) {
            err.push(data);
        });

        proc.on("close", function (code) {
            var notOk = code,
                ret = {
                    status: code,
                    stdout: out.join(""),
                    stderr: err.join("")
                };
            if (notOk) {
                defer.reject(ret);
            } else {
                defer.resolve(ret);
            }
        });

        if (stdin) {
            proc.stdin.write(stdin);
            proc.stdin.end();
        }

        return defer.promise;
    }

    function makeAcceptor(f) {
        return function () {
            var args = _.toArray(arguments);

            return function (incoming) {
                return run.apply(null, args.concat(f(incoming)));
            };
        };
    }

    return {
        run: run,
        pipe: makeAcceptor(function (x) { return x.stdout; }),
        into: makeAcceptor(_.identity)
    };
}(
    require("child_process"),
    require("q"),
    require("lodash")
));