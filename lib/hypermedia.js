module.exports = (function (_, R, bilby, m) {
    "use strict";
    /*jslint unparam:true */
    var specDefault = {
            sanitize: {
                black: []
            },
            links: {
                base: bilby.constant(""),
                fields: [],
                self: false
            }
        },
        constLink = function (resolver, base, c, _) {
            var d = {};
            d[c] = resolver([base, c].join("/"));
            return bilby.some(d);
        },
        funcLink = function (resolver, base, pair, x) {
            return pair[1](base, x).map(function (url) {
                var d = {};
                d[pair[0]] = resolver(url);
                return d;
            });
        },
        dynLink = R.curry(function (resolver, base, y, x) {
            if (bilby.isString(y)) {
                return constLink(resolver, base, y, x);
            }
            if (bilby.isArray(y)) {
                return funcLink(resolver, base, y, x);
            }
            return bilby.none;
        }),
        hyperlink = null;
    /*jslint unparam:false */

    function mkSafeSpec(spec) {
        return _.merge({}, specDefault, spec);
    }

    function sanitize(obj, white, black) {
        return white ? R.pick(white, obj) : R.omit(black, obj);
    }

    hyperlink = bilby.curry(function (spec, resolver, transform, obj) {
        var input = bilby.isOption(obj) || bilby.isEither(obj) ? obj : m.toOption(obj);
        function mkEnvelop(v) {
            var fullSpec = mkSafeSpec(spec),
                baseURL = bilby.isFunction(fullSpec.links.base) ?
                                fullSpec.links.base(v) : fullSpec.links.base,
                selfLink = fullSpec.links.self ? {self: resolver(baseURL)} : {},
                dynLinkFs = R.map(dynLink(resolver, baseURL), fullSpec.links.fields),
                mkLinks = R.compose(R.foldl(_.merge, selfLink),
                            R.flatten,
                            R.map(m.optionToArray),
                            R.ap(dynLinkFs),
                            m.toArray);
            return {
                payload: sanitize(transform(v), fullSpec.sanitize.white, fullSpec.sanitize.black),
                links: mkLinks(v)
            };
        }
        return input.map(mkEnvelop);
    });

    return {
        hyperlink: hyperlink,
        multiHyperlink: bilby.curry(function (spec, resolver, transform, xs) {
            var run = R.compose(R.flatten,
                R.map(m.optionToArray),
                R.map(hyperlink(spec, resolver, transform)));
            return {
                payload: run(xs),
                links: {}
            };
        })
    };
}(
    require("lodash"),
    require("ramda"),
    require("bilby"),
    require("./monad")
));