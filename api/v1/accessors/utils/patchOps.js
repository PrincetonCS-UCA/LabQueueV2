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
    if (!v.validate(patch, patchSchema).valid) {
        return false;
    }
    if (!associations[patch.op]) {
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