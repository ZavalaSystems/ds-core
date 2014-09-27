module.exports = (function (lodash, bilby, R, hypermedia, common, lens, db) {
    "use strict";
    var orderSpec = {
            links: {
                base: lodash.template("/distributor/${d.data.id}/order/${o.data.id}"),
                fields: ["status", "item"],
                self: true
            }
        },
        isDefined = R.compose(common.negate, common.isNullOrUndefined),
        lineItemPredicates = [
            R.compose(isDefined, R.prop("lineItemID")),
            R.compose(common.isNumberLike, R.prop("lineItemID")),
            R.compose(isDefined, R.prop("priceCode")),
            R.compose(isDefined, R.prop("price")),
            R.compose(common.isNumberLike, R.prop("price")),
            R.compose(isDefined, R.prop("volume")),
            R.compose(common.isNumberLike, R.prop("volume")),
            R.compose(isDefined, R.prop("lineItemStatus"))
        ],
        lineItemPrecondition = R.allPredicates(lineItemPredicates),
        createOrderPredicates = [
            R.compose(isDefined, R.prop("orderID")),
            R.compose(common.isNumberLike, R.prop("orderID")),
            R.compose(isDefined, R.prop("orderStatus")),
            R.compose(isDefined, R.prop("orderDate")),
            R.compose(common.isDateParseable, R.prop("orderDate")),
            R.compose(bilby.isArray, R.prop("lineItems")),
            R.compose(R.reduce(bilby.and, true), R.map(lineItemPrecondition), R.prop("lineItems"))
        ],
        createOrderPrecondition = R.allPredicates(createOrderPredicates),
        transformLineItemInput = R.compose(
            lens.transformToInt(["lineItemID"]),
            lens.transformToCents(["price"]),
            lens.transformToCents(["volume"])
        ),
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
        transformLookupOrderListInput = lens.transformToInt(["distributorID"]),
        transformLookupOrderInput = R.compose(transformLookupOrderListInput,
            lens.transformToInt(["orderID"])),
        transformDistributorID = lens.transformToInt(["distributorID"]),
        transformOrderInput = R.compose(
            transformDistributorID,
            lens.transformToInt(["orderID"]),
            lens.transformStrToEpochOffset(["orderDate"]),
            lens.transform(R.map(transformLineItemInput), ["lineItems"])
        ),
        transformOrderOutput = R.compose(
            lens.transformEpochOffsetToStr(["date"])
        ),
        transformLineItemOutput = R.compose(
            lens.transformToCurrency(["price"]),
            lens.transformToCurrency(["volume"])
        ),
        transformLookupLineItemInput = R.compose(
            transformLookupOrderInput,
            lens.transformToInt(["lineItemID"])
        );

    return bilby.environment()
        .property("orderLinker", hypermedia.hyperlink(orderSpec))
        .property("orderMultiLinker", hypermedia.multiHyperlink(orderSpec))
        .property("lineItemPredicates", lineItemPredicates)
        .property("lineItemPrecondition", lineItemPrecondition)
        .property("lookupOrderListPrecondition", lookupOrderListPrecondition)
        .property("lookupOrderPrecondition", lookupOrderPrecondition)
        .property("createOrderPrecondition", createOrderPrecondition)
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