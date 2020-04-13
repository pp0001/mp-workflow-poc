sap.ui.define([
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/mvc/Controller"
], function (JSONModel, Controller) {
	"use strict";

	return Controller.extend("com.flexible.flexible.controller.Third", {
		onInit: function () {
			this.oRouter = this.getOwnerComponent().getRouter();
			
			this.oFlexibleModel = this.getOwnerComponent().getModel("flexibleColumnLayoutConfig");
			this.instanceId = this.getOwnerComponent().getModel("taskModel").getData().InstanceID;

		},
		handleFullScreen: function () {
			var sNextLayout = this.oFlexibleModel.getProperty("/actionButtonsInfo/endColumn/fullScreen");
			this.oFlexibleModel.setProperty("/layout", sNextLayout);
			this._updateUIElements(this.getOwnerComponent());
			this.oRouter.navTo("third", {
				instanceId: this.instanceId
			});
		},
		handleExitFullScreen: function () {
			var sNextLayout = this.oFlexibleModel.getProperty("/actionButtonsInfo/endColumn/exitFullScreen");
			this.oFlexibleModel.setProperty("/layout", sNextLayout);
			this._updateUIElements(this.getOwnerComponent());
			this.oRouter.navTo("third", {
				instanceId: this.instanceId
			});
		},
		handleClose: function () {
			var sNextLayout = this.oFlexibleModel.getProperty("/actionButtonsInfo/endColumn/closeColumn");
			this.oFlexibleModel.setProperty("/layout", sNextLayout);
			this.oRouter.navTo("master1", {
				instanceId: this.instanceId
			});
		},
		_updateUIElements: function (oComponent) {
			var oUIState = oComponent.getHelper().getCurrentUIState();
			this.oFlexibleModel.setData(oUIState);
		}
	});
});