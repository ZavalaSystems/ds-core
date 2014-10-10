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
        var orderInput = {
            orderID: 9000,
            placedFor: 1000,
            orderStatus: "shipped",
            orderDate: "10/1/2015",
            lineItems: [{
                lineItemID: 9000,
                lineItemStatus: "shipped",
                priceCode: "Retail",
                price: 100.01,
                volume: 90.05
            }]
        };
        describe("lineItemPredicates", function () {
            it("should apply to produce an array of trues for valid input", function () {
                expect(R.ap(orders.lineItemPredicates, [{
                    lineItemID: 5,
                    lineItemStatus: "Goliath Online",
                    priceCode: "Retail",
                    volume: 10,
                    price: 100
                }])).toEqual([true, true, true, true, true, true, true, true]);
            });
        });
        describe("lineItemPrecondition", function () {
            it("should accept line items that are correct", function () {
                expect(orders.lineItemPrecondition({
                    lineItemID: 5,
                    lineItemStatus: "Goliath Online",
                    priceCode: "Retail",
                    volume: 10,
                    price: 100
                })).toEqual(true);
            });
            it("should reject line items that do not have an ID", function () {
                expect(orders.lineItemPrecondition({
                    lineItemStatus: "Shipped",
                    priceCode: "Retail",
                    volume: 10,
                    price: 100
                })).toEqual(false);
            });
        });
        describe("createOrderPrecondition", function () {
            it("should accept correct input", function () {
                expect(orders.createOrderPrecondition({
                    orderID: 1,
                    placedFor: 1,
                    orderStatus: "Cancelled",
                    orderDate: "10/1/2015",
                    lineItems: [{
                        lineItemID: 5,
                        lineItemStatus: "Shipped",
                        priceCode: "Retail",
                        volume: 10,
                        price: 100
                    }]
                })).toEqual(true);
            });
            it("should reject incorrect line items", function () {
                expect(orders.createOrderPrecondition({
                    orderID: 1,
                    placedFor: 1,
                    orderStatus: "Cancelled",
                    orderDate: "10/1/2015",
                    lineItems: [{
                        lineItemID: 5,
                        priceCode: "Retail",
                        volume: 10,
                        price: 100
                    }]
                })).toEqual(false);
            });
            it("should accept full details", function () {
                expect(orders.createOrderPrecondition(orderInput)).toEqual(true);
            });
        });
        describe("transformOrderInput", function () {
            it("should cope with inputs", function () {
                expect(orders.transformOrderInput(orderInput)).toEqual({
                    orderID: 9000,
                    placedFor: 1000,
                    orderStatus: "shipped",
                    orderDate: Date.parse("10/1/2015"),
                    lineItems: [{
                        lineItemID: 9000,
                        lineItemStatus: "shipped",
                        priceCode: "Retail",
                        price: 10001,
                        volume: 9005
                    }]
                });
            });
        });
        describe("mutableOrderFields", function () {
            it("should filter input to just the mutable order fields", function () {
                expect(orders.mutableOrderFields({id: 1, status: "gone", date: 1005}))
                    .toEqual({status: "gone", date: 1005});
            });
        });
    });
}(
    require("ramda"),
    require("../index")
));