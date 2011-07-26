

SF = SC.Application.create({
    canvasController: null,

    ready: function () {
        this._super();
        this.canvasController = SF.CanvasController.create();
    }
});


