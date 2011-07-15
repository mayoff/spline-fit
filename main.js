
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

function Point(x, y) {
    this.x = x;
    this.y = y;
}

/**
    ##Point.interpolate

    <c>Point.interpolate(<v>point0</v>, <v>weight0</v>, <v>point1</v>, <v>weight1</v>, ...) ⇒ <v>interpolatedPoint</v></c>

    <v>interpolatedPoint</v> is the weighted sum of the input points.
*/
Point.interpolate = function () {
    var i, l = arguments.length, totalWeight = 0, x = 0, y = 0, point, weight;
    for (i = 0; i < l; i += 2) {
        point = arguments[i];
        weight = arguments[i+1];
        x += point.x * weight;
        y += point.y * weight;
        totalWeight += weight;
    }
    return new Point(x / totalWeight, y / totalWeight);
};

function Fitter() {
    // point (x[i], y[i]) is a data point the curve must try to pass through.
    this.x = [];
    this.y = [];

    // d[i] is the sum f the straight-line distances between consecutive data points up to and including point i.
    this.d = [];

    // dmax is sum of the straight-line distances between consecutive data points.
    this.dmax = 0.0;

    // point (cx[i], cy[i]) is a control point of the fitted Bezier cubics.
    this.cx = [];
    this.cy = [];
}

Fitter.prototype.push = function (x, y) {
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

Fitter.prototype.fit = function () {
    var x = this.x, y = this.y, l = x.length, u, i, d = this.d, dmax = this.dmax, cx, cy;

    if (l < 4) {
        // XXX Need a different method to fit the curve.
        return;
    }

    u = new Array(l);
    for (i = 0; i < l; ++i)
        { u[i] = d[i] / dmax; }

    cx = [ x[0], 0.0, 0.0, x.last() ];
    cy = [ y[0], 0.0, 0.0, y.last() ];

    this._fitCubic1D(x, u, cx);
    this._fitCubic1D(y, u, cy);

    this.cx = cx;
    this.cy = cy;
};

Fitter.prototype._fitCubic1D = function (x, u, cx) {
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

canvasController = {

    canvas: document.getElementById('canvas'),
    gc: null,
    points: null,
    fitter: null,

    init: function () {
        bindMethods(this);
        this.gc = this.canvas.getContext('2d');
        this.canvas.addEventListener('mousedown', this.mouseDown);
    },

    mousePointForEvent: function (event) {
        var c = this.canvas, cr = c.getBoundingClientRect();
        return new Point(
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

        this.fitter = new Fitter();
        this.startSegment(this.mousePointForEvent(event));
    }.bindLater(),

    mouseDragged: function (event) {
        var p = this.mousePointForEvent(event);
        this.endSegment(p);
        this.startSegment(p);
    }.bindLater(),

    mouseUp: function (event) {
        document.removeEventListener('mousemove', this.mouseDragged);
        document.removeEventListener('mouseup', this.mouseUp);

        var fitter = this.fitter, cx, cy, gc = this.gc;

        fitter.fit();
        cx = fitter.cx;
        cy = fitter.cy;

        gc.strokeStyle = 'blue';
        gc.lineWidth = 2;
        gc.beginPath();
        gc.moveTo(cx[0], cy[0]);
        gc.bezierCurveTo(cx[1], cy[1], cx[2], cy[2], cx[3], cy[3]);
        gc.stroke();
    }.bindLater(),

    startSegment: function (point) {
        var gc = this.gc;
        gc.fillRect(point.x - 1.5, point.y - 1.5, 3, 3);
        gc.beginPath();
        gc.moveTo(point.x, point.y);
        this.fitter.push(point.x, point.y);
    },

    endSegment: function (point) {
        var gc = this.gc;
        gc.lineTo(point.x, point.y);
        gc.stroke();
    }

};

canvasController.init();


