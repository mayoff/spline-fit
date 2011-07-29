

SF.FitterPanel = SC.View.extend({

    tagName: 'COVER',
    classNames: 'fitter-panel',

    controller: null, // SF.CanvasController
    modelBinding: 'controller.model', // SF.FittedPolySpline
    canvas: null, // HTMLCanvasElement
    gc: function () {
        return this.canvas ? this.canvas.getContext('2d') : null;
    }.property('canvas').cacheable(),

    shouldDrawPattern: (function () {
        var value = true;
        return function (key, newValue) {
            if (newValue !== undefined && newValue !== value) {
                value = newValue;
                this.setNeedsDisplay();
            }
            return value;
        };
    })().property().cacheable(),

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

        this.patternPointMinDistance = 2;

        this._super();
        this.controller = SF.FitterController.create({ view: this });
        SC.addObserver(this, '*model.pattern.[]', this, this.setNeedsDisplay);
    },

    patternLengthBinding: '*model.pattern.length',

    patternLengthString: function () {
        return (this.patternLength === 1) ? '1 point' : (+this.patternLength + ' points');
    }.property('patternLength'),

    willInsertElement: function () {
        this.canvas = this.$('.fitter-canvas')[0];
        this.canvas.addEventListener('mousedown', this.mousedownHandler);
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

        var gc = this.gc;
        gc.clearRect(0, 0, this.canvas.width, this.canvas.height);

        if (this.model) {
            if (this.shouldDrawPattern)
                this._drawPattern(gc);
        }

        this._needsDisplay = false;
    },

    _drawPattern: function (gc) {
        gc.lineWidth = 1;
        gc.strokeStyle = '#ccc';
        this._drawPolyLine(gc, this.model.pattern);
        gc.fillStyle = 'black';
        this._drawPoints(gc, 3, this.model.pattern);
    },

    _drawPolyLine: function (gc, points) {
        var i, l = points.length;
        gc.beginPath();
        gc.moveTo(points[0].x, points[0].y);
        for (i = 1; i < l; ++i)
            gc.lineTo(points[i].x, points[i].y);
        gc.stroke();
    },

    _drawPoints: function (gc, size, points) {
        var i, l = points.length, halfSize = size / 2;
        for (i = 0; i < l; ++i)
            gc.fillRect(points[i].x - halfSize, points[i].y - halfSize, size, size);
    }

});

