function convertToArray(input) {
    if (!input) {
        return [];
    }
    if (Array.isArray(input)) {
        return input;
    }
    return [input];
}

module.exports = convertToArray;