module.exports = (function (bilby, fortuna) {
    "use strict";
    function commRecord(fortunaRecord) {
        return {
            personal: fortuna.personalDetails(fortunaRecord),
            team: fortuna.teamDetails(fortunaRecord),
            sales: fortuna.salesDetails(fortunaRecord),
            gen1: fortuna.gen1Details(fortunaRecord),
            gen2: fortuna.gen2Details(fortunaRecord),
            gen3: fortuna.gen3Details(fortunaRecord),
            rank: fortuna.paidAs(fortunaRecord)
        };
    }

    return bilby.environment()
        .property("commRecord", commRecord);
}(
    require("bilby"),
    require("../fortuna")
));