sap.ui.define([
	"sap/m/MessageBox",
	"test/SelfMonitor/utils/Curry",
	"test/SelfMonitor/utils/i18n",
	"test/SelfMonitor/utils/Utils"
], function(MessageBox, curry, I18n, Utils) {
	"use strict";

	function csrfValidationFailed(jqXhr) {
		return jqXhr.status === 403 && jqXhr.getResponseHeader("X-CSRF-Token") === "Required";
	}

	var PROCESSOR_TOO_LONG = "The processor could not be set, because the value submitted is too long.";
	var PROCESSOR_WITH_COMMA = "The processor could not be set, because the value submitted contains the forbidden symbol ','.";

	function checkCodeAndMessage(oError, errorMessage) {
		return oError.errorCode === "bpm.workflowruntime.task.change.property.invalid" && oError.errorDetails[0].message === errorMessage;
	}

	var ErrorHandlers = {

		/** Takes a mix of functions and arrays of functions as variable arguments
		 * and returns an array of error handlers that can be used with handle(aHandlers, oError).
		 * An automatic fallback handler is added so that no error remains unhandled
		 * @returns {Array}
		 */
		create: function() {
			var aHandlers = [];
			var addFunction = function(fnHandler) {
				if (typeof fnHandler !== "function") {
					jQuery.debug.log.error("[ErrorHandlers::create] Expecting function or array of functions");
				} else {
					aHandlers.push(fnHandler);
				}
			};
			for (var i = 0; i < arguments.length; ++i) {
				var vHandler = arguments[i];
				if (Array.isArray(vHandler)) {
					vHandler.forEach(addFunction);
				} else {
					addFunction(vHandler);
				}
			}
			aHandlers.push(ErrorHandlers.fallback);
			return aHandlers;
		},

		handle: function(aHandlers, oError) {
			Utils.arrayFind(aHandlers, function(oHandler) {
				return oHandler(oError);
			});
		},

		handleSilentError: function(oError) {
			return oError.silent;
		},

		handleInvalidCSRFToken: function(oError) {
			if (csrfValidationFailed(oError.jqXhr)) {
				MessageBox.error(I18n.getText("ERROR_CSRF_VALIDATION"));
				return true;
			}
		},

		handleDefinitionNotFound: function(oError) {
			if (oError.errorCode === "bpm.workflowruntime.definition.not.found") {
				MessageBox.error(I18n.getText("ERROR_DEFINITION_NOT_FOUND"));
				return true;
			}
		},

		handleInstanceNotFound: function(sAction, oError) {
			if (oError.errorCode === "bpm.workflowruntime.instance.not.found") {
				MessageBox.error(I18n.getText("ERROR_" + sAction + "_FAILED_NOT_FOUND"));
				return true;
			}
		},

		handleRestInstanceNotFound: function(oError) {
			if (oError.errorCode === "bpm.workflowruntime.rest.instance.not.found") {
				MessageBox.error(I18n.getText("ERROR_INSTANCE_NOT_FOUND"));
				return true;
			}
		},

		handleTaskInstanceNotFound: function(oError) {
			if (oError.errorCode === "bpm.workflowruntime.rest.task.not.found") {
				MessageBox.error(I18n.getText("ERROR_TASK_NOT_FOUND"));
				return true;
			}
		},

		handleTaskPropertyNotChanged: function(oError) {
			if (oError.errorCode === "bpm.workflowruntime.task.suspended.status") {
				MessageBox.error(I18n.getText("ERROR_TASK_CHANGE_PROPERTY_FAILED_SUSPENDED"));
				return true;
			}
		},

		handleTaskProcessorNotAssigned: function(oError) {
			if (checkCodeAndMessage(oError, PROCESSOR_TOO_LONG)) {
				MessageBox.error(I18n.getText("ERROR_ASSIGN_PROCESSOR_FAILED_TOO_LONG"));
				return true;
			} else if (checkCodeAndMessage(oError, PROCESSOR_WITH_COMMA)) {
				MessageBox.error(I18n.getText("ERROR_ASSIGN_PROCESSOR_FAILED_FORBIDDEN_SYMBOL"));
				return true;
			}
		},

		handleOperationFailed: function(sAction /*, oError */ ) {
			MessageBox.error(I18n.getText("ERROR_" + sAction + "_FAILED_GENERIC"));
			return true;
		},

		handleSessionTimeout: function(oError) {
			if (oError.errorCode === "bpm.wfadmin.session.expired") {
				MessageBox.alert(I18n.getText("ERROR_SESSION_TIMEOUT"), {
					styleClass: "sapUiSizeCompact",
					onClose: function() {
						location.reload();
					}
				});
				return true;
			}
		},

		handleNoPermission: function(oError) {
			if (oError.httpStatus === 403) {
				MessageBox.error(I18n.getText("ERROR_NOT_ALLOWED"));
				return true;
			}
		},

		handleInternalServerError: function(oError) {
			if (oError.errorCode === "bpm.workflowruntime.internal.server.error" || oError.httpStatus === 500) {
				MessageBox.error(I18n.getText("ERROR_INTERNAL_ERROR"));
				return true;
			}
		},
		handleInstanceLimitReached: function(oError) {
			if (oError.errorCode === "bpm.workflowruntime.rest.instance.limit.reached") {
				MessageBox.error(I18n.getText("INSTANCE_LIMIT_REACHED_MESSAGE"));
				return true;
			}
		},
		handleThrottlingError: function(oError) {
			if (oError.errorCode === "bpm.workflowruntime.rate.limit.exceeded") {
				MessageBox.error(I18n.getText("THROTTLING_ERROR_MSG"));
				return true;
			}
		},
		fallback: function(oError) {
			MessageBox.error(I18n.getText("ERROR_INTERNAL_ERROR"));
			return true;
		}

	};

	ErrorHandlers.defaultErrorHandlers = [
		ErrorHandlers.handleSilentError,
		ErrorHandlers.handleDefinitionNotFound,
		ErrorHandlers.handleSessionTimeout,
		ErrorHandlers.handleInvalidCSRFToken,
		ErrorHandlers.handleNoPermission,
		ErrorHandlers.handleInternalServerError,
		ErrorHandlers.handleThrottlingError
	];

	ErrorHandlers.handleDefault = curry(
		ErrorHandlers.handle,
		ErrorHandlers.create(ErrorHandlers.defaultErrorHandlers, ErrorHandlers.fallback)
	);

	return ErrorHandlers;
});