

SF.FitterPanel = SC.View.extend({

    controller: null, // SF.CanvasController
    modelBinding: 'controller.model', // SF.FittedPolySpline
    canvas: null,

    _tracking: false, // true if I saw mouse button 1 pressed and installed mousemove/mouseup handlers

    init: function () {
        var self = this;
        'mousedownHandler mousemoveHandler mouseupHandler'.w().forEach(function (key) {
            var fn = self[key];
            self[key] = function (event) {
                return SC.run(self, fn, event);
            };
        });

        this._super();
        this.controller = SF.FitterController.create({ view: this });
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
        if (this._tracking || event.button !== 0) {
            return true;
        }
        document.addEventListener('mousemove', this.mousemoveHandler, true);
        document.addEventListener('mouseup', this.mouseupHandler, true);
        this._tracking = true;
        this.controller.beginPattern();
        this.controller.addPatternPoint(this._vectorForEvent(event));
        return false;
    },

    mousemoveHandler: function (event) {
        if (!this._tracking) {
            return true;
        }
        this.controller.addPatternPoint(this._vectorForEvent(event));
        return false;
    },

    mouseupHandler: function (event) {
        if (event.button !== 0) {
            return true;
        }
        document.removeEventListener('mousemove', this.mousemoveHandler, true);
        document.removeEventListener('mouseup', this.mouseupHandler, true);
        if (this._tracking) {
            this._tracking = false;
        }
        this.controller.endPattern();
        return false;
    }

});

