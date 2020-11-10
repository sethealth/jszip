'use strict';

import * as utils from '../utils';
import Uint8ArrayReader from './Uint8ArrayReader';

/**
 * Create a reader adapted to the data.
 * @param {String|ArrayBuffer|Uint8Array|Buffer} data the data to read.
 * @return {DataReader} the data reader.
 */
export default function (data) {
    var type = utils.getTypeOf(data);
    utils.checkSupport(type);
    return new Uint8ArrayReader(utils.transformTo("uint8array", data));
};
