sap.ui.require(["sap/ui/core/IconPool"], function(IconPool) {
    "use strict";

    var sFontsDirectory = jQuery.sap.getModulePath("test.SelfMonitor.fonts") + "/";
    var $element = document.createElement("link");
    $element.setAttribute("rel", "stylesheet");
    $element.setAttribute("type", "text/css");
    $element.setAttribute("href", sFontsDirectory + "fonts.css");
    document.getElementsByTagName("head")[0].appendChild($element);

    IconPool.addIcon("userTask", "workflow", "SAP-icons-TNT", "e015");
    IconPool.addIcon("scriptTask", "workflow", "SAP-icons-TNT", "e021");
    IconPool.addIcon("messageEvent", "workflow", "SAP-icons-TNT", "e018");
    IconPool.addIcon("cancelingBoundaryTimerEvent", "workflow", "SAP-icons-TNT", "e038");
    IconPool.addIcon("nonCancelingBoundaryTimerEvent", "workflow", "SAP-icons-TNT", "e039");
    IconPool.addIcon("intermediateTimerEvent", "workflow", "SAP-icons-TNT", "e038");
    IconPool.addIcon("parallelGateway", "workflow", "SAP-icons-TNT", "e034");
    IconPool.addIcon("exclusiveGateway", "workflow", "SAP-icons-TNT", "e035");
});