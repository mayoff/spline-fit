
function bindMethods(object) {
    var k, v;

    for (k in object) {
        v = object[k];
        if (typeof(v) == 'function' && v.hasOwnProperty('_markedByBindLater')) {
            delete v._markedByBindLater;
            object[k] = v.bind(object);
        }
    }
}

Function.prototype.bindLater = function () {
    this._markedByBindLater = true;
    return this;
};

Array.prototype.last = function () {
    return this[this.length - 1];
}

function Vector(x, y) {
    this.x = x;
    this.y = y;
}

Vector.prototype.minus = function (rhs) {
    return new Vector(this.x - rhs.x, this.y - rhs.y);
};

Vector.prototype.dot = function (rhs) {
    return this.x * rhs.x + this.y * rhs.y;
};

function UnconstrainedFitter() {
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

UnconstrainedFitter.prototype.mdump = function () {
    console.log("xs=List" + JSON.stringify(this.xs) + ";\n" +
        "ys=List" + JSON.stringify(this.ys) + ";\n" +
        "cxs=List" + JSON.stringify(this.cxs) + ";\n" +
        "cys=List" + JSON.stringify(this.cys) + ";\n");
};

UnconstrainedFitter.prototype.push = function (x, y) {
    this.xs.push(x);
    this.ys.push(y);
};

UnconstrainedFitter.prototype.fit = function () {
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

UnconstrainedFitter.prototype.pickInitialPs = function () {
    var xs = this.xs, ys = this.ys, l = xs.length, i, ps = new Array(l), x, y, lx = xs[0], ly = ys[0], dx, dy;

    ps[0] = 0.0;
    for (i = 1; i < l; ++i) {
        x = xs[i]; y = ys[i];
        dx = x - lx; dy = y - ly;
        ps[i] = ps[i-1] + Math.sqrt(dx*dx + dy*dy);
        lx = x; ly = y;
    }
    this.ps = ps;
    this.pmax = ps.last();
};

UnconstrainedFitter.prototype.derivativeControlPointsFor = function (cp) {
    var n = cp.length - 1, r = new Array(n), i;
    for (i = 0; i < n; ++i) {
        r[i] = n * (cp[i+1] - cp[i]);
    }
    return r;
}

UnconstrainedFitter.prototype.fitAxis = function (xs, ps, pmax) {
    var i, l = xs.length, x, t, tm, x0 = xs[0], xe = xs.last(),
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

UnconstrainedFitter.prototype.vectorAt = function (p) {
    var t = p / this.pmax, tm = 1 - t, cxs = this.cxs, cys = this.cys;
    return new Vector(
        tm*tm*tm*cxs[0] + 3*tm*tm*t*cxs[1] + 3*tm*t*t*cxs[2] + t*t*t*cxs[3],
        tm*tm*tm*cys[0] + 3*tm*tm*t*cys[1] + 3*tm*t*t*cys[2] + t*t*t*cys[3]);
};

UnconstrainedFitter.prototype.derivativeAt = function (p) {
    var t = p / this.pmax, tm = 1 - t, cxs = this.cxs1, cys = this.cys1;
    return new Vector(
        tm*tm*cxs[0] + 2*tm*t*cxs[1] + t*t*cxs[2],
        tm*tm*cys[0] + 2*tm*t*cys[1] + t*t*cys[2]);
};

UnconstrainedFitter.prototype.secondDerivativeAt = function (p) {
    var t = p / this.pmax, tm = 1 - t, cxs = this.cxs2, cys = this.cys2;
    return new Vector(
        tm*cxs[0] + t*cxs[1],
        tm*cys[0] + t*cys[1]);
};

UnconstrainedFitter.prototype.improveDataParameters = function () {
    var i, l = this.xs.length;
    for (i = 0; i < l; ++i) {
        this.improveDataParameter(i);
    }
};

UnconstrainedFitter.prototype.improveDataParameter = function (i) {
    var x = this.xs[i], y = this.ys[i], t = this.ps[i] / this.pmax,
        Q = this.vectorAt(t),
        D = Q.minus(new Vector(x, y)),
        Qp = this.derivativeAt(t),
        Qpp = this.secondDerivativeAt(t),
        t1;

    t1 = t - D.dot(Qp) / (D.dot(Qpp) + Qp.dot(Qp));
    if (t1 >= 0 && t1 <= 1) {
        this.ps[i] = t1 * this.pmax;
    }
};

canvasController = {

    canvas: document.getElementById('canvas'),
    gc: null,
    vectors: null,
    fitter: null,
    tracking: false,

    init: function () {
        bindMethods(this);
        this.gc = this.canvas.getContext('2d');
        this.canvas.addEventListener('mousedown', this.mouseDown);
    },

    mouseVectorForEvent: function (event) {
        var c = this.canvas, cr = c.getBoundingClientRect();
        return new Vector(
            event.clientX - cr.left - c.clientLeft + .5,
            event.clientY - cr.top - c.clientTop + .5);
    },

    mouseDown: function (event) {
        if (this.tracking) {
            return;
        }

        document.addEventListener('mousemove', this.mouseDragged);
        document.addEventListener('mouseup', this.mouseUp);
        this.tracking = true;
        this.fitter = new UnconstrainedFitter();
        this.addPoint(this.mouseVectorForEvent(event));
    }.bindLater(),

    mouseDragged: function (event) {
        this.addPoint(this.mouseVectorForEvent(event));
    }.bindLater(),

    mouseUp: function (event) {
        document.removeEventListener('mousemove', this.mouseDragged);
        document.removeEventListener('mouseup', this.mouseUp);
        this.tracking = false;
    }.bindLater(),

    addPoint: function (point) {
        if (!this.pointIsWorthAdding(point))
            return;
        this.fitter.push(point.x, point.y);
        this.gc.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.gc.lineWidth = 1;
        this.drawPolyline('gray', 'black', this.fitter.xs, this.fitter.ys);

        this.fitter.fit();
        this.fitter.improveDataParameters();
        this.fitter.fit();

        this.drawPolyline('gray', 'gray', this.fitter.cxs, this.fitter.cys);
        this.drawConnectors();
        this.gc.lineWidth = 2;
        this.drawCubic('blue', this.fitter.cxs, this.fitter.cys);
    },

    pointIsWorthAdding: function (point) {
        if (this.fitter.xs.length === 0) {
            return true;
        }
        var dx = point.x - this.fitter.xs.last(), dy = point.y - this.fitter.ys.last();
        return dx*dx + dy*dy >= 4;
    },

    drawPoint: function (x, y) {
        this.gc.fillRect(x - 1.5, y - 1.5, 3, 3);
    },

    drawPolyline: function (lineColor, pointColor, xs, ys) {
        var gc = this.gc, i, l = xs.length;
        if (lineColor !== null) {
                gc.strokeStyle = lineColor;
            gc.beginPath();
            gc.moveTo(xs[0], ys[0]);
            for (i = 1; i < l; ++i) {
                gc.lineTo(xs[i], ys[i]);
            }
            gc.stroke();
        }

        if (pointColor != null) {
            gc.fillStyle = pointColor;
            for (i = 0; i < l; ++i) {
                this.drawPoint(xs[i], ys[i]);
            }
        }
    },

    drawCubic: function (color, cxs, cys) {
        var gc = this.gc;
        gc.strokeStyle = color;
        gc.beginPath();
        gc.moveTo(cxs[0], cys[0]);
        gc.bezierCurveTo(cxs[1], cys[1], cxs[2], cys[2], cxs[3], cys[3]);
        gc.stroke();
    },

    drawConnectors: function () {
        var gc = this.gc, fitter = this.fitter, xs = fitter.xs, ys = fitter.ys, ps = fitter.ps,
            i, l = xs.length, v;

        gc.fillStyle = 'red';
        gc.strokeStyle = 'red';
        gc.lineWidth = 1;
        for (i = 0; i < l; ++i) {
            v = fitter.vectorAt(ps[i]);
            this.drawPoint(v.x, v.y);
            gc.beginPath();
            gc.moveTo(v.x, v.y);
            gc.lineTo(xs[i], ys[i]);
            gc.stroke();
        }
    }

};

canvasController.init();


