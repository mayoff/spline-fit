

SF.CanvasController = SC.Object.extend({

    model: null, // SF.FittedPolySpline
    view: null,
    canvasBinding: 'view.element',
    gc: function () {
        return this.canvas ? this.canvas.getContext('2d') : null;
    }.property('canvas').cacheable(),
    vectors: null,
    fitter: null,
    tracking: false,

    init: function () {
    },

    mouseVectorForEvent: function (event) {
        var c = this.canvas, cr = c.getBoundingClientRect();
        return new SF.Vector(
            event.clientX - cr.left - c.clientLeft + .5,
            event.clientY - cr.top - c.clientTop + .5);
    },

    on_mousedown: function (vector) {
        this.fitter = new SF.UnconstrainedFitter();
        this.model = SF.FittedPolySpline.create();
        this.addPoint(vector);
    },

    on_mousedrag: function (vector) {
        this.addPoint(vector);
    },

    on_mouseup: function (event) {
    },

    addPoint: function (point) {
        if (!this.pointIsWorthAdding(point))
            return;

        this.model.addPatternPoint(point);

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
        var dx = point.x - this.fitter.xs.last, dy = point.y - this.fitter.ys.last;
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

});

