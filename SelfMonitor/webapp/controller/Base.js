sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/UIComponent",
    "test/SelfMonitor/utils/Formatter"
], function(Controller, UIComponent, Formatter) {
    "use strict";

    return Controller.extend("test.SelfMonitor.controller.Base", {

        formatter: Formatter,

        _getRouter: function() {
            return UIComponent.getRouterFor(this);
        }

    });
});