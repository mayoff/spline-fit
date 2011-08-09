
(function () {

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

/** Fit a cubic Bezier spline to the points `a.pattern[start]` through `a.pattern[a.start+a.length-1]`. If `a.length === 1`, all of the spline's control points are set to `a.pattern[a.start]`.  If `a.length === 2`, the spline is a straight line between the two pattern points.  If `a.length === 3`, the spline is a quadratic (degree 2) spline passing through the three pattern points, elevated to degree 3.  Otherwise, the spline minimizes the squared distances from the pattern points to the points on the spline determined by `a.parameters[a.start]` through `a.parameters[a.start+a.length-1]`.

    If `a.startTangent` exists, I will try to make the fitted curve have `a.startTangent` as its tangent vector at parameter value 0.

    If `a.endTangent` exists, I will try to make the fitted curve have `-a.endTangent` as its tangent vector at parameter value 1. */
SF.CubicBezierSpline.fit = function (a) {
    var start = a.start, ps = a.pattern, us = a.parameters;
    switch (a.length) {
        case 0:
            throw new Error('SC.CubicBezierSpline.fit called with length === 0');
        case 1:
            // xxx make this use startTangent/endTangent?
            return fit1(ps[start], us[start]);
        case 2:
            return fit2(a);
        case 3:
            return fit3(a);
        default:
            if (a.startTangent) {
                if (a.endTangent) {
                    return fitTwoTangents(a);
                } else {
                    return fitOneTangent(a);
                }
            } else if (a.endTangent) {
                return fitOneTangent(a);
            } else {
                return fitNoTangents(a);
            }
    }
};

function fit1(p, u) {
    return new SF.CubicBezierSpline(p, p, p, p, u, 1);
};

function fit2(a) {
    var start = a.start, ps = a.pattern, us = a.parameters, p0 = ps[start], p1 = ps[start+1], u0 = us[start], u1 = us[start+1];
    var difference = p1.minus(p0), offset, tangentScale, defaultTangent, c1, c2;
        tangentScale = difference.norm() / 3;
    if (!a.startTangent || !a.endTangent)
        defaultTangent = difference.times(1/3);
    c1 = p0.plus(a.startTangent ? a.startTangent.times(tangentScale) : defaultTangent);
    c2 = p1.minus(a.endTangent ? a.endTangent.times(tangentScale) : defaultTangent);
    return new SF.CubicBezierSpline(p0, c1, c2, p1, u0, u1-u0);
};

function fit3(a) {
    // I fit a quadratic Bezier cubic through the pattern points and elevate its degree to make it cubic.  See docs/quadratic.md for the math.

    // xxx make this use startTangent/endTangent

    var ps = a.pattern, us = a.parameters, start = a.start;

    var p0 = ps[start], p1 = ps[start+1], p2 = ps[start+2];
    var umin = us[start], uscale = us[start + 2] - umin;
    var u = (us[start + 1] - umin) / uscale;
    // q1_23 = q1 * 2/3
    var q1_23 = p1.minus(p0.times((1-u)*(1-u))).minus(p2.times(u*u)).times(1/(3*u*(1-u)));
    var c1 = p0.times(1/3).plus(q1_23);
    var c2 = p2.times(1/3).plus(q1_23);

    return new SF.CubicBezierSpline(p0, c1, c2, p2, umin, uscale);
};

function fitNoTangents(a) {
    // See docs/cubic-unconstrained.md for the derivation.

    var ps = a.pattern, us = a.parameters, start = a.start, length = a.length;

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

    return new SF.CubicBezierSpline(ps[start],
        new SF.Vector((b1x*m2 - b2x*m12) / d, (b1y*m2 - b2y*m12) / d),
        new SF.Vector((b2x*m1 - b1x*m12) / d, (b2y*m1 - b1y*m12) / d),
        ps[start+length-1],
        umin,
        uscale);
};

function fitOneTangent(a) {
    // See docs/cubic-half-constrained.md for the derivation.

    var ps = a.pattern, us = a.parameters, start = a.start, length = a.length,
        tangent, flip;

    if (a.startTangent) {
        tangent = a.startTangent;
        flip = false;
    } else {
        tangent = a.endTangent;
        flip = true;
    }

    var umin = us[start], uscale = us[start+length-1] - umin,
        u, j, B0, B1, B2, B3, sumB1B1 = 0, sumB1B2 = 0, sumB2B2 = 0,
        m00, m01, m02, m11,
        p, x = 0, y = 0, c0x, c0y, c3x, c3y,
        b0 = 0, b1 = 0, b2 = 0,
        vx = tangent.x, vy = tangent.y,
        d, a, c2x, c2y;

    c0x = ps[start].x;
    c0y = ps[start].y;
    c3x = ps[start+length-1].x;
    c3y = ps[start+length-1].y;

    if (flip) {
        // This has the effect of reversing the order of the pattern points.
        umin += uscale;
        uscale = -uscale;
        j = c0x; c0x = c3x; c3x = j;
        j = c0y; c0y = c3y; c3y = j;
    }

    for (j = 0; j < length; ++j) {
        u = (us[start+j] - umin) / uscale;
        B0 = (1-u) * (1-u) * (1-u);
        B1 = 3 * (1-u) * (1-u) * u;
        B2 = 3 * (1-u) * u * u;
        B3 = u * u * u;
        sumB1B1 += B1 * B1;
        sumB1B2 += B1 * B2;
        sumB2B2 += B2 * B2;
        p = ps[start + j];
        x = (p.x - c0x * (B0 + B1) - c3x * B3);
        y = (p.y - c0y * (B0 + B1) - c3y * B3);
        b0 += (x * vx + y * vy) * B1;
        b1 += x * B2;
        b2 += y * B2;
    }

    m00 = sumB1B1;
    m01 = vx * sumB1B2;
    m02 = vy * sumB1B2;
    m11 = sumB2B2;

    d = m11 * (m01*m01 + m02*m02 - m00*m11);
    a = m11 * (b1 * m01 + b2 * m02 - b0 * m11) / d;
    c2x = (b1 * (m02*m02 - m00*m11) + m01 * (b0*m11 - b2*m02)) / d;
    c2y = (b2 * (m01*m01 - m00*m11) + m02 * (b0*m11 - b1*m01)) / d;

    if (flip) {
        return new SF.CubicBezierSpline(ps[start],
            new SF.Vector(c2x, c2y),
            new SF.Vector(c0x + a * vx, c0y + a * vy),
            ps[start+length-1],
            us[start],
            -uscale);
    } else {
        return new SF.CubicBezierSpline(ps[start],
            new SF.Vector(c0x + a * vx, c0y + a * vy),
            new SF.Vector(c2x, c2y),
            ps[start+length-1],
            umin,
            uscale);
    }
}

function fitTwoTangents(a) {
    // See "An Algorithm for Automatically Fitting Digitized Curves" by Philip J. Schneider for the derivation.

    var ps = a.pattern, us = a.parameters, start = a.start, length = a.length, t1 = a.startTangent, t2 = a.endTangent;
    var umin = us[start], uscale = us[start+length-1] - umin;
    var c0 = ps[start], c3 = ps[start+length-1];
    var c0x = c0.x, c0y = c0.y, c3x = c3.x, c3y = c3.y;
    var t1x = t1.x, t1y = t1.y, t2x = t2.x, t2y = t2.y, t1t2 = t1.dot(t2);

    var m00 = 0, m01 = 0, m11 = 0;
    var b0 = 0, b1 = 0;

    for (var j = 0; j < length; ++j) {
        var u = (us[start+j] - umin) / uscale;
        var B0 = (1-u) * (1-u) * (1-u),
            B1 = 3 * (1-u) * (1-u) * u,
            B2 = 3 * (1-u) * u * u,
            B3 = u * u * u;
        m00 += B1 * B1;
        m01 += t1t2 * B1 * B2;
        m11 += B2 * B2;
        var p = ps[start+j];
        var x = p.x - c0x * (B0 + B1) - c3x * (B2 + B3);
        var y = p.y - c0y * (B0 + B1) - c3y * (B2 + B3);
        b0 += B1 * (x * t1x + y * t1y);
        b1 += B2 * (x * t2x + y * t2y);
    }
;
    var d = m00*m11 - m01*m01;
    var a1 = (b0*m11 - b1*m01) / d;
    var a2 = (b1*m00 - b0*m01) / d;

    return new SF.CubicBezierSpline(c0, c0.plus(t1.times(a1)), c3.plus(t2.times(a2)), c3, umin, uscale);
}

})();

