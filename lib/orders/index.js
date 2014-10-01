module.exports = (function (lodash, bilby, R, hypermedia, common, lens, db) {
    "use strict";
    var orderSpec = {
            links: {
                base: lodash.template("/distributor/${d.data.id}/order/${o.data.id}"),
                fields: ["status", "item"],
                self: true
            }
        },
        lineItemSpec = {
            links: {
                base: lodash.template("/distributor/${d.data.id}/order/${o.data.id}/item/${li.data.id}"),
                /* TASK We probably need to include the distributor and the order as links */
                fields: ["status"],
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
        );

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
        .property("transformLineItem", transformLineItemInput)
        .property("transformOrderInput", transformOrderInput)
        .property("transformOrderOutput", transformOrderOutput)
        .property("transformLookupOrderListInput", transformLookupOrderListInput)
        .property("transformLookupOrderInput", transformLookupOrderInput)
        .property("transformLookupLineItemInput", transformLookupLineItemInput)
        .property("transformLineItemOutput", transformLineItemOutput)
        .envAppend(db);
}(
    require("lodash"),
    require("bilby"),
    require("ramda"),
    require("../hypermedia"),
    require("../common"),
    require("../lens"),
    require("./db")
));