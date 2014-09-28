module.exports = (function (_, bilby, R, toggle) {
    "use strict";
    var stati = {
            ok: 200,
            created: 201,
            accepted: 202,
            noContent: 204,
            multipleChoices: 300,
            movedPermanently: 301,
            found: 302,
            seeOther: 303,
            notModified: 304,
            temporaryRedirect: 307,
            permanentRedirect: 308,
            badRequest: 400,
            unauthorized: 401,
            paymentRequirement: 402,
            forbidden: 403,
            notFound: 404,
            methodNotAllowed: 405,
            notAcceptable: 406,
            requestTimeout: 408,
            conflict: 409,
            gone: 410,
            lengthRequired: 411,
            preconditionFailed: 412,
            requestEntityTooLarge: 413,
            requestUriTooLarge: 414,
            unsupportedMediaType: 415,
            imATeapot: 418,
            enhanceYourCalm: 420,
            unprocessableEntity: 422,
            internalServerError: 500,
            notImplemented: 501,
            badGateway: 502,
            serviceUnavailable: 503,
            gatewayTimeout: 504
        },
        statusBuilder = function (code) {
            return function (response) {
                return _.merge({}, response, {
                    status: code
                });
            };
        },
        status = _.reduce(stati, function (acc, code, name) {
            acc[name] = statusBuilder(code);
            return acc;
        }, {});

    return {
        status: status,
        header: {
            contentType: bilby.curry(function (type, response) {
                return _.merge({}, response, {
                    headers: {"Content-Type": type}
                });
            })
        },
        respond: function (input) {
            var funcs = _.rest(arguments).reverse(),
                responder = _.compose.apply(null, funcs);

            return responder({content: JSON.stringify(input)});
        },
        catcher: R.curry(function (req, err) {
            if (toggle.getToggleOff(req, "debug.fullerrors")) {
                var debugInfo = err.message + "\n" + err.stack;
                return status.internalServerError({content: debugInfo});
            }
            /* Figure out how to log this somewhere */
            return status.internalServerError({});
        })
    };
}(
    require("lodash"),
    require("bilby"),
    require("ramda"),
    require("./toggle")
));