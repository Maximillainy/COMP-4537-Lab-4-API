const pattern = /^[a-zA-Z0-9]+$/;

exports.validateInput =
function (input) {
    return true;
    // return pattern.test(input) && input.length > 0;
};