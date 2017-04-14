'use strict';

// convert text into a URL-friendly slug.
var convertToSlug = function(text) {
    return text
        .toLowerCase()
        .replace(/[^\w ]+/g, '')
        .replace(/ +/g, '-');
};
module.exports = convertToSlug;