
/** Create a CubicBezierSpline with control points `c0`, `c1`, `c2`, and `c3`, whose acceptable parameter values are between `umin` and `umin+uscale`. */
SF.CubicBezierSpline = function (c0, c1, c2, c3, umin, uscale) {
    this.c0 = c0;
    this.c1 = c1;
    this.c2 = c2;
    this.c3 = c3;
    this.umin = umin;
    this.uscale = uscale;
    Object.freeze(this);
}

/** Return the point on the curve for parameter value `u`, which is offset and scaled based on the `umin` and `uscale` parameters I was created with. */

SF.CubicBezierSpline.prototype.vectorAt = function (u) {
    var t = (u - this.umin) / this.uscale, tm = 1 - t;
    return this.c0.times(tm*tm*tm)
        .plus(this.c1.times(3*tm*tm*t))
        .plus(this.c2.times(3*tm*t*t))
        .plus(this.c3.times(t*t*t));
};

/** Fit a cubic Bezier spline to the points `pattern[start]` through `pattern[start+length-1]`, where `length > 0`.  If `length === 1`, all of the spline's control points are set to `pattern[start]`.  If `length === 2`, the spline is a straight line between the two pattern points.  If `length === 3`, the spline is a quadratic (degree 2) spline passing through the three pattern points, elevated to degree 3.  Otherwise, the spline minimizes the squared distances from the pattern points to the points on the spline determined by `parameters[start]` through `parameters[start+length-1]`. */
SF.CubicBezierSpline.fit = function (pattern, parameters, start, length) {
    switch (length) {
        case 0:
            throw new Error('SC.CubicBezierSpline.fit called with length === 0');
        case 1:
            return this.fit1(pattern[start], parameters[start]);
        case 2:
            return this.fit2(pattern[start], pattern[start+1], parameters[start], parameters[start + 1]);
        case 3:
            return this.fit3(pattern, parameters, start, length);
        default:
            return this.fitMany(pattern, parameters, start, length);
    }
};

SF.CubicBezierSpline.fit1 = function (p, u) {
    return new this(p, p, p, p, u, 1);
};

SF.CubicBezierSpline.fit2 = function (p0, p1, u0, u1) {
    var d = p1.minus(p0).times(1/3);
    return new this(p0, p0.plus(d), p1.minus(d), p1, u0, u1-u0);
};

SF.CubicBezierSpline.fit3 = function (ps, us, start) {
    // I fit a quadratic Bezier cubic through the pattern points and elevate its degree to make it cubic.  See docs/quadratic.md for the math.

    var p0 = ps[start], p1 = ps[start+1], p2 = ps[start+2];
    var umin = us[start], uscale = us[start + 2] - umin;
    var u = (us[start + 1] - umin) / uscale;
    // q1_23 = q1 * 2/3
    var q1_23 = p1.minus(p0.times((1-u)*(1-u))).minus(p2.times(u*u)).times(1/(3*u*(1-u)));
    var c1 = p0.times(1/3).plus(q1_23);
    var c2 = p2.times(1/3).plus(q1_23);

    return new this(p0, c1, c2, p2, umin, uscale);
};

SF.CubicBezierSpline.fitMany = function (ps, us, start, length) {
    // See docs/cubic-unconsrained.md for the derivation.

    var umin = us[start], uscale = us[start+length-1] - umin,
        m1 = 0, m12 = 0, m2 = 0,
        j, u,
        A0, A1, A2, A3,
        b1x = 0, b1y = 0, b2x = 0, b2y = 0,
        c0x = ps[start].x, c0y = ps[start].y,
        c3x = ps[start+length-1].x, c3y = ps[start+length-1].y,
        pjx, pjy, d;

    for (j = 0; j < length; ++j) {
        u = (us[start+j] - umin) / uscale;
        pjx = ps[start+j].x;
        pjy = ps[start+j].y;
        A0 = (1 - u) * (1 - u) * (1 - u);
        A1 = 3 * (1 - u) * (1 - u) * u;
        A2 = 3 * (1 - u) * u * u;
        A3 = u * u * u;
        m1 += A1 * A1;
        m12 += A1 * A2;
        m2 += A2 * A2;
        b1x += A1 * (pjx - c0x * A0 - c3x * A3);
        b1y += A1 * (pjy - c0y * A0 - c3y * A3);
        b2x += A2 * (pjx - c0x * A0 - c3x * A3);
        b2y += A2 * (pjy - c0y * A0 - c3y * A3);
    }

    d = m1 * m2 - m12 * m12;

    return new this(ps[start],
        new SF.Vector((b1x*m2 - b2x*m12) / d, (b1y*m2 - b2y*m12) / d),
        new SF.Vector((b2x*m1 - b1x*m12) / d, (b2y*m1 - b1y*m12) / d),
        ps[start+length-1],
        umin,
        uscale);
};

