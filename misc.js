

Object.defineProperty(Array.prototype, 'last', {
    configurable: false,
    get: function () { return this[this.length - 1]; },
    set: function (value) { return this[this.length] = value; }
});

Function.trace = function (object, method) {
    var wrapper = function () {
        console.log("calling " + method, this, arguments);
        var r = wrapper.original.apply(this, arguments);
        console.log("returning from " + method, r);
        return r;
    };
    wrapper.original = object[method];
    object[method] = wrapper;
    return wrapper;
};

Function.prototype.untrace = function (object, method) {
    object[method] = object[method].original;
    return object[method];
};

