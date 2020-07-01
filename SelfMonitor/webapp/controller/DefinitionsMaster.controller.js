sap.ui.define([
	"test/SelfMonitor/controller/BaseMaster",
	"test/SelfMonitor/model/Models",
	"test/SelfMonitor/utils/Curry",
	"test/SelfMonitor/utils/ErrorHandlers"
], function (BaseMaster, Models, curry, ErrorHandlers) {
	"use strict";
    var masterviewflag = true;
	return BaseMaster.extend("test.SelfMonitor.DefinitionsMaster", {

		onInit: function () {
			this._getRouter().getRoute("workflowDefinitions").attachMatched(this._updateDefinitions, this);
			this._getRouter().getRoute("workflowDefinitionWithId").attachMatched(this._updateDefinitions, this);
			Models.attachWorkflowDefinitionsUpdated(this._onDefinitionsUpdated, this);

			var oEventBus = sap.ui.getCore().getEventBus();
			oEventBus.subscribe("DefinitionsMaster", "updateDefinitions", this._updateDefinitionsView, this);
			if (sap.ui.Device.system.phone) {
				masterviewflag = false;     //this is for mobile only to show master view first
			}
		},
		onMorePress: function (oEvent) {
			var top = Models.getViewModel().getProperty("/top/definitionsList");
			Models.getViewModel().setProperty("/top/definitionsList", top + Models.getPageSize());
			this._updateDefinitionsList();
		},
		_updateDefinitionsList: function () {
			Models.updateWorkflowDefinitionsModelAndFireEvent(Models.updateDefinitionsForInstancesFilter.bind(Models), ErrorHandlers.handleDefault);
		},

		onExit: function () {
			Models.detachWorkflowDefinitionsUpdated(this._onDefinitionsUpdated, this);
			// Note: The router is already destroyed when this is called so detaching the event is not necessary
			var oEventBus = sap.ui.getCore().getEventBus();
			oEventBus.unsubscribe("DefinitionsMaster", "updateDefinitions", this._updateDefinitionsView, this);
		},

		_updateDefinitions: function (oEvent) {
			if (oEvent.getParameters().arguments) {
				var workflowDefinitionId = oEvent.getParameters().arguments.workflowDefinitionId;
			}
			sap.ui.getCore().getEventBus().publish("DefinitionsMaster", "updateDefinitions", {
				workflowDefinitionId: workflowDefinitionId
			});
		},

		onSelectDefinition: function (oEvent) {
				var oldDefinitionId = this.workflowDefinitionId;
				var definition = oEvent.getParameter("listItem").getBindingContext("wfds").getProperty("");
				this._getRouter().navTo("workflowDefinitionWithId", {
					workflowDefinitionId: definition.id
				});
				if (oldDefinitionId === definition.id) {
					this._showDefinitionDetails(definition);
				}
		},

		onSearchDefinitions: function (oEvent) {
			if (oEvent.getParameter("newValue")) {
				this._filterDefinitions(oEvent.getParameter("newValue"));
			} else if (oEvent.getParameter("query")) {
				if (oEvent.getParameter("refreshButtonPressed")) {
					this._updateDefinitionsView();
				}
				this._filterDefinitions(oEvent.getParameter("query"));
			} else if (oEvent.getParameter("refreshButtonPressed")) {
				this._updateDefinitionsView();
			} else {
				this._filterDefinitions("");
			}
			if (Models.getViewModel().getProperty("/filter/definitionsList")) {
				Models.getViewModel().setProperty("/totalCount/definitionsList/current", Models.getViewModel().getProperty(
					"/count/definitionsList"));
			} else {
				Models.getViewModel().setProperty("/totalCount/definitionsList/current", Models.getViewModel().getProperty(
					"/totalCount/definitionsList/cached"));
			}
		},

		_showDefinitionDetails: function (definition) {
			if (masterviewflag) {
				this._getRouter().getTargets().display("workflowDefinition");
			}
			masterviewflag = true;
			sap.ui.getCore().getEventBus().publish("DefinitionsMaster", "ShowDefinitionDetails", {
				definition: definition
			});
		},

		_updateDefinitionsView: function (sChannel, sEventId, oEventData) {
			Models.getViewModel().setProperty("/select/definitionsList", true);
			if (oEventData) {
				this.workflowDefinitionId = oEventData.workflowDefinitionId;
			}
			this._updateDefinitionsList();
		},

		_onDefinitionsUpdated: function () {
			this._filterDefinitions(Models.getViewModel().getProperty("/filter/definitionsList"));
			this._selectItem("definitionsList", "wfds", this.workflowDefinitionId, "_showDefinitionDetails", "/select/definitionsList");
		},

		_filterDefinitions: curry(BaseMaster.prototype._filterList, "definitionsList", ["id", "name", "version"])
	});
});