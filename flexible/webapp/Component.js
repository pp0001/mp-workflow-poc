sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/Device",
	"com/flexible/flexible/model/models",
	"sap/ui/model/json/JSONModel",
	"sap/f/FlexibleColumnLayoutSemanticHelper"
], function (UIComponent, Device, models, JSONModel, FlexibleColumnLayoutSemanticHelper) {
	"use strict";

	return UIComponent.extend("com.flexible.flexible.Component", {

		metadata: {
			manifest: "json"
		},

		/**
		 * The component is initialized by UI5 automatically during the startup of the app and calls the init method once.
		 * @public
		 * @override
		 */
		init: function () {
			// call the base component's init function
			UIComponent.prototype.init.apply(this, arguments);

			// get task id
			var startupParameters = this
				.getComponentData().startupParameters;
			var taskModel = startupParameters.taskModel;
			var queryParameters = startupParameters.oParameters.oQueryParameters;
			var taskType = queryParameters.task[0];
			var taskData = taskModel.getData();
			var taskId = taskData.InstanceID;
			this.setModel(new sap.ui.model.json.JSONModel(taskData), "taskModel");
			
			//get context model
			var contextModel = new sap.ui.model.json.JSONModel(
				"/comflexibleflexible/bpmworkflowruntime/v1/task-instances/" + taskId + "/context");
			var contextData = contextModel.getData();
			contextModel.setData(contextData);
			contextModel.setDefaultBindingMode(sap.ui.model.BindingMode.OneWay);
			this.setModel(contextModel, "contextModel");

			// enable routing
			this.getRouter().initialize();

			// set the device model
			this.setModel(models.createDeviceModel(), "device");

			var oModel = new JSONModel();
			this.setModel(oModel, "flexibleColumnLayoutConfig");
		},

		/**
		 * Returns an instance of the semantic helper
		 * @returns {sap.f.FlexibleColumnLayoutSemanticHelper} An instance of the semantic helper
		 */
		getHelper: function () {
			var oFCL = this.getRootControl().byId("FlexibleColumnLayout"),
				oParams = jQuery.sap.getUriParameters(),
				oSettings = {
					defaultTwoColumnLayoutType: sap.f.LayoutType.TwoColumnsMidExpanded,
					defaultThreeColumnLayoutType: sap.f.LayoutType.ThreeColumnsMidExpanded,
					mode: oParams.get("mode"),
					initialColumnsCount: oParams.get("initial"),
					maxColumnsCount: oParams.get("max")
				};

			return FlexibleColumnLayoutSemanticHelper.getInstanceFor(oFCL, oSettings);
		}
	});
});