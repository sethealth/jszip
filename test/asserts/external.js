/* global QUnit,JSZip,JSZipTestUtils,Promise */
'use strict';

QUnit.module("external");

/**
 * Creates a wrapper around an existing Promise implementation to count
 * calls and detect custom implementations.
 * @param {Promise} OriginalPromise the promise to wrap
 * @return {Promise} the wrapped promise
 */
function createPromiseProxy(OriginalPromise) {
    function MyShinyPromise (input) {
        if (input.then) { // thenable, we wrap it
            this._promise = input;
        } else { // executor
            this._promise = new OriginalPromise(input);
        }
        MyShinyPromise.calls++;
    }
    MyShinyPromise.calls = 0;
    MyShinyPromise.prototype = {
        then: function (onFulfilled, onRejected) {
            return new MyShinyPromise(this._promise.then(onFulfilled, onRejected));
        },
        "catch": function (onRejected) {
            return new MyShinyPromise(this._promise['catch'](onRejected));
        },
        isACustomImplementation: true
    };

    MyShinyPromise.resolve = function (value) {
        return new MyShinyPromise(OriginalPromise.resolve(value));
    };
    MyShinyPromise.reject = function (value) {
        return new MyShinyPromise(OriginalPromise.reject(value));
    };
    MyShinyPromise.all = function (value) {
        return new MyShinyPromise(OriginalPromise.all(value));
    };
    return MyShinyPromise;
}

QUnit.test("Promise", function (assert) {
    assert.ok(Promise, "Promise is defined");
    assert.ok(Promise.resolve, "Promise looks like a Promise");
    assert.ok(Promise.reject, "Promise looks like a Promise");
});

QUnit.test("load JSZip doesn't override the global Promise", function (assert) {
    if (typeof Promise !== "undefined"){
        assert.equal(Promise, JSZipTestUtils.oldPromise, "the previous Promise didn't change");
        assert.equal(Promise, Promise, "Promise reused the global Promise");
    } else {
        assert.ok(Promise, "Promise is defined even if the global Promise doesn't exist");
    }
});

QUnit.test("Promise can be replaced in .async()", function (assert) {
    var done = assert.async();
    var OriginalPromise = Promise;
    var MyShinyPromise = createPromiseProxy(OriginalPromise);

    Promise = MyShinyPromise;

    var promise = JSZipTestUtils.createZipAll().file("Hello.txt").async("string").then(function (result) {
        assert.ok(MyShinyPromise.calls > 0, "at least 1 call of the new Promise");
        Promise = OriginalPromise;
        done();
    })['catch'](JSZipTestUtils.assertNoError);

    assert.ok(promise.isACustomImplementation, "the custom implementation is used");
});

QUnit.test("Promise can be replaced in .generateAsync()", function (assert) {
    var done = assert.async();
    var OriginalPromise = Promise;
    var MyShinyPromise = createPromiseProxy(OriginalPromise);

    Promise = MyShinyPromise;

    var promise = JSZipTestUtils.createZipAll().generateAsync({type:"string"}).then(function (result) {
        assert.ok(MyShinyPromise.calls > 0, "at least 1 call of the new Promise");
        Promise = OriginalPromise;
        done();
    })['catch'](JSZipTestUtils.assertNoError);

    assert.ok(promise.isACustomImplementation, "the custom implementation is used");
});

JSZipTestUtils.testZipFile("Promise can be replaced in .loadAsync()", "ref/all.zip", function (assert, all) {
    var done = assert.async();
    var OriginalPromise = Promise;
    var MyShinyPromise = createPromiseProxy(OriginalPromise);

    Promise = MyShinyPromise;

    var promise = JSZip.loadAsync(all).then(function (result) {
        assert.ok(MyShinyPromise.calls > 0, "at least 1 call of the new Promise");
        Promise = OriginalPromise;
        done();
    })['catch'](JSZipTestUtils.assertNoError);

    assert.ok(promise.isACustomImplementation, "the custom implementation is used");
});
