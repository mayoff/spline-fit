

SF.Vector = function (x, y) {
    this.x = x;
    this.y = y;
}

SF.Vector.prototype.minus = function (rhs) {
    return new SF.Vector(this.x - rhs.x, this.y - rhs.y);
};

SF.Vector.prototype.dot = function (rhs) {
    return this.x * rhs.x + this.y * rhs.y;
};

