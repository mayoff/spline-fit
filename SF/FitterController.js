

SF.FitterController = SC.Object.extend({

    view: null, // SF.FitterPanel
    model: null, // SF.FittedPolySpline
    canvasBinding: 'view.canvas', // HTMLCanvasElement
    gc: function () {
        return this.canvas ? this.canvas.getContext('2d') : null;
    }.property('canvas').cacheable(),
    vectors: null,
    tracking: false,

    init: function () {
        this.model = SF.FittedPolySpline.create();
    },

    beginPattern: function () {
        this.model.reset();
    },

    endPattern: function () { },

    addPatternPoint: function (point) {
        if (!this.pointIsWorthAdding(point))
            return;

        this.model.addPatternPoint(point);
    },

    pointIsWorthAdding: function (point) {
        var pattern = this.model.pattern;
        if (pattern.length === 0) {
            return true;
        }
        return point.minus(pattern.last).norm() >= this.view.patternPointMinDistance;
    }

});

