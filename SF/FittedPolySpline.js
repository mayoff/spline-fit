

SF.FittedPolySpline = SC.Object.extend({

    /** pattern is the array of points through which the fitted polyspline should pass.  You provide this by sending me the addPatternPoint message repeatedly. */
    pattern: null, // Array of SF.Vector

    /** controls is the array of controls points for the fitted cubic Bezier splines.  The number of splines is <code>(controls.length - 1) / 3</code>.  Spline i is defined by the four points in controls[3*i] through controls[3*i+3] inclusive. If the pattern is empty, controls is empty.  If the pattern contains just one point, controls contains just that point.  If pattern contains two or more points, controls contains 3N+1 points for some integer N>0. */
    controls: null, // Array of SF.Vector

    init: function () {
        this.pattern = [];
        this.controls = [];
    },

    addPatternPoint: function (point) {
        SC.beginPropertyChanges();
        this.pattern.pushObject(point);
        this.controls.arrayContentWillChange();
        this._fit();
        this.controls.arrayContentDidChange();
        SC.endPropertyChanges();
    },

    forEachCubic: function (callback, thisObject) {
        var cs = this.controls, i, l = cs.length;
        for (i = 1; i < l; i += 3)
            callback.call(thisObject, cs[i-1], cs[i], cs[i+1], cs[i+2]);
    },

    _fit: function () {
        this.controls.splice(0);
        if (this.pattern.length === 0)
            return;
        this.controls.push(this.pattern[0]);
        switch (this.pattern.length) {
            case 1:
                break;
            case 2:
                this._fit2();
                break;
            case 3:
                this._fit3();
                break;
            default:
                this._fitMany();
                break;
        }
    },

    /** Append a spline to this.controls.  The spline starts at this.controls.last() so you should only pass three control points. */
    _pushSpline: function (c1, c2, c3) {
        this.controls.push(c1, c2, c3);
    },

    /** Fit the entire pattern, which contains only two points. */
    _fit2: function () {
        var p0 = this.pattern[0], p3 = this.pattern[1];
        var d = p3.minus(p0).times(1/3);
        this._pushSpline(p0.plus(d), p3.minus(d), p3);
    },

    /** Fit the entire pattern, which contains only three points.  I fit a quadratic Bezier spline, then convert it to a cubic. */
    _fit3: function () {
        // The math for this method is described in docs/quadratic.md .

        var ps = this.pattern, p0 = ps[0], p1 = ps[1], p2 = ps[2];
        var u = .5;
        // q1n = numerator of q1
        var q1n = p1.minus(p0.times((1-u)*(1-u))).minus(p2.times(u*u));
        var c1 = p0.plus(q1n).times(1/3);
        var c2 = p2.plus(q1n).times(1/3);

        this._pushSpline(c1, c2, p2);
    },

    /** Fit the entire pattern, which contains at least four points. */
    _fitMany: function () {
        // XXX TODO
    }

});

