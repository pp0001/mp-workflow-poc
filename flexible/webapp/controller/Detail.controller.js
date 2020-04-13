sap.ui.define([
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/mvc/Controller"
], function (JSONModel, Controller) {
	"use strict";

	return Controller.extend("com.flexible.flexible.controller.Detail", {
		onInit: function () {
			this.oRouter = this.getOwnerComponent().getRouter();
			
			this.oFlexibleModel = this.getOwnerComponent().getModel("flexibleColumnLayoutConfig");
			this.instanceId = this.getOwnerComponent().getModel("taskModel").getData().InstanceID;

		},
		handleFullScreen: function () {
			var sNextLayout = this.oFlexibleModel.getProperty("/actionButtonsInfo/midColumn/fullScreen");
			this.oFlexibleModel.setProperty("/layout", sNextLayout);
			this._updateUIElements(this.getOwnerComponent());
			this.oRouter.navTo("detail", {
				instanceId: this.instanceId
			});
		},
		handleExitFullScreen: function () {
			var sNextLayout = this.oFlexibleModel.getProperty("/actionButtonsInfo/midColumn/exitFullScreen");
			this.oFlexibleModel.setProperty("/layout", sNextLayout);
			this._updateUIElements(this.getOwnerComponent());
			this.oRouter.navTo("detail", {
				instanceId: this.instanceId
			});
		},
		handleClose: function () {
			var sNextLayout = this.oFlexibleModel.getProperty("/actionButtonsInfo/midColumn/closeColumn");
			this.oFlexibleModel.setProperty("/layout", sNextLayout);
			this.oRouter.navTo("master1", {
				instanceId: this.instanceId
			});
		},
		_updateUIElements: function (oComponent) {
			var oUIState = oComponent.getHelper().getCurrentUIState();
			this.oFlexibleModel.setData(oUIState);
		},
		handleAboutPress: function (oEvent) {
			this.oFlexibleModel = this.getOwnerComponent().getModel("flexibleColumnLayoutConfig");
			this.oFlexibleModel.setProperty("/layout", this.getOwnerComponent().getHelper().getNextUIState(2).layout);
			this.oRouter.navTo("third", {
				instanceId: this.instanceId
			});
		}
	});
});