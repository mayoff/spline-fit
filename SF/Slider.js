

SF.Slider = SC.View.extend({
    min: 0,
    max: 100,
    step: 1,
    value: undefined, // defaults to (min+max)/2

    classNames: ['sf-slider'],

    defaultTemplate: SC.Handlebars.compile('<input type="range" {{bindAttr min="min"}} {{bindAttr max="max"}} {{bindAttr step="step"}} {{bindAttr value="value"}}>'),

    init: function () {
        this._super();
        if (this.value === undefined)
            this.value = (this.min + this.max) / 2;
    },

    change: function () {
        SC.run.once(this, this._updateElementValue);
        return false;
    },

    _updateElementValue: function () {
        var input = this.$('input');
        this.value = input.prop('valueAsNumber');
    }

});

