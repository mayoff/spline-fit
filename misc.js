

Object.defineProperty(Array.prototype, 'last', {
    configurable: false,
    get: function () { return this[this.length - 1]; },
    set: function (value) { return this[this.length] = value; }
});

