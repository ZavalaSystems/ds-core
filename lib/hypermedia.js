module.exports = (function (_) {
    "use strict";

    var specDefault = {
        sanitize: {
            black: []
        },
        links: {
            base: _.constant(""),
            fields: [],
            self: false
        }
    };

    function getSafeSpec(spec) {
        return _.merge({}, specDefault, spec);
    }

    function makePayload(obj, white, black) {
        return white ? _.pick(obj, white) : _.omit(obj, black);
    }

    return {
        hyperlink: _.curry(function (spec, resolver, lens, obj) {
            var safeSpec = getSafeSpec(spec),
                base = _.isFunction(safeSpec.links.base) ? safeSpec.links.base(obj) : safeSpec.links.base,
                linkBase = safeSpec.links.self ? {self: resolver(base)} : {},
                links = _.transform(safeSpec.links.fields, function (acc, item) {
                    acc[item] = resolver([base, item].join("/"));
                }, linkBase);
            return {
                payload: makePayload(lens(obj), safeSpec.sanitize.white, safeSpec.sanitize.black),
                links: links
            };
        })
    };
}(
    require("lodash")
));