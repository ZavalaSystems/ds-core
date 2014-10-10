module.exports = (function (lodash, bilby, R, q, hypermedia, common, lens, monad, db) {
    "use strict";
    var ordersBaseTemplate = lodash.template("/distributor/${d.data.id}/order/${o.data.id}"),
        lineItemBaseTemplate = lodash.template("/distributor/${d.data.id}/order/${o.data.id}/item/${li.data.id}"),
        orderSpec = {
            links: {
                base: ordersBaseTemplate,
                fields: [
                    "item",
                    // The first param is the base, which update should post to
                    ["update", R.compose(bilby.some, R.identity)]
                ],
                self: true
            }
        },
        lineItemSpec = {
            links: {
                base: lineItemBaseTemplate,
                /* TASK We probably need to include the distributor and the order as links */
                fields: [
                    ["update", R.compose(bilby.some, R.identity)]
                ],
                self: true
            }
        },
        lineItemPredicates = [
            R.compose(common.isDefined, R.prop("lineItemID")),
            R.compose(common.isNumberLike, R.prop("lineItemID")),
            R.compose(common.isDefined, R.prop("priceCode")),
            R.compose(common.isDefined, R.prop("price")),
            R.compose(common.isNumberLike, R.prop("price")),
            R.compose(common.isDefined, R.prop("volume")),
            R.compose(common.isNumberLike, R.prop("volume")),
            R.compose(common.isDefined, R.prop("lineItemStatus"))
        ],
        lineItemPrecondition = R.allPredicates(lineItemPredicates),
        createOrderPredicates = [
            R.compose(common.isDefined, R.prop("orderID")),
            R.compose(common.isNumberLike, R.prop("orderID")),
            R.compose(common.isDefined, R.prop("placedFor")),
            R.compose(common.isNumberLike, R.prop("placedFor")),
            R.compose(common.isDefined, R.prop("orderStatus")),
            R.compose(common.isDefined, R.prop("orderDate")),
            R.compose(common.isDateParseable, R.prop("orderDate")),
            R.compose(bilby.isArray, R.prop("lineItems")),
            R.compose(R.reduce(bilby.and, true), R.map(lineItemPrecondition), R.prop("lineItems"))
        ],
        createOrderPrecondition = R.allPredicates(createOrderPredicates),
        /* TASK These should probably be shared with distributor */
        lookupOrderListPredicates = [
            R.compose(common.isDefined, R.prop("distributorID")),
            R.compose(common.isNumberLike, R.prop("distributorID"))
        ],
        lookupOrderListPrecondition = R.allPredicates(lookupOrderListPredicates),
        lookupOrderPredicates = R.concat(lookupOrderListPredicates, [
            R.compose(common.isDefined, R.prop("orderID")),
            R.compose(common.isNumberLike, R.prop("orderID"))
        ]),
        lookupOrderPrecondition = R.allPredicates(lookupOrderPredicates),
        setOrderStatusPredicates = R.concat(lookupOrderPredicates, [
            R.compose(common.isDefined, R.prop("status"))
        ]),
        setOrderStatusPrecondition = R.allPredicates(setOrderStatusPredicates),
        lookupLineItemPredicates = R.concat(lookupOrderPredicates, [
            R.compose(common.isDefined, R.prop("lineItemID")),
            R.compose(common.isNumberLike, R.prop("lineItemID"))
        ]),
        lookupLineItemPrecondition = R.allPredicates(lookupLineItemPredicates),
        setLineItemStatusPredicates = R.concat(lookupLineItemPredicates, [
            R.compose(common.isDefined, R.prop("status"))
        ]),
        setLineItemStatusPrecondition = R.allPredicates(setLineItemStatusPredicates),
        transformOrderOutput = R.compose(
            lens.transformEpochOffsetToStr(["date"])
        ),
        transformLineItemOutput = R.compose(
            lens.transformToCurrency(["price"]),
            lens.transformToCurrency(["volume"])
        ),
        transformLineItemInput = R.compose(
            lens.transformToInt(["lineItemID"]),
            lens.transformToCents(["price"]),
            lens.transformToCents(["volume"])
        ),
        transformLookupOrderListInput = lens.transformToInt(["distributorID"]),
        transformLookupOrderInput = R.compose(transformLookupOrderListInput,
            lens.transformToInt(["orderID"])),
        transformDistributorID = lens.transformToInt(["distributorID"]),
        transformOrderInput = R.compose(
            transformDistributorID,
            lens.transformToInt(["orderID"]),
            lens.transformToInt(["placedFor"]),
            lens.transformStrToEpochOffset(["orderDate"]),
            lens.transform(R.map(transformLineItemInput), ["lineItems"])
        ),
        transformLookupLineItemInput = R.compose(
            transformLookupOrderInput,
            lens.transformToInt(["lineItemID"])
        ),
        pickOrderData = R.pick(["orderID", "placedFor", "orderStatus", "orderDate", "distributorID"]),
        createOrderAndItems = function createOrderAndItems(input) {
            var orderData = pickOrderData(input);
            return db.createOrder(orderData)
                .then(function (orderResult) {
                    if (orderResult.length > 0) {
                        var lineItemParams = R.map(common.merge({orderID: input.orderID}), input.lineItems);
                        return q.all(R.map(db.createLineItem, lineItemParams))
                            .then(R.always(q.when(monad.first(orderResult))));
                    }
                    return bilby.none;
                });
        },

        mutableOrderFields = R.pick(["status", "date", "placedFor"]),
        // Update order and line item could probably be merged mutableFields and queries as params
        // but I think it would hurt readability
        updateOrderData = function updateOrderData(input) {
            var mutation = mutableOrderFields(input);
            return db.matchOrderForDistributor(input)
                .then(monad.first)
                .then(monad.map(db.order))
                // mixin is right biased, so add the mutation there
                .then(monad.map(R.rPartial(R.mixin, mutation)))
                .then(function (mutOpt) {
                    if (mutOpt.isSome) {
                        return db.updateOrder(R.mixin(input, {map: mutOpt.getOrElse({})}))
                            .then(monad.first);
                    }
                    return q.when(bilby.none);
                });
        },
        mutableLineItemFields = R.pick(["price", "priceCode", "volume", "status"]),
        updateLineItemData = function updateLineItemData(input) {
            var mutation = mutableLineItemFields(input);
            return db.matchLineItemForDistributor(input)
                .then(monad.first)
                .then(monad.map(db.lineItem))
                // mixin is right biased, so add mutation here
                .then(monad.map(R.rPartial(R.mixin, mutation)))
                .then(function (mutOpt) {
                    if (mutOpt.isSome) {
                        return db.updateLineItem(R.mixin(input, {map: mutOpt.getOrElse({})}))
                            .then(monad.first);
                    }
                    return q.when(bilby.none);
                });
        };

    return bilby.environment()
        .property("orderLinker", hypermedia.hyperlink(orderSpec))
        .property("orderMultiLinker", hypermedia.multiHyperlink(orderSpec))
        .property("lineItemLinker", hypermedia.hyperlink(lineItemSpec))
        .property("lineItemMultiLinker", hypermedia.multiHyperlink(lineItemSpec))
        .property("lineItemPredicates", lineItemPredicates)
        .property("lineItemPrecondition", lineItemPrecondition)
        .property("lookupOrderListPrecondition", lookupOrderListPrecondition)
        .property("lookupOrderPrecondition", lookupOrderPrecondition)
        .property("lookupLineItemPrecondition", lookupLineItemPrecondition)
        .property("createOrderPrecondition", createOrderPrecondition)
        .property("setOrderStatusPrecondition", setOrderStatusPrecondition)
        .property("setLineItemStatusPrecondition", setLineItemStatusPrecondition)
        .property("transformLineItemInput", transformLineItemInput)
        .property("transformOrderInput", transformOrderInput)
        .property("transformOrderOutput", transformOrderOutput)
        .property("transformLookupOrderListInput", transformLookupOrderListInput)
        .property("transformLookupOrderInput", transformLookupOrderInput)
        .property("transformLookupLineItemInput", transformLookupLineItemInput)
        .property("transformLineItemOutput", transformLineItemOutput)
        .property("createOrderAndItems", createOrderAndItems)
        .property("mutableOrderFields", mutableOrderFields)
        .property("updateOrderData", updateOrderData)
        .property("mutableLineItemFields", mutableLineItemFields)
        .property("updateLineItemData", updateLineItemData)
        .envAppend(db);
}(
    require("lodash"),
    require("bilby"),
    require("ramda"),
    require("q"),
    require("../hypermedia"),
    require("../common"),
    require("../lens"),
    require("../monad"),
    require("./db")
));