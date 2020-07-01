sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/Device",
	"test/SelfMonitor/model/Models"
], function (UIComponent, Device, Models) {
	"use strict";

	return UIComponent.extend("test.SelfMonitor.Component", {

		metadata: {
			manifest: "json"
		},

		/**
		 * The component is initialized by UI5 automatically during the startup of the app and calls the init method once.
		 * @public
		 * @override
		 */
		init: function () {
			// Call the init function of the parent
            UIComponent.prototype.init.apply(this, arguments);

            // Load custom fonts for custom icons
            jQuery.sap.require("test.SelfMonitor.fonts.bootstrap-fonts");

            // Create the views based on the url/hash
            this.getRouter().initialize();

            // Initialize all models on the component so they are available centrally
            this.setModel(Models.getDeviceModel(), "device");
            this.setModel(Models.getViewModel(), "view");
            this.setModel(Models.getWorkflowDefinitionsModel(), "wfds");
            this.setModel(Models.getWorkflowDefinitionModel(), "wfd");
            this.setModel(Models.getWorkflowInstancesModel(), "wfis");
            this.setModel(Models.getWorkflowInstanceModel(), "wfi");
            this.setModel(Models.getWorkflowInstanceContextModel(), "wfictx");
            this.setModel(Models.getWorkflowInstanceErrorsModel(), "wfierr");
            this.setModel(Models.getWorkflowInstanceExecutionLogsModel(), "wfilog");
            this.setModel(Models.getWorkflowTasksModel(), "wftis");
            this.setModel(Models.getWorkflowTaskModel(), "wfti");

            // Navigate to targets based on actions in intents if running in FLP
            var urlSvc = sap.ushell && sap.ushell.Container && sap.ushell.Container.getService &&
                sap.ushell.Container.getService("URLParsing");
            if (urlSvc) {
                var hash = urlSvc.parseShellHash(window.location.hash) || {};
                var action = hash.action || "DisplayInstances";
                var appSpecificRoute = hash.appSpecificRoute;

                if (appSpecificRoute) {
                    return;
                }

                if (action === "DisplayDefinitions") {
                    this.getRouter().navTo("workflowDefinitions", null, true);
                } else {
                    this.getRouter().navTo("workflowInstances", null, true);
                }
            } else if (!window.location.hash) {
                this.getRouter().navTo("workflowInstances", null, true);
            }
        }
	});
});