

SF.SplineCanvas = SC.View.extend({
    tagName: 'canvas',
    attributeBindings: [ 'width', 'height' ],
    controller: null,
    modelBinding: '*controller.model',
    _tracking: false,

    init: function () {
        this._super();
        var self = this;
        ['on_mousedown', 'on_mousedrag', 'on_mouseup'].forEach(function (key) {
            var fn = self[key];
            self[key] = function (event) {
                return SC.run(self, fn, event);
            };
        });
    },

    willInsertElement: function () {
        this._super();
        this.controller.set('view', this);
        this.addObserver('*model.pattern.[]', this, this.patternDidChange);
        this.element.addEventListener('mousedown', this.on_mousedown);
    },

    _vectorForEvent: function (event) {
        var c = this.element, cr = c.getBoundingClientRect();
        return new SF.Vector(
            event.clientX - cr.left - c.clientLeft + .5,
            event.clientY - cr.top - c.clientTop + .5);
    },

    on_mousedown: function (event) {
        if (this._tracking || event.button !== 0) {
            return true;
        }
        document.addEventListener('mousemove', this.on_mousedrag, true);
        document.addEventListener('mouseup', this.on_mouseup, true);
        this._tracking = true;
        this.controller.on_mousedown(this._vectorForEvent(event));
        return false;
    },

    on_mousedrag: function (event) {
        if (!this._tracking) {
            return true;
        }
        this.controller.on_mousedrag(this._vectorForEvent(event));
        return false;
    },

    on_mouseup: function (event) {
        if (event.button !== 0) {
            return true;
        }
        document.removeEventListener('mousemove', this.on_mousedrag, true);
        document.removeEventListener('mouseup', this.on_mouseup, true);
        if (this._tracking) {
            this._tracking = false;
            this.controller.on_mouseup(this._vectorForEvent(event));
        }
        return false;
    },

    patternDidChange: function () {
        console.log('patternDidChange', this, arguments);
    }

});

