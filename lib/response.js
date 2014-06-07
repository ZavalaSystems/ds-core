module.exports = (function (_, bilby) {
    "use strict";
    var stati = {
        "ok": 200,
        "created": 201,
        "accepted": 202,
        "noContent": 204,
        "multipleChoices": 300,
        "movedPermanently": 301,
        "found": 302,
        "seeOther": 303,
        "notModified": 304,
        "temporaryRedirect": 307,
        "permanentRedirect": 308,
        "badRequest": 400,
        "unauthorized": 401,
        "paymentRequirement": 402,
        "forbidden": 403,
        "notFound": 404,
        "methodNotAllowed": 405,
        "notAcceptable": 406,
        "requestTimeout": 408,
        "conflict": 409,
        "gone": 410,
        "lengthRequired": 411,
        "preconditionFailed": 412,
        "requestEntityTooLarge": 413,
        "requestUriTooLarge": 414,
        "unsupportedMediaType": 415,
        "imATeapot": 418,
        "enhanceYourCalm": 420,
        "unprocessableEntity": 422,
        "internalServerError": 500,
        "notImplemented": 501,
        "badGateway": 502,
        "serviceUnavailable": 503,
        "gatewayTimeout": 504
    };

    function statusBuilder(code) {
        return function (response) {
            return _.merge({}, response, {
                status: code
            });
        };
    }

    return {
        status: _.reduce(stati, function (acc, code, name) {
            acc[name] = statusBuilder(code);
            return acc;
        }, {}),
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
        }
    };
}(
    require("lodash"),
    require("bilby")
));