

SF.FitterController = SC.Object.extend({

    view: null, // SF.FitterPanel
    model: null, // SF.FittedPolySpline
    canvasBinding: 'view.canvas', // HTMLCanvasElement
    gc: function () {
        return this.canvas ? this.canvas.getContext('2d') : null;
    }.property('canvas').cacheable(),
    vectors: null,
    tracking: false,

    _allPoints: null,

    init: function () {
        var self = this;
        this.model = SF.FittedPolySpline.create();
        SC.addObserver(this, '*view.patternPointMinDistance', this, this.patternPointMinDistanceDidChange);
    },

    beginPattern: function () {
        this.model.reset();
        this._allPoints = [];
    },

    endPattern: function () { },

    addPatternPoint: function (point) {
        this._allPoints.push(point);

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
    },

    patternPointMinDistanceDidChange: function () {
        if (!this._allPoints || !this._allPoints.length)
            return;
        SC.beginPropertyChanges();
        this.model.reset();
        this._allPoints.forEach(function (point) {
            if (!this.pointIsWorthAdding(point))
                return;
            this.model.addPatternPoint(point);
        }, this);
        SC.endPropertyChanges();
    }

});

