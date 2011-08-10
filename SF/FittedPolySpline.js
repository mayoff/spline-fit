

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

    /** maxImproveDistance is the maximum distance between a pattern point and the fitted curve at which I will improve the parameter values.  If any point of the pattern is more than this distance from the fitted spline, I will skip refitting and go straight to subdividing. */
    maxImproveDistance: 20,

    /** maxRefits is the maximum number of times I will refit a spline (after improving the pattern parameters) before splitting it. */
    maxRefits: 3,

    /** If wantFinalRefit is false, I will not refit the spline after the last round of parameter improvement.  This is only useful for debugging. */
    wantFinalRefit: true,

    /** maxImprovements is the maximum number of Newton-Raphson iterations to run on the parameter values before refitting a spline. */
    maxImprovements: 0,

    reset: function () {
        this.pattern = [];
        this.splines = [];
        this.parameters = [];
    },

    init: function () {
        this._super();
        this.reset();
        '*pattern.[] maxDepth maxDistance maxImproveDistance maxRefits wantFinalRefit maxImprovements'.w().forEach(function (key) {
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

    _improvePatternParameters: function (start, length) {
        for (var j = 0; j < length; ++j) {
            for (var i = 0; i < this.maxImprovements; ++i) {
                this._improvePatternParameter(start + j);
            }
        }
    },

    _worstPoint: function (spline, start, length) {
        var ps = this.pattern, us = this.parameters;
        var maxError = -Infinity, maxErrorIndex;
        for (var i = 0; i < length; ++i) {
            var d = spline.vectorAt(us[start+i]).minus(ps[start+i]);
            var error = d.dot(d);
            if (error > maxError) {
                maxError = error;
                maxErrorIndex = start + i;
            }
        }
        return { index: maxErrorIndex, error: maxError };
    },

    /** Fit the points `pattern[start]` through `pattern[start+length-1]` using as many splines as necessary. I return an array of SF.CubicBezierSpline. */
    _fit: function (start, length, depth, startTangent, endTangent) {
        var ps = this.pattern, us = this.parameters;

        if (length === 0)
            return [];

        var a = {
            pattern: ps,
            parameters: us,
            start: start,
            length: length,
            startTangent: startTangent,
            endTangent: endTangent
        };
        var spline = SF.CubicBezierSpline.fit(a);

        var maxError = this.maxDistance * this.maxDistance;
        var worstPoint = this._worstPoint(spline, start + 1, length - 2);

        if (worstPoint.error < maxError)
            return [ spline ];

        var maxImproveError = this.maxImproveDistance * this.maxImproveDistance;
        if (depth >= this.maxDepth) {
            // We're not going to subdivide this spline, so we might as well try refitting it.
            maxImproveError = Infinity;
        }
        var j = this.maxImprovements > 0 ? this.maxRefits : 0;

        while (worstPoint.error > maxError && worstPoint.error <= maxImproveError && j--) {
            for (var i = 1; i < length - 1; ++i) {
                us[start+i] = spline.improveParameter(ps[start+i],
                    us[start+i], this.maxImprovements);
            }
            if (!j && !this.wantFinalRefit)
                break;
            spline = SF.CubicBezierSpline.fit(a);
            worstPoint = this._worstPoint(spline, start + 1, length - 2);
        }

        if (worstPoint.error <= maxError || depth === this.maxDepth)
            return [ spline ];

        var middle = worstPoint.index;
        var middleTangent = ps[middle+1].minus(ps[middle-1]).toUnit();
        if (isNaN(middleTangent.x)) {
            // The points straddling middle are identical.
            middleTangent = ps[middle].minus(ps[middle-1]).perp().norm();
        }

        return this._fit(start, middle - start + 1, depth + 1, startTangent, middleTangent)
            .concat(this._fit(middle, start + length - middle, depth + 1, middleTangent, endTangent));
    }

});

