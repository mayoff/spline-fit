
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

Fitter = {
    fitCubicToPoints: function (points) {
        if (points.length < 2) {
            return points;
        } else if (points.length == 2) {
            return [
                points[0],
                Point.interpolate(points[0], 2, points[1], 1),
                Point.interpolate(points[0], 1, points[1], 2),
                points[1]
            ];
        }

        var cubicPoints = points.concat();
        while (cubicPoints.length % 3 != 1) {
            cubicPoints.push(points[points.length - 1]);
        }
        return cubicPoints;
    }
};

canvasController = {

    canvas: document.getElementById('canvas'),
    gc: null,
    points: null,

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

        this.points = [];
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

        var cubicPoints = Fitter.fitCubicToPoints(this.points);
        this.drawCubic(cubicPoints);
    }.bindLater(),

    startSegment: function (point) {
        var gc = this.gc;
        gc.fillRect(point.x - 1.5, point.y - 1.5, 3, 3);
        gc.beginPath();
        gc.moveTo(point.x, point.y);

        this.points.push(point);
    },

    endSegment: function (point) {
        var gc = this.gc;
        gc.lineTo(point.x, point.y);
        gc.stroke();
    },

    drawCubic: function (points) {
        var gc = this.gc, l, i;
        gc.strokeStyle = 'blue';
        gc.lineWidth = 2;
        gc.beginPath();
        gc.moveTo(points[0].x, points[0].y);
        for (i = 1, l = points.length; i < l; i += 3) {
            gc.bezierCurveTo(points[i].x, points[i].y, points[i+1].x, points[i+1].y, points[i+2].x, points[i+2].y);
        }
        gc.stroke();
    }

};

canvasController.init();


