

SF.Vector = function (x, y) {
    this.x = x;
    this.y = y;
    Object.freeze(this);
}

SF.Vector.prototype.plus = function (rhs) {
    return new SF.Vector(this.x + rhs.x, this.y + rhs.y);
};

SF.Vector.prototype.minus = function (rhs) {
    return new SF.Vector(this.x - rhs.x, this.y - rhs.y);
};

SF.Vector.prototype.times = function (rhs) {
    return new SF.Vector(this.x * rhs, this.y * rhs);
};

SF.Vector.prototype.dot = function (rhs) {
    return this.x * rhs.x + this.y * rhs.y;
};

SF.Vector.prototype.norm = function () {
    return Math.sqrt(this.x * this.x + this.y * this.y);
};

SF.Vector.prototype.toUnit = function () {
    var norm = this.norm();
    return new SF.Vector(this.x / norm, this.y / norm);
};

/** Return a vector perpendicular to myself by rotating myself clockwise by 90 degrees. */
SF.Vector.prototype.perp = function () {
    return new SF.Vector(this.y, -this.x);
};

