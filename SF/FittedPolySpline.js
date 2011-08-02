

SF.FittedPolySpline = SC.Object.extend({

    /** pattern is the array of points through which the fitted polyspline should pass. You provide this by sending me the addPatternPoint message repeatedly. */
    pattern: null, // Array of SF.Vector

    /** splines is an array of the splines fitted to `this.pattern`. Each element is an instance of SF.CubicBezierSpline. */
    splines: null, // Array of SF.CubicBezierSpline

    /** parameters is the array of parameters at which I tried to make the fitted polyspline pass through the pattern points. That is to say, `this.fittedValue(this.parameters[i])` should be close to `this.pattern[j]`. */
    parameters: null, // Array of Number

    /** maxDepth is the maximum recursion depth I will use to subdivide splines for a better fit. */
    maxDepth: 2,

    reset: function () {
        this.pattern = [];
        this.splines = [];
        this.parameters = [];
    },

    init: function () {
        this._super();
        this.reset();
        '*pattern.[] maxDepth'.w().forEach(function (key) {
            SC.addObserver(this, key, this, this.fit);
        }, this);
    },

    addPatternPoint: function (point) {
        this.pattern.pushObject(point);
    },

    /** Fit splines to my pattern.  I automatically call this whenever you call `addPatternPoint`.  You need to call it if you change any of my other parameters. */
    fit: function () {
        SC.beginPropertyChanges();
        this.parameters = SF.choosePatternParameters(this.pattern);
        this.splines = this._fit(0, this.pattern.length, 0);
        SC.endPropertyChanges();
    },

    forEachSpline: function (callback, thisObject) {
        this.splines.forEach(callback, thisObject);
    },

    /** Fit the points `pattern[start]` through `pattern[start+length-1]` using as many splines as necessary. I return an array of SF.CubicBezierSpline. */
    _fit: function (start, length, depth) {
        if (length === 0)
            return [];
        else if (depth >= this.maxDepth || length <= 4)
            return [ SF.CubicBezierSpline.fit(this.pattern, this.parameters, start, length) ];
        else {
            var s2 = start + Math.floor(length / 2);
            return this._fit(start, s2 - start + 1, depth + 1)
                .concat(this._fit(s2, start + length - s2, depth + 1));
        }
    }

});

