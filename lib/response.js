module.exports = (function (_, bilby) {
    "use strict";
    return {
        status: {
            multipleChoices: function (response) {
                return _.merge({}, response, {
                    status: 300
                });
            },
            ok: function (response) {
                return _.merge({}, response, {
                    status: 200
                });
            }
        },
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