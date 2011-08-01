

SF.FittedPolySpline = SC.Object.extend({

    /** pattern is the array of points through which the fitted polyspline should pass. You provide this by sending me the addPatternPoint message repeatedly. */
    pattern: null, // Array of SF.Vector

    /** controls is the array of controls points for the fitted cubic Bezier splines. The number of splines is <code>(controls.length - 1) / 3</code>. Spline i is defined by the four points in controls[3*i] through controls[3*i+3] inclusive. If the pattern is empty, controls is empty. If the pattern contains just one point, controls contains just that point. If pattern contains two or more points, controls contains 3N+1 points for some integer N>0. */
    controls: null, // Array of SF.Vector

    /** parameters is the array of parameters at which I tried to make the fitted polyspline pass through the pattern points. That is to say, `this.fittedValue(this.parameters[i])` should be close to `this.pattern[j]`. */
    parameters: null, // Array of Number

    /** maxDepth is the maximum recursion depth I will use to subdivide splines for a better fit. */
    maxDepth: 2,

    reset: function () {
        this.pattern = [];
        this.controls = [];
        this.parameters = [];
    },

    init: function () {
        this._super();
        this.reset();
    },

    addPatternPoint: function (point) {
        var cs;
        SC.beginPropertyChanges();
        this.pattern.pushObject(point);
        this.parameters = SF.choosePatternParameters(this.pattern);
        cs = [ this.pattern[0] ];
        this._fit(0, this.pattern.length, cs, 0);
        this.controls = cs;
        SC.endPropertyChanges();
    },

    forEachCubic: function (callback, thisObject) {
        var cs = this.controls, i, l = cs.length;
        for (i = 1; i < l; i += 3)
            callback.call(thisObject, cs[i-1], cs[i], cs[i+1], cs[i+2]);
    },

    /** Fit the points `pattern[start]` through `pattern[start+length-1]` using as many splines as necessary.  I assume that `cs.last === pattern[start]` when you call me; this will always be the first control point of the fitted splines.  I push the remaining control points of the splines onto `cs`. */
    _fit: function (start, length, cs, depth) {
        console.log('..........'.substr(0, depth) + '_fit', start, length, depth);
        switch (length) {
            case 0:
                break;
            case 1:
                break;
            case 2:
                this._fit2(start, cs);
                break;
            case 3:
                this._fit3(start, cs);
                break;
            default:
                this._fitMany(start, length, cs, depth);
                break;
        }
    },

    /** Fit the points `pattern[start]` and `pattern[start+1]`.  I assume `cs.last === pattern[start]` and push the remaining control points onto `cs`. */
    _fit2: function (start, cs) {
        var c0 = this.pattern[start], c3 = this.pattern[start+1];
        var d = c3.minus(c0).times(1/3);
        cs.push(c0.plus(d), c3.minus(d), c3);
    },

    /** Fit the points `pattern[start]` through `pattern[start+2]`. I assume `cs.last === pattern[start]` and push the remaining control points onto `cs`. */
    _fit3: function (start, cs) {
        // I fit a quadratic Bezier cubic through the pattern points and elevate its degree to make it cubic.

        var ps = this.pattern, p0 = ps[start], p1 = ps[start+1], p2 = ps[start+2];
        var u = .5; // This could be changed to a chord-length parameterization.
        // q1_23 = q1 * 2/3
        var q1_23 = p1.minus(p0.times((1-u)*(1-u))).minus(p2.times(u*u)).times(1/(3*u*(1-u)));
        var c1 = p0.times(1/3).plus(q1_23);
        var c2 = p2.times(1/3).plus(q1_23);

        cs.push(c1, c2, p2);
    },

    /** Fit the points `pattern[start]` through `pattern[start+length-1]`, where `length >= 4`.  I assume `cs.last === pattern[start]` and push the remaining control points onto `cs`. */

    _fitMany: function (start, length, cs, depth) {
        console.log('..........'.substr(0, depth) + '_fitMany', start, length, depth);
        if (length === 4 || depth >= this.maxDepth) {
            var fcs = SF.fitUnconstrainedCubic(this.pattern, this.parameters, start, length);
            cs.push(fcs[0], fcs[1], this.pattern[start+length-1]);
        } else {
            var m = Math.floor(length / 2);
            this._fit(start, m, cs, depth + 1);
            this._fit(start + m, length - m, cs, depth + 1);
        }
    }

});

