'use strict';

import GenericWorker from "./stream/GenericWorker";

import * as deflate from './flate';
export default {
    STORE: {
        magic: "\x00\x00",
        compressWorker : function (compressionOptions) {
            return new GenericWorker("STORE compression");
        },
        uncompressWorker : function () {
            return new GenericWorker("STORE decompression");
        }
    },
    DEFLATE: deflate,
};
