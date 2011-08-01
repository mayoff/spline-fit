

/** Choose initial parameters for the pattern points *ps*. I return an array `us` of unscaled parameter values. For each `ps[i]`, the fitters will try to make the curve pass through `ps[i]` at parameter value `us[i]/us[ps.length-1]`. */

SF.choosePatternParameters = function (ps) {
    var l = ps.length, j, us = new Array(l);
    us[0] = 0;
    for (j = 1; j < l; ++j)
        us[j] = us[j-1] + ps[j].minus(ps[j-1]).norm();
    return us;
};

/** Fit a cubic Bezier curve with free control points through the pattern points `ps[start]` through `ps[start+length-1]`, minimizing the squared error. The curve will try to pass through `ps[i]` at parameter value `(us[i]-us[start])/(us[start+length-1]-us[start])`. I return an array of the two middle control points. The first and last control points are always `ps[start]` and `ps[start+length-1]`. */

SF.fitUnconstrainedCubic = function (ps, us, start, length) {
    // See docs/cubic-unconstrained.md for the derivation.

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

    return [
        new SF.Vector((b1x*m2 - b2x*m12) / d, (b1y*m2 - b2y*m12) / d),
        new SF.Vector((b2x*m1 - b1x*m12) / d, (b2y*m1 - b1y*m12) / d)
    ];
};

SF.UnconstrainedFitter = function () {
    // I will try to pass the curve through each (xs[i], ys[i]) in order.
    this.xs = [];
    this.ys = [];

    // this.ps[i]/this.pmax is the parameter value at which I try to fit the curve to (xs[i], ys[i]).
    this.ps = [];
    this.pmax = 0.0;

    // (cxs[i], cys[i]) is a control point of the fitted Bezier cubic.
    this.cxs = [];
    this.cys = [];

    // (cxs1[i], cys1[i]) is a control point of the first derivative of the fitted Bezier cubic.  The
    // first derivative of a Bezier cubic is a Bezier quadratic.
    this.cxs1 = [];
    this.cys1 = [];

    // (cxs2[i], cys2[i]) is a control point of the second derivative of the fitted Bezier cubic.  The
    // second derivative of a Bezier cubic is a line.
    this.cxs2 = [];
    this.cys2 = [];
}

SF.UnconstrainedFitter.prototype.mdump = function () {
    console.log("xs=List" + JSON.stringify(this.xs) + ";\n" +
        "ys=List" + JSON.stringify(this.ys) + ";\n" +
        "cxs=List" + JSON.stringify(this.cxs) + ";\n" +
        "cys=List" + JSON.stringify(this.cys) + ";\n");
};

SF.UnconstrainedFitter.prototype.push = function (x, y) {
    this.xs.push(x);
    this.ys.push(y);
};

SF.UnconstrainedFitter.prototype.fit = function () {
    if (this.xs.length < 4) {
        // XXX Need a different method to fit the curve.
        return;
    }

    this.pickInitialPs();
    this.cxs = cxs = this.fitAxis(this.xs, this.ps, this.pmax);
    this.cys = cys = this.fitAxis(this.ys, this.ps, this.pmax);
    this.cxs1 = this.derivativeControlPointsFor(this.cxs);
    this.cys1 = this.derivativeControlPointsFor(this.cys);
    this.cxs2 = this.derivativeControlPointsFor(this.cxs1);
    this.cys2 = this.derivativeControlPointsFor(this.cys1);
};

SF.UnconstrainedFitter.prototype.pickInitialPs = function () {
    var xs = this.xs, ys = this.ys, l = xs.length, i, ps = new Array(l), x, y, lx = xs[0], ly = ys[0], dx, dy;

    ps[0] = 0.0;
    for (i = 1; i < l; ++i) {
        x = xs[i]; y = ys[i];
        dx = x - lx; dy = y - ly;
        ps[i] = ps[i-1] + Math.sqrt(dx*dx + dy*dy);
        lx = x; ly = y;
    }
    this.ps = ps;
    this.pmax = ps.last;
};

SF.UnconstrainedFitter.prototype.derivativeControlPointsFor = function (cp) {
    var n = cp.length - 1, r = new Array(n), i;
    for (i = 0; i < n; ++i) {
        r[i] = n * (cp[i+1] - cp[i]);
    }
    return r;
}

SF.UnconstrainedFitter.prototype.fitAxis = function (xs, ps, pmax) {
    var i, l = xs.length, x, t, tm, x0 = xs[0], xe = xs.last,
        m00 = 0.0, m01 = 0.0, m10 = 0.0, m11 = 0.0, y0 = 0.0, y1 = 0.0, B0, B1, B2, B3;

    for (i = 0; i < l; ++i) {
        x = xs[i];
        t = ps[i] / pmax;
        tm = 1 - t;

        B0 = tm*tm*tm;
        B1 = 3*t*tm*tm;
        B2 = 3*t*t*tm;
        B3 = t*t*t;

        m00 += B1*B1;
        m01 += B1*B2;
        m10 += B1*B2;
        m11 += B2*B2;

        y0 += B1 * (x - x0 * B0 - xe * B3);
        y1 += B2 * (x - x0 * B0 - xe * B3);
    }

    return [ x0, (m11*y0 - m01*y1)/(m00*m11 - m01*m10), (m10*y0 - m00*y1)/(m01*m10 - m00*m11), xe ];
};

SF.UnconstrainedFitter.prototype.vectorAt = function (p) {
    var t = p / this.pmax, tm = 1 - t, cxs = this.cxs, cys = this.cys;
    return new SF.Vector(
        tm*tm*tm*cxs[0] + 3*tm*tm*t*cxs[1] + 3*tm*t*t*cxs[2] + t*t*t*cxs[3],
        tm*tm*tm*cys[0] + 3*tm*tm*t*cys[1] + 3*tm*t*t*cys[2] + t*t*t*cys[3]);
};

SF.UnconstrainedFitter.prototype.derivativeAt = function (p) {
    var t = p / this.pmax, tm = 1 - t, cxs = this.cxs1, cys = this.cys1;
    return new SF.Vector(
        tm*tm*cxs[0] + 2*tm*t*cxs[1] + t*t*cxs[2],
        tm*tm*cys[0] + 2*tm*t*cys[1] + t*t*cys[2]);
};

SF.UnconstrainedFitter.prototype.secondDerivativeAt = function (p) {
    var t = p / this.pmax, tm = 1 - t, cxs = this.cxs2, cys = this.cys2;
    return new SF.Vector(
        tm*cxs[0] + t*cxs[1],
        tm*cys[0] + t*cys[1]);
};

SF.UnconstrainedFitter.prototype.improveDataParameters = function () {
    var i, l = this.xs.length;
    for (i = 0; i < l; ++i) {
        this.improveDataParameter(i);
    }
};

SF.UnconstrainedFitter.prototype.improveDataParameter = function (i) {
    var x = this.xs[i], y = this.ys[i], t = this.ps[i] / this.pmax,
        Q = this.vectorAt(t),
        D = Q.minus(new SF.Vector(x, y)),
        Qp = this.derivativeAt(t),
        Qpp = this.secondDerivativeAt(t),
        t1;

    t1 = t - D.dot(Qp) / (D.dot(Qpp) + Qp.dot(Qp));
    if (t1 >= 0 && t1 <= 1) {
        this.ps[i] = t1 * this.pmax;
    }
};

