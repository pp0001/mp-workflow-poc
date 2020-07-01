sap.ui.define([
	"test/SelfMonitor/controller/BaseDetail",
	"test/SelfMonitor/model/Models",
	"sap/ui/core/ValueState",
	"sap/m/MessageToast",
	"sap/m/MessageBox",
	"test/SelfMonitor/utils/i18n",
	"test/SelfMonitor/utils/ErrorHandlers",
	"sap/ui/thirdparty/vkbeautify"
], function(BaseDetail, Models, ValueState, MessageToast, MessageBox, I18n, ErrorHandlers, beautifier) {
	"use strict";

	// This class is not defined in a file "sap/m/URLHelper.js" (however, in: sap.m library).
	var URLHelper = sap.m.URLHelper;

	var defaultContext =
		"{\n  \"product\": \"Hamlet (Paperback)\",\n  \"inStock\": true,\n  \"inventory\": 20000,\n  \"price\": 7.49,\n  \"publishingDate\": \"1600-04-23T18:25:43.511Z\",\n  \"author\": { \"name\": \"William Shakespeare\" },\n  \"publishers\": [ \"Simon & Brown\", \"SparkNotes\", \"Dover Publications\" ]\n}";

	return BaseDetail.extend("test.SelfMonitor.controller.DefinitionsDetail", {

		onInit: function() {
			var oEventBus = sap.ui.getCore().getEventBus();
			oEventBus.subscribe("DefinitionsMaster", "ShowDefinitionDetails", this._showDefinitionDetails, this);
		},

		onExit: function() {
			var oEventBus = sap.ui.getCore().getEventBus();
			oEventBus.unsubscribe("DefinitionsMaster", "ShowDefinitionDetails", this._showDefinitionDetails, this);
		},

		_showDefinitionDetails: function(sChannel, sEventId, oEventData) {
			if (!oEventData.definition || jQuery.isEmptyObject(oEventData.definition)) {
				this._toggleViewVisibility(false, "test.SelfMonitor.view.DefinitionsDetail");
				MessageBox.error(I18n.getText("ERROR_DEFINITIONS_DETAILS_NOT_FOUND"));
			} else {
				Models.updateWorkflowDefinitionModel(oEventData.definition);
				this._toggleViewVisibility(true, "test.SelfMonitor.view.DefinitionsDetail");
			}
		},

		_getNewInstanceDialog: function() {
			if (!this._oNewInstanceDialog) {
				var oView = this.getView();
				this._oNewInstanceDialog = sap.ui.xmlfragment(oView.getId(), "test.SelfMonitor.view.NewInstanceDialog", this);
				oView.addDependent(this._oNewInstanceDialog);
			}
			return this._oNewInstanceDialog;
		},

		onOpenNewInstanceDialog: function() {
			this._retrieveContextAndOpenNewInstanceDialog();
		},

		_retrieveContextAndOpenNewInstanceDialog: function() {
			var definitionId = Models.getWorkflowDefinitionModel().getProperty("/id");
			var that = this;
			var onError = function(oError) {
				if (oError.httpStatus == 404) {
					that._getNewInstanceDialog();
					var oTextArea = that._getStartInstanceTextArea();
					oTextArea.setValue(defaultContext);
					that._openNewInstanceDialog();
				} else {
					var aHandlers = ErrorHandlers.create(
						this._handleInvalidContextError.bind(this),
						ErrorHandlers.defaultErrorHandlers
					);
					ErrorHandlers.handle(aHandlers, oError);
				}
			}.bind(this);
			var onSuccess = function(newData) {
				that._getNewInstanceDialog();
				var sampleContext = newData.content;
				var beautifiedSampleContext = null;
				if (sampleContext) {
					beautifiedSampleContext = beautifier.json(sampleContext);
				}
				var oTextArea = that._getStartInstanceTextArea();
				oTextArea.setValue(beautifiedSampleContext);
				that._openNewInstanceDialog();
			};
			Models.getWorkflowSampleContext(definitionId, onSuccess, onError);
		},

		_openNewInstanceDialog: function() {
			var oDialog = this._getNewInstanceDialog();
			var oTextArea = this._getStartInstanceTextArea();
			this.validateWorkflowInstanceContext(oTextArea);
			this._oNewInstanceDialog.setBusyIndicatorDelay(0);
			this._oNewInstanceDialog.setBusy(false);
			this.byId("startNewInstance").setEnabled(true);
			oDialog.open();
		},

		_getStartInstanceTextArea: function() {
			return this.byId("workflowInstanceContext");

		},

		onCloseNewInstanceDialog: function() {
			this._getNewInstanceDialog().close();
		},

		onStartNewInstance: function() {
			var definitionId = Models.getWorkflowDefinitionModel().getProperty("/id");

			var oTextArea = this.byId("workflowInstanceContext");
			var sContext = this.validateWorkflowInstanceContext(oTextArea);
			// the validation returns null if failed; in this case we focus to the text area to show the value state label
			if (sContext === null) {
				oTextArea.focus();
				return;
			}

			this._oNewInstanceDialog.setBusy(true);
			this.byId("startNewInstance").setEnabled(false);

			var onSuccess = function( /* oInstance */ ) {
				this._oNewInstanceDialog.setBusy(false);
				this._oNewInstanceDialog.close();
				MessageToast.show(I18n.getText("DEFINITIONS_DETAIL_STARTED_SUCCESS"));
			}.bind(this);

			var onError = function(oError) {
				this._oNewInstanceDialog.setBusy(false);
				this._oNewInstanceDialog.close();
				var aHandlers = ErrorHandlers.create(
					this._handleInvalidContextError.bind(this),
					ErrorHandlers.handleInstanceLimitReached,
					ErrorHandlers.defaultErrorHandlers
				);
				ErrorHandlers.handle(aHandlers, oError);
			}.bind(this);

			Models.startNewWorkflowInstance(definitionId, sContext, onSuccess, onError);
		},

		_handleInvalidContextError: function(oError) {
			if (oError.errorCode === "bpm.workflowruntime.instance.context.invalid") {
				this._showInvalidContextErrorDialog(oError, "ERROR_CONTEXT_INVALID");
				return true;
			} else if (oError.errorCode === "bpm.workflowruntime.content.length.limit.exceeded") {
				this._showInvalidContextErrorDialog(oError, "ERROR_CONTEXT_TOO_LARGE");
				return true;
			}
		},

		_showInvalidContextErrorDialog: function(oError, sI18nMessageIdentifier) {
			var sCorrectButton = I18n.getText("ERROR_CONTEXT_INVALID_CORRECT_INPUT");
			var sCancelButton = I18n.getText("ERROR_CONTEXT_INVALID_CANCEL");
			var sDetails;
			if (oError.errorDetails && oError.errorDetails.length > 0) {
				sDetails = oError.errorDetails.map(function(detail) {
					return detail.message;
				}).join("\n");
			}

			MessageBox.error(I18n.getText(sI18nMessageIdentifier), {
				details: sDetails,
				actions: [sCorrectButton, sCancelButton],
				initialFocus: sCorrectButton,
				onClose: function(sAction) {
					if (sAction === sCorrectButton) {
						this._openNewInstanceDialog();
					}
				}.bind(this)
			});
		},

		onShowInstances: function( /* oEvent */ ) {
			Models.getViewModel().setProperty("/filter/instancesList", "");
			this._setInstancesFilterOnSelectedDefinitionId();
			this._getRouter().navTo("workflowInstances");
		},

		_setInstancesFilterOnSelectedDefinitionId: function() {
			var currentDefinitionId = Models.getWorkflowDefinitionModel().getProperty("/id");
			var filterModel = Models.getViewModel().getProperty("/filterModel");
			var definitionIdFilterItems = filterModel.instancesFilter.categories.definitionId.items;
			definitionIdFilterItems.forEach(function(definitionIdFilterItem) {
				if (definitionIdFilterItem["id"] === currentDefinitionId) {
					definitionIdFilterItem["isSelected"] = true;
				} else {
					definitionIdFilterItem["isSelected"] = false;
				}
			});
			filterModel.instancesFilter.categories.definitionId.items = definitionIdFilterItems;
			Models.getViewModel().setProperty("/filterModel", filterModel);
		},

		onDownloadWorkflowModel: function( /* oEvent */ ) {
			if (this._oUserSecurityConsentGiven) {
				this.downloadWorkflowModel();
			} else {
				this.openConsentDialog();
			}
		},

		openConsentDialog: function() {
			if (!this._oUserSecurityConsentDialog) {
				var oView = this.getView();
				this._oUserSecurityConsentDialog =
					sap.ui.xmlfragment(oView.getId(), "test.SelfMonitor.view.UserSecurityConsentDialog", this);
				oView.addDependent(this._oUserSecurityConsentDialog);
			}
			this.byId("rememberConsent").setSelected(false); // reset checkbox if last dialog was exited via cancel/escape
			this._oUserSecurityConsentDialog.open();
		},

		handleConsentCancel: function() {
			this._oUserSecurityConsentDialog.close();
		},

		handleConsentConfirm: function() {
			this._oUserSecurityConsentGiven = this.byId("rememberConsent").getSelected();
			this._oUserSecurityConsentDialog.close();
			this.downloadWorkflowModel();
		},

		downloadWorkflowModel: function() {
			var sGetUrl = Models.getCurrentWorkflowDefinitionModelUri();
			URLHelper.redirect(sGetUrl, "true");
		},

		onWorkflowInstanceContextChange: function(oEvent) {
			this.validateWorkflowInstanceContext(oEvent.getSource());
		},

		validateWorkflowInstanceContext: function(oTextArea) {
			var oButton = this.byId("startNewInstance");
			var sContext = oTextArea.getValue().trim();
			var oContext = {};

			var containsUserDefinedContextWrapper = function(oContext) {
				// Return true if the key "context" exists and there's no other key or the only other key is "definitionId"
				if (oContext.context !== undefined) {
					var iKeys = Object.keys(oContext).length;
					return iKeys === 1 || (
						iKeys === 2 && oContext.definitionId !== undefined
					);
				}
				return false;
			};

			var setValueState = function(oValueState, sI18nMessageIdentifier) {
				oTextArea.setValueState(oValueState);
				oTextArea.setValueStateText(sI18nMessageIdentifier ? I18n.getText(sI18nMessageIdentifier) : "");
				oButton.setEnabled(oValueState !== ValueState.Error);
			};

			try {
				oContext = JSON.parse(sContext);
				if (typeof oContext !== "object" || Array.isArray(oContext)) {
					// JSON.parse will also parse primitives, but they are not valid as context
					// Note: Arrays have type "object" and are also not allowed, so they have to be checked separately
					setValueState(ValueState.Error, "ERROR_LABEL_INVALID_JSON");
					return null;
				} else if (containsUserDefinedContextWrapper(oContext)) {
					setValueState(ValueState.Warning, "DEFINITIONS_CONTEXT_WARNING");
					return oContext;
				} else {
					setValueState(ValueState.None);
					return oContext;
				}
			} catch (err) {
				setValueState(ValueState.Error, "ERROR_LABEL_INVALID_JSON");
				return null;
			}
		}

	});
});