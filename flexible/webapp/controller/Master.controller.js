sap.ui.define([
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	'sap/ui/model/Sorter',
	'sap/m/MessageBox'
], function (JSONModel, Controller, Filter, FilterOperator, Sorter, MessageBox) {
	"use strict";

	return Controller.extend("com.flexible.flexible.controller.Master", {
		onInit: function () {
			this.oRouter = this.getOwnerComponent().getRouter();
			
			this.instanceId = this.getOwnerComponent().getModel("taskModel").getData().InstanceID;
		},
		handleAboutPress: function (oEvent) {
			this.oFlexibleModel = this.getOwnerComponent().getModel("flexibleColumnLayoutConfig");
			this.oFlexibleModel.setProperty("/layout", this.getOwnerComponent().getHelper().getNextUIState(1).layout);
			this.oRouter.navTo("detail", {
				instanceId: this.instanceId
			});
		}
	});
});