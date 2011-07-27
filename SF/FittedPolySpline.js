

SF.FittedPolySpline = SC.Object.extend({

    /** pattern is the array of points through which the fitted polyspline should pass.  You provide this by sending me the addPatternPoint message repeatedly. */
    pattern: null, // Array

    init: function () {
        this.pattern = [];
    },

    addPatternPoint: function (point) {
        SC.beginPropertyChanges();
        this.pattern.pushObject(point);
        SC.endPropertyChanges();
    }

});

