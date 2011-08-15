

(function () {

function moveTo(gc, p) { gc.moveTo(p.x, p.y); }
function lineTo(gc, p) { gc.lineTo(p.x, p.y); }
function bezierCurveTo(gc, c1, c2, c3) {
    gc.bezierCurveTo(c1.x, c1.y, c2.x, c2.y, c3.x, c3.y);
}
function circle(gc, p, r) { gc.arc(p.x, p.y, r, 0, Math.TWO_PI); }

SF.FitterPanel = SC.View.extend({

    tagName: 'COVER',
    classNames: 'fitter-panel',

    controller: null, // SF.CanvasController
    modelBinding: 'controller.model', // SF.FittedPolySpline
    canvas: null, // HTMLCanvasElement
    gc: function () {
        return this.canvas ? this.canvas.getContext('2d') : null;
    }.property('canvas').cacheable(),

    shouldDrawPattern: true,
    shouldDrawControlPolygon: true,
    shouldDrawPolySpline: true,
    shouldDrawCorrespondences: true,

    pointSize: 4,

    patternPointMinDistance: null,

    _needsDisplay: false,

    _tracking: false, // true if I saw mouse button 1 pressed and installed mousemove/mouseup handlers

    init: function () {
        var self = this;
        'mousedownHandler mousemoveHandler mouseupHandler'.w().forEach(function (key) {
            var fn = self[key];
            self[key] = function (event) {
                return SC.run(self, fn, event);
            };
        });

        'shouldDrawPattern shouldDrawControlPolygon shouldDrawPolySpline shouldDrawCorrespondences *model.pattern.[] *model.controls.[] *model.parameters.[]'.w().forEach(function (key)
        {
            SC.addObserver(self, key, self, self.setNeedsDisplay);
        });

        this.patternPointMinDistance = 2;

        this._super();
        this.controller = SF.FitterController.create({ view: this });
    },

    willInsertElement: function () {
        this.canvas = this.$('.fitter-canvas')[0];
        this.canvas.addEventListener('mousedown', this.mousedownHandler, false);
    },

    _vectorForEvent: function (event) {
        var c = this.canvas, cr = c.getBoundingClientRect();
        return new SF.Vector(
            event.clientX - cr.left - c.clientLeft + .5,
            event.clientY - cr.top - c.clientTop + .5);
    },

    mousedownHandler: function (event) {
        if (this._tracking || event.button !== 0)
            return true;
        document.addEventListener('mousemove', this.mousemoveHandler, true);
        document.addEventListener('mouseup', this.mouseupHandler, true);
        this._tracking = true;
        this.controller.beginPattern();
        this.controller.addPatternPoint(this._vectorForEvent(event));
        return false;
    },

    mousemoveHandler: function (event) {
        if (!this._tracking)
            return true;
        this.controller.addPatternPoint(this._vectorForEvent(event));
        return false;
    },

    mouseupHandler: function (event) {
        if (event.button !== 0)
            return true;
        document.removeEventListener('mousemove', this.mousemoveHandler, true);
        document.removeEventListener('mouseup', this.mouseupHandler, true);
        if (this._tracking)
            this._tracking = false;
        this.controller.endPattern();
        return false;
    },

    setNeedsDisplay: function () {
        if (this._needsDisplay)
            return;
        this._needsDisplay = true;
        SC.run.schedule('actions', this, this._redisplay);
    },

    _redisplay: function () {
        if (!this._needsDisplay)
            return;
        this._needsDisplay = false;

        this.gc.clearRect(0, 0, this.canvas.width, this.canvas.height);

        if (!this.model || this.model.pattern.length < 1)
            return;

        if (this.shouldDrawControlPolygon)
            this._drawControlPolygon();
        if (this.shouldDrawPattern)
            this._drawPattern();
        if (this.shouldDrawPolySpline)
            this._drawPolySpline();
        if (this.shouldDrawCorrespondences)
            this._drawCorrespondences();
    },

    _drawPattern: function () {
        var gc = this.gc;
        gc.lineWidth = 1;
        gc.strokeStyle = '#ccc';
        this._drawPolyLine(this.model.pattern);
        gc.fillStyle = 'black';
        this._drawPoints(this.model.pattern);
    },

    _drawControlPolygon: function () {
        var model = this.model, gc = this.gc;
        gc.lineWidth = 1;
        gc.strokeStyle = 'gray';
        gc.beginPath();
        moveTo(gc, model.pattern[0]);
        model.forEachSpline(function (spline) {
            lineTo(gc, spline.c1);
            lineTo(gc, spline.c2);
            lineTo(gc, spline.c3);
        }, this);
        gc.stroke();
        gc.fillStyle = 'gray';
        this._drawPoint(model.pattern[0]);
        model.forEachSpline(function (spline) {
            this._drawHollowPoint(spline.c1);
            this._drawHollowPoint(spline.c2);
            this._drawPoint(spline.c3);
        }, this);
    },

    _drawCorrespondences: function () {
        var gc = this.gc, model = this.model, ps = model.pattern, us = model.parameters, i, l = ps.length;
        gc.lineWidth = 1;
        gc.strokeStyle = 'red';
        for (i = 0; i < l; ++i) {
            gc.beginPath();
            moveTo(gc, ps[i]);
            lineTo(gc, model.vectorAt(us[i]));
            gc.stroke();
        }
    },

    _drawPolySpline: function () {
        var gc = this.gc;
        gc.lineWidth = 1;
        gc.strokeStyle = 'blue';
        gc.beginPath();
        moveTo(gc, this.model.pattern[0]);
        this.model.forEachSpline(function (spline) {
            bezierCurveTo(gc, spline.c1, spline.c2, spline.c3);
        }, this);
        gc.stroke();
    },

    _drawPolyLine: function (points) {
        var i, l = points.length, gc = this.gc;
        gc.beginPath();
        moveTo(gc, points[0]);
        for (i = 1; i < l; ++i)
            lineTo(gc, points[i]);
        gc.stroke();
    },

    _drawPoints: function (points) {
        this.model.pattern.forEach(function (point) { this._drawPoint(point); }, this);
    },

    _drawPoint: function (point) {
        var gc = this.gc;
        gc.beginPath();
        circle(gc, point, this.pointSize / 2);
        gc.fill();
    },

    _drawHollowPoint: function (point) {
        var gc = this.gc;
        gc.beginPath();
        circle(gc, point, this.pointSize / 2);
        gc.fill();
        gc.save();
            gc.fillStyle = 'white';
            gc.beginPath();
            circle(gc, point, this.pointSize / 2 - 1);
            gc.fill();
        gc.restore();
    }

});

})();

