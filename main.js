
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
    // vector (x[i], y[i]) is a data vector the curve must try to pass through.
    this.x = [];
    this.y = [];

    // d[i] is the sum f the straight-line distances between consecutive data vectors up to and including vector i.
    this.d = [];

    // dmax is sum of the straight-line distances between consecutive data vectors.
    this.dmax = 0.0;

    // vector (cx[i], cy[i]) is a control vector of the fitted Bezier cubic.
    this.cx = [];
    this.cy = [];

    // vector (cx1[i], cy1[i]) is a control vector of the first derivative of the fitted Bezier cubic.
    this.cx1 = [];
    this.cy1 = [];

    // vector (cx2[i], cy2[i]) is a control vector of the second derivative of the fitted Bezier cubic.
    this.cx2 = [];
    this.cy2 = [];
}

UnconstrainedFitter.prototype.push = function (x, y) {
    var dx, dy, d;
    if (this.x.length > 0) {
        dx = x - this.x.last();
        dy = y - this.y.last();
        d = Math.sqrt(dx*dx + dy*dy);
        this.d.push(this.d.last() + d);
    } else {
        this.d.push(0);
    }
    this.dmax = this.d.last();
    this.x.push(x);
    this.y.push(y);
};

UnconstrainedFitter.prototype.fit = function () {
    var x = this.x, y = this.y, l = x.length, u, i, d = this.d, dmax = this.dmax, cx, cy, cx1, cy1;

    if (l < 4) {
        // XXX Need a different method to fit the curve.
        return;
    }

    u = new Array(l);
    for (i = 0; i < l; ++i)
        { u[i] = d[i] / dmax; }

    cx = [ x[0], 0.0, 0.0, x.last() ];
    cy = [ y[0], 0.0, 0.0, y.last() ];

    this.fitAxis(x, u, cx);
    this.fitAxis(y, u, cy);

    this.cx = cx;
    this.cy = cy;

    cx1 = this.cx1 = [ cx[1]-cx[0], cx[2]-cx[1], cx[3]-cx[2] ];
    cy1 = this.cy1 = [ cy[1]-cy[0], cy[2]-cy[1], cy[3]-cy[2] ];

    this.cx2 = [ cx1[1] - cx1[0], cx1[2] - cx1[1] ];
    this.cy2 = [ cy1[1] - cy1[0], cy1[2] - cy1[1] ];
};

UnconstrainedFitter.prototype.fitAxis = function (x, u, cx) {
    var i, l = x.length, m00 = 0.0, m01 = 0.0, m10 = 0.0, m11 = 0.0, y0 = 0.0, y1 = 0.0, B0, B1, B2, B3, xi, ui, uim, cx0 = cx[0], cx3 = cx[3];

    for (i = 0; i < l; ++i) {
        xi = x[i];
        ui = u[i];
        uim = 1 - u[i];

        B0 = uim*uim*uim;
        B1 = 3*ui*uim*uim;
        B2 = 3*ui*ui*uim;
        B3 = ui*ui*ui;

        m00 += B1*B1;
        m01 += B1*B2;
        m10 += B1*B2;
        m11 += B2*B2;

        y0 += B1 * (xi - cx0 * B0 - cx3 * B3);
        y1 += B2 * (xi - cx0 * B0 - cx3 * B3);
    }

    cx[1] = (m11*y0 - m01*y1)/(m00*m11 - m01*m10);
    cx[2] = (m10*y0 - m00*y1)/(m01*m10 - m00*m11);
};

UnconstrainedFitter.prototype.vectorAt = function (t) {
    var tm = 1 - t, cx = this.cx, cy = this.cy;
    return new Vector(
        tm*tm*tm*cx[0] + 3*tm*tm*t*cx[1] + 3*tm*t*t*cx[2] + t*t*t*cx[3],
        tm*tm*tm*cy[0] + 3*tm*tm*t*cy[1] + 3*tm*t*t*cy[2] + t*t*t*cy[3]);
};

UnconstrainedFitter.prototype.derivativeAt = function (t) {
    var tm = 1 - t, cx = this.cx1, cy = this.cy1;
    return new Vector(
        tm*tm*cx[0] + 2*tm*t*cx[1] + t*t*cx[2],
        tm*tm*cy[0] + 2*tm*t*cy[1] + t*t*cy[2]);
};


UnconstrainedFitter.prototype.secondDerivativeAt = function (t) {
    var tm = 1 - t, cx = this.cx2, cy = this.cy2;
    return new Vector(
        tm*cx[0] + t*cx[1],
        tm*cy[0] + t*cy[1]);
};

UnconstrainedFitter.prototype.improveDataParameters = function () {
    var i, l = this.x.length;
    for (i = 0; i < l; ++i)
        { this.d[i] = this.dmax * this.improveDataParameter(this.x[i], this.y[i], this.d[i] / this.dmax); }
};

UnconstrainedFitter.prototype.improveDataParameter = function (x, y, t) {
    var Q = this.vectorAt(t),
        D = Q.minus(new Vector(x, y)),
        Qp = this.derivativeAt(t),
        Qpp = this.secondDerivativeAt(t);

    return t - D.dot(Qp) / (D.dot(Qpp) + Qp.dot(Qp));
};

canvasController = {

    canvas: document.getElementById('canvas'),
    gc: null,
    vectors: null,
    fitter: null,

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
        document.addEventListener('mousemove', this.mouseDragged);
        document.addEventListener('mouseup', this.mouseUp);

        this.gc.strokeStyle = 'black';
        this.gc.lineWidth = 1;
        this.gc.lineCap = 'round';
        this.gc.fillStyle = 'red';

        this.fitter = new UnconstrainedFitter();
        this.startSegment(this.mouseVectorForEvent(event));
    }.bindLater(),

    mouseDragged: function (event) {
        var p = this.mouseVectorForEvent(event),
            dx = p.x - this.fitter.x.last(),
            dy = p.y - this.fitter.y.last();

        if (dx*dx + dy*dy < 1000)
            return;

        this.endSegment(p);
        this.startSegment(p);
    }.bindLater(),

    mouseUp: function (event) {
        document.removeEventListener('mousemove', this.mouseDragged);
        document.removeEventListener('mouseup', this.mouseUp);

        var fitter = this.fitter, x, y, d, dmax, cx, cy, gc = this.gc, i, l, p;

        fitter.fit();
        x = fitter.x;
        y = fitter.y;
        d = fitter.d;
        dmax = fitter.dmax;
        cx = fitter.cx;
        cy = fitter.cy;
        l = x.length;

        gc.clearRect(0, 0, this.canvas.width, this.canvas.height);

        gc.strokeStyle = 'black';
        gc.lineWidth = 1;
        gc.beginPath();
        gc.moveTo(x[0], y[0]);
        for (i = 1; i < l; ++i)
            { gc.lineTo(x[i], y[i]); }
        gc.stroke();

        gc.strokeStyle = 'blue';
        gc.beginPath();
        gc.moveTo(cx[0], cy[0]);
        gc.bezierCurveTo(cx[1], cy[1], cx[2], cy[2], cx[3], cy[3]);
        gc.stroke();

        gc.strokeStyle = 'grey';
        gc.beginPath();
        gc.moveTo(cx[0], cy[0]);
        for (i = 1; i < 4; ++i)
            { gc.lineTo(cx[i], cy[i]); }
        gc.stroke();

        gc.fillStyle = 'red';
        gc.strokeStyle = 'red';
        for (i = 0; i < l; ++i) {
            gc.fillRect(x[i] - 1.5, y[i] - 1.5, 3, 3);
            p = fitter.vectorAt(d[i] / dmax);
            gc.fillRect(p.x - 1.5, p.y - 1.5, 3, 3);
            gc.beginPath();
            gc.moveTo(x[i], y[i]);
            gc.lineTo(p.x, p.y);
            gc.stroke();
        }

        fitter.improveDataParameters();
        gc.fillStyle = 'green';
        gc.strokeStyle = 'green';
        for (i = 0; i < l; ++i) {
            p = fitter.vectorAt(d[i] / dmax);
            gc.fillRect(p.x - 1.5, p.y - 1.5, 3, 3);
            gc.beginPath();
            gc.moveTo(x[i], y[i]);
            gc.lineTo(p.x, p.y);
            gc.stroke();
        }
    }.bindLater(),

    startSegment: function (vector) {
        var gc = this.gc;
        gc.fillRect(vector.x - 1.5, vector.y - 1.5, 3, 3);
        gc.beginPath();
        gc.moveTo(vector.x, vector.y);
        this.fitter.push(vector.x, vector.y);
    },

    endSegment: function (vector) {
        var gc = this.gc;
        gc.lineTo(vector.x, vector.y);
        gc.stroke();
    }

};

canvasController.init();


