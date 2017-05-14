const _ = require('lodash');

const Validator = require('jsonschema').Validator;
const associations = require('../../../../enums/associations');
const makeError = require('make-error');

var v = new Validator();

var InvalidPatchError = makeError('InvalidPatchError');

var patchSchema = {
    type: 'object',
    properties: {
        'op': {
            type: 'string'
        },
        "values": {
            type: 'array',
            items: {
                type: 'string'
            }
        }
    },
    required: ['op', 'values']
}

function validatePatch(patch) {
    console.log(patch);
    if (!v.validate(patch, patchSchema).valid) {
        console.log("Invalid");
        return false;
    }
    if (!associations[patch.op]) {
        console.log("No association");
        return false;
    }
    return true;
}

function createPatchFromArray(array, op) {
    op = op || 'set';
    return {
        op: op,
        values: array
    };
}

module.exports = {
    InvalidPatchError: InvalidPatchError,

    validatePatch: validatePatch,
    createPatchFromArray: createPatchFromArray
}