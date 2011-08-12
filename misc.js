

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

Math.TWO_PI = Math.PI * 2;

(function () {

    'use strict';

    var flagChars = {
        '-': 'leftJustify',
        '+': 'wantPlusSign',
        ' ': 'wantSpaceSign',
        '0': 'padWithZeroes',
        '#': 'alternateForm'
    };

    function getSign(n, flags) {
        return n < 0 ? '-'
            : flags.wantPlusSign ? '+'
            : flags.wantSpaceSign ? ' '
            : '';
    }

    function pad(sigils, n, minWidth, flags) {
        var l = sigils.length + n.length,
            padCount = minWidth - l;
        var padChar = flags.padWithZeroes ? '0' : ' ';
        var padding = '';
        while (padding.length < padCount)
            padding += padChar;
        return flags.leftJustify ? (sigils + n + padding)
            : flags.padWithZeroes? (sigils + padding + n)
            : padding + sigils + n;
    }

    function formatForPrecision(n, precision, radix) {
        var s = n.toString(radix);
        if (precision === undefined)
            return s;
        var padCount = precision - s.length;
        var padding = '';
        while (padding.length < padCount)
            padding += '0';
        return padding + s;
    }

    function nonFinite(n, minWidth, flags) {
        var sign = getSign(n, flags);
        if (n < 0) n = -n;
        // Note: no zero-padding for non-finites
        return pad(sign, n, minWidth, { leftJustify: flags.leftJustify });
    }

    var converters = {
        d: function dConverter(n, flags, minWidth, precision, conversion) {
            n = Math.floor(n);
            if (!isFinite(n))
                return nonFinite(n, minWidth, flags);
            if (precision !== undefined)
                flags.padWithZeroes = false;
            var sigils = getSign(n, flags);
            if (n < 0)
                n = -n;

            if (conversion === 'o') {
                n = formatForPrecision(precision, n, 8);
                if (flags.alternateForm && n[0] != '0')
                    n = '0' + n;
            } else if (conversion === 'x' || conversion === 'X') {
                n = formatForPrecision(n, precision, 16);
                if (flags.alternateForm)
                    sigils += '0x';
            }
            else
                n = formatForPrecision(n, precision, 10);

            n = pad(sigils, n, minWidth, flags);
            if (conversion === 'X')
                n = n.toUpperCase();
            return n;
        },

        f: function fConverter(n, flags, minWidth, precision, conversion) {
            // NOTE: This doesn't follow the C standard if n >= 1e21, because I use Number.prototype.toFixed. ECMAScript 5 says toFixed uses exponential notation if n >= 1e21. Working around that correctly would require serious work. It's not just a matter of appending zeroes. Try printf("%f", 1e50) in C to see what I mean.
            n = +n;
            if (!isFinite(n))
                return nonFinite(n, minWidth, flags);
            var sigils = getSign(n, flags);
            if (n < 0)
                n = -n;
            if (precision === undefined)
                precision = 6;
            n = n.toFixed(precision);
            if (flags.alternateForm && n.indexOf('.') < 0 && n.indexOf('e') < 0)
                n += '.';

            return pad(sigils, n, minWidth, flags);
        }

        // REMEMBER TO UPDATE re IF YOU ADD CONVERTERS
    };

    converters.i = converters.d;
    converters.u = converters.d;
    // REMEMBER TO UPDATE re IF YOU ADD CONVERTERS

    function parseFlags(flagString) {
        var flags = {};
        if (flagString == null)
            return flags;
        for (var i = flagString.length - 1; i >= 0; --i) {
            var flag = flagChars[flagString[i]];
            if (flag !== undefined)
                flags[flag] = true;
        }
        if (flags.leftJustify)
            flags.padWithZeroes = false;
        return flags;
    }

    var re = /%([-+0 ]*)([1-9][0-9]*)?(?:\.([0-9]+))?([dif])/g;

    String.prototype.printf = function () {
        var args = arguments, argIndex = 0;

        function formatReplacer(_, flagString, minWidth, precision, conversion) {
            var converter = converters.hasOwnProperty(conversion) && converters[conversion];
            if (!converter) {
                throw 'String.prototype.printf encountered unknown conversion type "' + conversion + '"';
            }
            minWidth = (minWidth === undefined) ? 0 : +minWidth;
            if (precision !== undefined) precision = +precision;
            var arg = args[argIndex++];
            var flags = parseFlags(flagString);
            return converter(arg, flags, minWidth, precision, conversion);
        }

        return this.replace(re, formatReplacer);
    };

})();

(function () {

    Handlebars.registerHelper('number', function (numberPath, defaultFormat, options) {
        sc_assert('You must pass a property path as the first argument to the number helper', typeof(numberPath) === 'string');
        sc_assert('You must pass the default format string to the number helper', typeof(defaultFormat) === 'string');
        sc_assert('You passed extra arguments to the number helper', typeof(options) === 'object');

        var self = this,
            data = options.data,
            view = data.view,
            specificFormats = options.hash;
        var bindView = view.createChildView(SC._BindableSpanView, {
            preserveContext: false,
            shouldDisplayFunc: function () { return true; },
            displayTemplate: function (number) {
                console.log('bindView displayTemplate', arguments, options);
                var numberString = +number + '';
                var format = specificFormats.hasOwnProperty(numberString)
                    ? specificFormats[numberString]
                    : defaultFormat;
                return format.printf(number);
            },
            property: numberPath,
            previousContext: this,
            tagName: 'span'
        });

        view.appendChild(bindView);

        function updateNumberView() {
            if (SC.get(bindView, 'element')) {
                bindView.rerender();
            } else {
                SC.removeObserver(self, numberPath, observeNumberProperty);
            }
        }

        function observeNumberProperty() {
            SC.run.once(updateNumberView);
        }

        SC.addObserver(self, numberPath, observeNumberProperty);

    });

})();

