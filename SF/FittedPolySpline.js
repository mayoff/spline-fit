

SF.FittedPolySpline = SC.Object.extend({

    /** pattern is the array of points through which the fitted polyspline should pass. You provide this by sending me the addPatternPoint message repeatedly. */
    pattern: null, // Array of SF.Vector

    /** splines is an array of the splines fitted to `this.pattern`. Each element is an instance of SF.CubicBezierSpline. */
    splines: null, // Array of SF.CubicBezierSpline

    /** parameters is the array of parameters at which I tried to make the fitted polyspline pass through the pattern points. That is to say, `this.fittedValue(this.parameters[i])` should be close to `this.pattern[j]`. */
    parameters: null, // Array of Number

    /** maxDepth is the maximum recursion depth I will use to subdivide splines for a better fit. */
    maxDepth: 2,

    /** maxDistance is the maximum distance between a pattern point and the fitted curve before subdividing the fitted curve. */
    maxDistance: 2,

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
        this.parameters = this._choosePatternParameters();
        this.splines = this._fit(0, this.pattern.length, 0);
        SC.endPropertyChanges();
    },

    forEachSpline: function (callback, thisObject) {
        this.splines.forEach(callback, thisObject);
    },

    /** Return the point for parameter value `u`. */
    vectorAt: function (u) {
        var ss = this.splines, i, l = ss.length;
        for (i = 1; i < l; ++i) {
            if (u < ss[i].umin)
                break;
        }
        --i;
        return ss[i].vectorAt(u);
    },

    _choosePatternParameters: function () {
        var ps = this.pattern, l = ps.length, j, us = new Array(l);
        us[0] = 0;
        for (j = 1; j < l; ++j)
            us[j] = us[j-1] + ps[j].minus(ps[j-1]).norm();
        return us;
    },

    /** Fit the points `pattern[start]` through `pattern[start+length-1]` using as many splines as necessary. I return an array of SF.CubicBezierSpline. */
    _fit: function (start, length, depth) {
        var i, maxError = Math.max(.1, this.maxDistance * this.maxDistance), maxErrorIndex, d, error;

        if (length === 0)
            return [];

        var spline = SF.CubicBezierSpline.fit(this.pattern, this.parameters, start, length);

        if (depth === this.maxDepth)
            return [ spline ];

        for (i = 1; i < length - 1; ++i) {
            d = spline.vectorAt(this.parameters[start+i]).minus(this.pattern[start+i]);
            error = d.dot(d);
            if (error > maxError) {
                maxError = error;
                maxErrorIndex = start + i;
            }
        }

        if (!maxErrorIndex)
            return [ spline ];

        return this._fit(start, maxErrorIndex - start + 1, depth + 1)
            .concat(this._fit(maxErrorIndex, start + length - maxErrorIndex, depth + 1));
    }

});

