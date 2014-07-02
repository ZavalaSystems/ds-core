(function () {
    "use strict";
    var rand = {
        int: function (floor, ceil) {
            return Math.floor(rand.real(floor, ceil));
        },
        real: function (floor, ceil) {
            var range = ceil - floor;
            return Math.random() * range + floor;
        }
    };

    function currencyToDollar(x) { return "$" + (x / 100).toFixed(2); }

    function mockSalesData() {
        var retail = rand.int(0, 50000),
            discount = rand.int(0, 50000),
            gift = rand.int(0, 50000),
            pcv = Math.floor(retail + 0.9 * discount + 0.5 * gift),
            bv = Math.floor(0.8 * (retail + discount) + 0.5 * gift);
        return {
            retail: currencyToDollar(retail),
            discount: currencyToDollar(discount),
            gift: currencyToDollar(gift),
            pcv: currencyToDollar(pcv),
            bv: currencyToDollar(bv)
        };
    }

    console.log(JSON.stringify(mockSalesData(), null, "  "));
}());