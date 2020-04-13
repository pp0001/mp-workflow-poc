sap.ui.define([
	"sap/ui/core/mvc/Controller"
], function (Controller) {
	"use strict";

	return Controller.extend("com.test.start.startui.controller.View1", {
		onInit: function () {
			this.getView().setModel(new sap.ui.model.json.JSONModel({
				text: "",
				assign: "",
				language: "",
				result: ""
			}));
		},

		_fetchToken: function () {
			var token;
			$.ajax({
				url: "/comteststartstartui/bpmworkflowruntime/v1/xsrf-token",
				method: "GET",
				async: false,
				headers: {
					"X-CSRF-Token": "Fetch"
				},
				success: function (result, xhr, data) {
					token = data.getResponseHeader("X-CSRF-Token");
				}
			});
			return token;
		},

		_startInstance: function (token) {
			var model = this.getView().getModel();
			var inputValue = model.getProperty("/text");
			var assignValue = model.getProperty("/assign");
			var currentLanguage = sap.ui.getCore().getConfiguration().getLanguage();
			$.ajax({
				url: "/comteststartstartui/bpmworkflowruntime/v1/workflow-instances",
				method: "POST",
				async: false,
				contentType: "application/json",
				headers: {
					"X-CSRF-Token": token
				},
				data: JSON.stringify({
					definitionId: "manualprocedure",
					context: {
						text: inputValue,
						assign: assignValue,
						language: currentLanguage
					}
				}),
				success: function (result, xhr, data) {
					model.setProperty("/result", JSON.stringify(result, null, 4));
				}
			});
		},

		startWorkflow: function () {
			var token = this._fetchToken();
			this._startInstance(token);
		}
	});
});