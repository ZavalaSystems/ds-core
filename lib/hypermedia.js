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
                d[pair[0]] = url;
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
        });
    /*jslint unparam:false */

    function mkSafeSpec(spec) {
        return _.merge({}, specDefault, spec);
    }

    function sanitize(obj, white, black) {
        return white ? R.pick(white, obj) : R.omit(black, obj);
    }

    return {
        hyperlink: bilby.curry(function (spec, resolver, transform, obj) {
            var input = bilby.isOption(obj) ? obj : m.toOption(obj);
            function mkEnvelop(x) {
                var fullSpec = mkSafeSpec(spec),
                    baseURL = bilby.isFunction(fullSpec.links.base) ?
                                    fullSpec.links.base(transform(x)) : fullSpec.links.base,
                    selfLink = fullSpec.links.self ? {self: resolver(baseURL)} : {},
                    dynLinkFs = R.map(dynLink(resolver, baseURL), fullSpec.links.fields),
                    mkLinks = R.compose(R.foldl(_.merge, selfLink),
                                R.flatten,
                                R.map(m.optionToArray),
                                R.ap(dynLinkFs),
                                m.toArray);
                return {
                    payload: sanitize(transform(x), fullSpec.sanitize.white, fullSpec.sanitize.black),
                    links: mkLinks(x)
                };
            }
            return input.map(mkEnvelop);
        }),
        link: function (x) { return {payload: x, links: {}}; }
    };
}(
    require("lodash"),
    require("ramda"),
    require("bilby"),
    require("./monad")
));