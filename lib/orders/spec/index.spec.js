/*jslint maxlen: 120*/
/*global
    describe: true,
    it: true,
    expect: true,
    beforeEach: true,
    _: true
*/
(function (R, orders) {
    "use strict";
    describe("orders", function () {
        describe("lineItemPredicates", function () {
            it("should produce all true on correct input", function () {
                expect(R.ap(orders.lineItemPredicates, [{
                    lineItemID: "5",
                    lineItemStatus: "Goliath Online",
                    priceCode: "Retail",
                    volume: "10",
                    price: "100"
                }])).toEqual([true, true, true, true, true]);
            });
        });
        describe("lineItemPrecondition", function () {
            it("should accept line items that are correct", function () {
                expect(orders.lineItemPrecondition({
                    lineItemID: "5",
                    lineItemStatus: "Goliath Online",
                    priceCode: "Retail",
                    volume: "10",
                    price: "100"
                })).toEqual(true);
            });
            it("should reject line items that do not have an ID", function () {
                expect(orders.lineItemPrecondition({
                    lineItemStatus: "Shipped",
                    priceCode: "Retail",
                    volume: "10",
                    price: "100"
                })).toEqual(false);
            });
        });
        describe("createOrderPrecondition", function () {
            it("should accept correct input", function () {
                expect(orders.createOrderPrecondition({
                    orderID: 1,
                    orderStatus: "Cancelled",
                    orderDate: "10/1/2015",
                    lineItems: [{
                        lineItemID: "5",
                        lineItemStatus: "Shipped",
                        priceCode: "Retail",
                        volume: "10",
                        price: "100"
                    }]
                })).toEqual(true);
            });
            it("should reject incorrect line items", function () {
                expect(orders.createOrderPrecondition({
                    orderID: 1,
                    orderStatus: "Cancelled",
                    orderDate: "10/1/2015",
                    lineItems: [{
                        lineItemID: "5",
                        priceCode: "Retail",
                        volume: "10",
                        price: "100"
                    }]
                })).toEqual(false);
            });
        });
    });
}(
    require("ramda"),
    require("../index")
));