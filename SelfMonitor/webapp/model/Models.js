sap.ui.define([
	"sap/ui/base/EventProvider",
	"sap/ui/model/json/JSONModel",
	"sap/ui/Device",
	"test/SelfMonitor/utils/Curry",
	"test/SelfMonitor/utils/Utils",
	"test/SelfMonitor/utils/i18n"
], function (EventProvider, JSONModel, Device, curry, Utils, I18n) {
	"use strict";

	var models = {
			deviceModel: null,
			viewModel: null,
			workflowDefinitionsModel: null,
			workflowDefinitionModel: null,
			workflowInstancesModel: null,
			workflowInstanceModel: null,
			workflowInstanceContext: null,
			workflowInstanceErrorsModel: null,
			workflowInstanceExecutionLogsModel: null,
			workflowTasksModel: null,
			workflowTaskModel: null
		},
		csrfToken = null,
		modelAPISingleton = {},
		pageSize = 100;

	// Globally adds CSRF header for modifying requests
	jQuery.ajaxPrefilter(function (options, originalOptions, jqXhr) {
		if (csrfToken && !options.crossDomain && (
				options.type === "PUT" ||
				options.type === "POST" || options.type === "PATCH" || options.type === "DELETE"
			)) {
			return jqXhr.setRequestHeader("X-CSRF-Token", csrfToken);
		}
	});

	function isCSRFRequired(jqXhr) {
		return jqXhr.status === 403 && jqXhr.getResponseHeader("X-CSRF-Token") === "Required";
	}

	function retryWithNewCSRFToken(bPreventRetry, fnRetry, onError, jqXhr) {
		if (isCSRFRequired(jqXhr)) {
			if (bPreventRetry) {
				return {
					errorCode: "csrfValidationFailed"
				};
			} else {
				csrfToken = null;
				modelAPISingleton.requestCSRFToken(fnRetry, onError);
				return {
					// Don't report errors to error handlers until the retry is done
					silent: true
				};
			}
		}
	}

	function isSessionExpired(jqXhr) {
		return jqXhr.getResponseHeader("com.sap.cloud.security.login") === "login-request";
	}

	function handleSuccessAndSessionExpire(onSuccess, onExpire, oData, sTextStatus, jqXhr) {
		if (isSessionExpired(jqXhr)) {
			jQuery.sap.log.error("REST API call encountered a session timeout with HTTP status code " + jqXhr.status + ":\n" + JSON.stringify(
				jqXhr.responseText));
			onExpire({
				errorCode: "bpm.wfadmin.session.expired",
				httpStatus: jqXhr.status,
				jqXhr: jqXhr
			});
		} else if (onSuccess) {
			onSuccess(oData, sTextStatus, jqXhr);
		}
	}

	function handleRESTError(aHandlers, jqXhr, sErrorType) {
		var sErrorCode = "",
			sErrorMessage = "",
			sErrorDetails = [],
			oError = {},
			iStatus = jqXhr.status;

		if (sErrorType === "parsererror") {
			iStatus = 0;
			sErrorCode = "parsererror";
		} else if (jqXhr.responseJSON && jqXhr.responseJSON.error) {
			sErrorCode = jqXhr.responseJSON.error.code || "";
			sErrorMessage = jqXhr.responseJSON.error.message || "";
			sErrorDetails = jqXhr.responseJSON.error.details || [];
		}

		for (var i = 0; i < aHandlers.length; ++i) {
			var fnHandler = aHandlers[i];
			oError = fnHandler(jqXhr, sErrorCode, jqXhr.status);
			if (oError) {
				break;
			}
		}

		jQuery.sap.log.error("REST API call encountered an error of type '" + sErrorType + "' with HTTP status code " + jqXhr.status + ":\n" +
			JSON.stringify(jqXhr.responseText));

		return jQuery.extend({
			errorCode: sErrorCode,
			errorMessage: sErrorMessage,
			errorDetails: sErrorDetails,
			httpStatus: iStatus,
			jqXhr: jqXhr,
			silent: false
		}, oError);
	}

	function getOrCreateJSONModel(sModelName, sModelPathOrData) {
		var model = models[sModelName];
		if (!model) {
			model = models[sModelName] = new JSONModel(sModelPathOrData);
			model.setDefaultBindingMode("TwoWay");
			model.setSizeLimit(1000); // our max allowed top value
		}
		return model;
	}

	function loadData(oModel, sUrl, onSuccess, onError, fnPostProcessor) {
		var onDataLoaded = function (oData) {
			if (fnPostProcessor) {
				oData = fnPostProcessor(oData, oModel.getData());
			}
			oModel.setData(oData);
			if (onSuccess) {
				onSuccess(oData);
			}
		};
		return jQuery.ajax({
			type: "GET",
			url: sUrl,
			success: curry(handleSuccessAndSessionExpire, onDataLoaded, onError),
			error: function (jqXhr, sErrorType) {
				var oError = handleRESTError([], jqXhr, sErrorType);
				onError(oError);
			}
		});
	}

	function initializeFilterModel() {
		var filterModel = {
			"instancesFilter": {
				"categories": {},
				"filterBar": {
					"isVisible": false,
					"text": ""
				}
			}
		};
		addViewFilterCategoryToFilterModel(filterModel, "status", "instancesFilter", initializeStatusFilterForInstances);
		addViewFilterCategoryToFilterModel(filterModel, "definitionId", "instancesFilter", initializeDefinitionIdFilterForInstances);
		return filterModel;
	}

	function initializeStatusFilterForInstances() {
		var statusFilter = {
			"items": [{
				"key": "CANCELED",
				"text": I18n.getText("INSTANCES_WORKFLOW_STATUS_CANCELED"),
				"isSelected": false
			}, {
				"key": "COMPLETED",
				"text": I18n.getText("INSTANCES_WORKFLOW_STATUS_COMPLETED"),
				"isSelected": false
			}, {
				"key": "ERRONEOUS",
				"text": I18n.getText("INSTANCES_WORKFLOW_STATUS_ERRONEOUS"),
				"isSelected": true
			}, {
				"key": "RUNNING",
				"text": I18n.getText("INSTANCES_WORKFLOW_STATUS_RUNNING"),
				"isSelected": true
			}, {
				"key": "SUSPENDED",
				"text": I18n.getText("INSTANCES_WORKFLOW_STATUS_SUSPENDED"),
				"isSelected": true
			}]
		};
		return statusFilter;
	}

	function initializeDefinitionIdFilterForInstances() {
		var definitionIdFilter = {
			"items": []
		};
		return definitionIdFilter;
	}

	function addViewFilterCategoryToFilterModel(filterModel, categoryName, viewFilterKey, initializeFilterFunction) {
		var categoryFilter = initializeFilterFunction.call(this);
		filterModel[viewFilterKey]["categories"][categoryName] = categoryFilter;
	}

	var filterModel = initializeFilterModel();

	var RESTEndPoints = {
		_uriWfsPrefix: jQuery.sap.getModulePath("test/SelfMonitor") + "/wfs/v1",
		uriWorkflowDefinitions: function (oQueryParams) {
			var sUri = this._uriWfsPrefix + "/workflow-definitions";
			if (oQueryParams) {
				sUri += "?" + Utils.objectToQueryString(oQueryParams);
			}
			return sUri;

		},
		uriWorkflowDefinitionModel: function (sWorkflowDefinitionId) {
			return this.uriWorkflowDefinitions() + "/" + sWorkflowDefinitionId + "/model";
		},
		uriWorkflowInstances: function (oQueryParams) {
			var sUri = this._uriWfsPrefix + "/workflow-instances";
			if (oQueryParams) {
				sUri += "?" + Utils.objectToQueryString(oQueryParams);
			}
			return sUri;
		},
		uriWorkflowInstance: function (instanceId) {
			return this.uriWorkflowInstances() + "/" + instanceId;
		},
		uriWorkflowInstanceMessages: function (instanceId) {
			return this.uriWorkflowInstance(instanceId) + "/error-messages";
		},
		uriWorkflowInstanceExecutionLogs: function (instanceId) {
			return this.uriWorkflowInstance(instanceId) + "/execution-logs";
		},
		uriWorkflowInstanceContext: function (instanceId) {
			return this.uriWorkflowInstance(instanceId) + "/context";
		},
		uriXsrfToken: function () {
			return this._uriWfsPrefix + "/xsrf-token";
		},
		uriTaskInstances: function (oQueryParams) {
			var sUri = this._uriWfsPrefix + "/task-instances";
			if (oQueryParams) {
				sUri += "?" + Utils.objectToQueryString(oQueryParams);
			}
			return sUri;
		},
		uriTaskInstance: function (instanceId) {
			return this.uriTaskInstances() + "/" + instanceId;
		},
		uriWorkflowSampleContext: function (definitionId) {
			var sUri = this.uriWorkflowDefinitions() + "/" + definitionId + "/sample-contexts/default-start-context";
			return sUri;
		}
	};

	var ModelAPI = EventProvider.extend("test.SelfMonitor.Models", {

		attachWorkflowInstancesUpdated: function (oData, fnFunction, oListener) {
			this.attachEvent("workflowInstancesUpdated", oData, fnFunction, oListener);
			return this;
		},

		detachWorkflowInstancesUpdated: function (fnFunction, oListener) {
			this.detachEvent("workflowInstancesUpdated", fnFunction, oListener);
			return this;
		},

		fireWorkflowInstancesUpdated: function (mArguments) {
			this.fireEvent("workflowInstancesUpdated", mArguments);
			return this;
		},

		attachWorkflowDefinitionsUpdated: function (oData, fnFunction, oListener) {
			this.attachEvent("workflowDefinitionsUpdated", oData, fnFunction, oListener);
			return this;
		},

		detachWorkflowDefinitionsUpdated: function (fnFunction, oListener) {
			this.detachEvent("workflowDefinitionsUpdated", fnFunction, oListener);
			return this;
		},

		fireWorkflowDefinitionsUpdated: function (mArguments) {
			this.fireEvent("workflowDefinitionsUpdated", mArguments);
			return this;
		},

		attachTaskInstancesUpdated: function (oData, fnFunction, oListener) {
			this.attachEvent("taskInstancesUpdated", oData, fnFunction, oListener);
			return this;
		},

		detachTaskInstancesUpdated: function (fnFunction, oListener) {
			this.detachEvent("taskInstancesUpdated", fnFunction, oListener);
			return this;
		},

		fireTaskInstancesUpdated: function (mArguments) {
			this.fireEvent("taskInstancesUpdated", mArguments);
			return this;
		},

		getDeviceModel: function () {
			models.deviceModel = models.deviceModel || new JSONModel(Device);
			models.deviceModel.setDefaultBindingMode("OneWay");
			return models.deviceModel;
		},

		getCurrentWorkflowDefinitionModelUri: function () {
			var sWorkflowDefinitionId = this.getWorkflowDefinitionModel().getProperty("/id");
			return RESTEndPoints.uriWorkflowDefinitionModel(sWorkflowDefinitionId);
		},

		getViewModel: function () {
			return getOrCreateJSONModel("viewModel", {
				"busy": {
					"instancesList": false,
					"definitionsList": false,
					"tasksList": false
				},
				"filter": {
					"instancesList": "",
					"definitionsList": "",
					"tasksList": ""
				},
				"count": {
					"instancesList": 0,
					"definitionsList": 0,
					"tasksList": 0
				},
				"totalCount": {
					"instancesList": 0,
					"definitionsList": {
						"cached": 0,
						"current": 0
					}
				},
				"top": {
					"instancesList": pageSize,
					"definitionsList": pageSize

				},
				"filterModel": filterModel,
				"select": {
					"instancesList": false,
					"definitionsList": false,
					"tasksList": false
				}
			});
		},

		getPageSize: function () {
			return pageSize;
		},

		getWorkflowDefinitionsModel: function () {
			return getOrCreateJSONModel("workflowDefinitionsModel");
		},

		updateWorkflowDefinitionsModelAndFireEvent: function (onSuccess, onError) {
			var viewModel = this.getViewModel();
			viewModel.setProperty("/busy/definitionsList", true);
			var that = this;
			this.updateWorkflowDefinitionsModel(onSuccess, onError).done(function (oData, textStatus, jqXhr) {
				var totalCount = jqXhr.getResponseHeader("x-total-count");
				viewModel.setProperty("/totalCount/definitionsList/current", totalCount);
				viewModel.setProperty("/totalCount/definitionsList/cached", totalCount);
				that.fireWorkflowDefinitionsUpdated({
					definitions: oData
				});
			}).always(function () {
				viewModel.setProperty("/busy/definitionsList", false);
			});
		},

		updateWorkflowDefinitionsModel: function (onSuccess, onError) {
			var model = this.getWorkflowDefinitionsModel();
			var top = this.getViewModel().getProperty("/top/definitionsList");
			var oQueryParams = {
				$top: top,
				$inlinecount: "allpages"

			};
			return loadData(model, RESTEndPoints.uriWorkflowDefinitions(oQueryParams), onSuccess, onError);
		},

		getWorkflowDefinitionModel: function () {
			models.workflowDefinitionModel = models.workflowDefinitionModel || new JSONModel();
			return models.workflowDefinitionModel;
		},

		getWorkflowSampleContext: function (definitionId, onSuccess, onError) {
			var url = RESTEndPoints.uriWorkflowSampleContext(definitionId);
			var model = getOrCreateJSONModel("workflowSampleContext");
			loadData(model, url, onSuccess, onError, null);
		},

		updateWorkflowDefinitionModel: function (definition) {
			var model = this.getWorkflowDefinitionModel();
			model.setData(definition, false);
		},

		getWorkflowInstancesModel: function () {
			return getOrCreateJSONModel("workflowInstancesModel");
		},

		updateWorkflowInstancesModel: function (onSuccess, onError) {
			var filter = this.getViewModel().getProperty("/filter/instancesList");
			var top = this.getViewModel().getProperty("/top/instancesList");
			var filterModel = this.getViewModel().getProperty("/filterModel");
			var definitionIdFilterItems = filterModel.instancesFilter.categories.definitionId.items;
			var statusFilterItems = filterModel.instancesFilter.categories.status.items;
			var statusFilterArray = [],
				definitionIdFilterArray = [];
			definitionIdFilterItems.forEach(function (definitionIdFilterItem) {
				if (definitionIdFilterItem["isSelected"]) {
					definitionIdFilterArray.push(definitionIdFilterItem["id"]);
				}
			});
			statusFilterItems.forEach(function (statusFilterItem) {
				if (statusFilterItem["isSelected"]) {
					statusFilterArray.push(statusFilterItem["key"]);
				}
			});

			this._updateWorkflowInstancesModel(filter, top, statusFilterArray, definitionIdFilterArray, onSuccess, onError);
		},

		_updateWorkflowInstancesModel: function (searchString, top, statusFilterArray, definitionIdFilterArray, onSuccess, onError) {
			var that = this;
			var model = this.getWorkflowInstancesModel();
			var viewModel = this.getViewModel();
			viewModel.setProperty("/busy/instancesList", true);
			var oQueryParams = {
				$top: top,
				$inlinecount: "allpages",
				status: statusFilterArray,
				containsText: searchString,
				definitionId: definitionIdFilterArray
			};
			loadData(model, RESTEndPoints.uriWorkflowInstances(oQueryParams), onSuccess, onError).done(function (oData, textStatus, jqXhr) {
				var totalCount = jqXhr.getResponseHeader("x-total-count");
				viewModel.setProperty("/totalCount/instancesList", totalCount);
				that.fireWorkflowInstancesUpdated({
					instances: oData
				});
			}).always(function () {
				viewModel.setProperty("/busy/instancesList", false);
			});
		},

		getWorkflowInstanceModel: function () {
			models.workflowInstanceModel = models.workflowInstanceModel || new JSONModel();
			return models.workflowInstanceModel;
		},

		updateWorkflowInstanceModelWithGivenId: function (instanceId, onSuccess, onError) {
			this._updateWorkflowInstanceModel(instanceId, onSuccess, onError);
		},

		_updateWorkflowInstanceModel: function (instanceId, onSuccess, onError) {
			var instanceModel = this.getWorkflowInstanceModel();
			var fnSingleResultPostProcessor = function (newData, oldData) {
				if (jQuery.isArray(newData) && newData.length === 1 || newData.length === 0) {
					return newData[0];
				} else {
					// loading the instance did not return an array with exactly one result - so keep the original data
					return oldData;
				}
			};
			loadData(instanceModel, RESTEndPoints.uriWorkflowInstances({
				id: instanceId
			}), onSuccess, onError, fnSingleResultPostProcessor);
		},

		updateWorkflowInstanceModel: function (instance, onSuccess, onError) {
			// 1. Already set the instance that was given so that there's the old data visible while it is refreshing
			this.setWorkflowInstanceModelData(instance);
			// 2. Reload the instance to ensure that the data is up to date
			this._updateWorkflowInstanceModel(instance.id, onSuccess, onError);
		},

		setWorkflowInstanceModelData: function (instance) {
			this.getWorkflowInstanceModel().setData(instance);
		},

		updateWorkflowInstanceErrorsModelToCurrentWorkflowInstance: function (onSuccess, onError) {
			var model = this.getWorkflowInstanceErrorsModel();
			var id = this.getWorkflowInstanceModel().getProperty("/id");
			model.setData([], false);
			loadData(model, RESTEndPoints.uriWorkflowInstanceMessages(id), onSuccess, onError);
		},

		updateWorkflowInstanceExecutionLogsModelToCurrentWorkflowInstance: function (fnPostProcessor, onSuccess, onError) {
			var model = this.getWorkflowInstanceExecutionLogsModel();
			var id = this.getWorkflowInstanceModel().getProperty("/id");
			model.setData([], false);
			loadData(model, RESTEndPoints.uriWorkflowInstanceExecutionLogs(id), onSuccess, onError, fnPostProcessor);
		},

		updateWorkflowInstanceContextModelToCurrentWorkflowInstance: function (onSuccess, onError) {
			var model = this.getWorkflowInstanceContextModel();
			var id = this.getWorkflowInstanceModel().getProperty("/id");
			model.setData([], false);
			loadData(model, RESTEndPoints.uriWorkflowInstanceContext(id), onSuccess, onError);
		},

		getWorkflowInstanceContextModel: function () {
			models.workflowInstanceContextModel = models.workflowInstanceContextModel || new JSONModel({
				context: ""
			});
			return models.workflowInstanceContextModel;
		},

		getWorkflowInstanceErrorsModel: function () {
			models.workflowInstanceErrorsModel = models.workflowInstanceErrorsModel || new JSONModel([]);
			return models.workflowInstanceErrorsModel;
		},

		getWorkflowInstanceExecutionLogsModel: function () {
			models.workflowInstanceExecutionLogsModel = models.workflowInstanceExecutionLogsModel || new JSONModel([]);
			return models.workflowInstanceExecutionLogsModel;
		},

		cancelCurrentWorkflowInstance: function (onSuccess, onError) {
			var id = this.getWorkflowInstanceModel().getProperty("/id");
			this.setStatusOfWorkflowInstance(id, "canceled", onSuccess, onError);
		},

		runCurrentWorkflowInstance: function (onSuccess, onError) {
			var id = this.getWorkflowInstanceModel().getProperty("/id");
			this.setStatusOfWorkflowInstance(id, "running", onSuccess, onError);
		},

		suspendCurrentWorkflowInstance: function (onSuccess, onError) {
			var id = this.getWorkflowInstanceModel().getProperty("/id");
			this.setStatusOfWorkflowInstance(id, "suspended", onSuccess, onError);
		},

		setStatusOfWorkflowInstance: function (instanceId, sStatus, onSuccess, onError) {
			var oPayload = {
				status: sStatus
			};
			this.performRequestWithCSRFToken("PATCH", RESTEndPoints.uriWorkflowInstance(instanceId), oPayload, onSuccess, onError);
		},

		startNewWorkflowInstance: function (definitionId, context, onSuccess, onError) {
			var oPayload = {
				definitionId: definitionId,
				context: context
			};
			this.performRequestWithCSRFToken("POST", RESTEndPoints.uriWorkflowInstances(), oPayload, onSuccess, onError);
		},

		performRequestWithCSRFToken: function (sMethod, sUrl, oPayload, onSuccess, onError, bPreventCSRFRetry) {
			var that = this;
			if (!csrfToken && !bPreventCSRFRetry) {
				this.requestCSRFToken(
					this.performRequestWithCSRFToken.bind(this, sMethod, sUrl, oPayload, onSuccess, onError, true), onError);
				return;
			}
			jQuery.ajax({
				type: sMethod,
				url: sUrl,
				success: curry(handleSuccessAndSessionExpire, onSuccess, onError),
				error: function (jqXhr, sErrorType) {
					var oError = handleRESTError([
						curry(
							retryWithNewCSRFToken,
							bPreventCSRFRetry,
							that.performRequestWithCSRFToken.bind(that, sMethod, sUrl, oPayload, onSuccess, onError, true),
							onError
						)
					], jqXhr, sErrorType);
					if (!oError.silent) {
						onError(oError);
					}
				},
				data: JSON.stringify(oPayload),
				contentType: "application/json"
			});
		},

		requestCSRFToken: function (onSuccess, onError) {
			var onCsrfTokenReceived = function (data, textStatus, jqXhr) {
				csrfToken = jqXhr.getResponseHeader("X-CSRF-Token");
				if (onSuccess) {
					onSuccess();
				}
			};

			jQuery.ajax({
				type: "GET",
				url: RESTEndPoints.uriXsrfToken(),
				headers: {
					"X-CSRF-Token": "Fetch"
				},
				success: curry(handleSuccessAndSessionExpire, onCsrfTokenReceived, onError),
				error: function (jqXhr, sErrorType) {
					onError(handleRESTError([], jqXhr, sErrorType));
				},
				contentType: "application/json"
			});
		},

		updateDefinitionsForInstancesFilter: function () {
			var viewModel = this.getViewModel();
			var definitionsModel = this.getWorkflowDefinitionsModel();
			var definitionsModelData = definitionsModel.getData();
			var filterModel = viewModel.getProperty("/filterModel");
			var definitionIdFilterItems = filterModel.instancesFilter.categories.definitionId.items;
			if (definitionIdFilterItems.length === 0) {
				for (var definitionIndex in definitionsModelData) {
					var definition = definitionsModelData[definitionIndex];
					var definitionFilterObject = {
						"id": "",
						"name": "",
						"isSelected": false
					};
					definitionFilterObject["id"] = definition["id"];
					definitionFilterObject["name"] = definition["name"];
					definitionIdFilterItems.push(definitionFilterObject);
				}
			} else {
				definitionIdFilterItems = definitionIdFilterItems.filter(function (definitionIdFilterItem) {
					var definitionFound = false;
					for (var definitionIndex in definitionsModelData) {
						var definition = definitionsModelData[definitionIndex];
						if (definitionIdFilterItem["id"] === definition["id"]) {
							definitionFound = true;
							break;
						}
					}
					return definitionFound;
				});
				var newDefinitions = [];
				for (var definitionIndex in definitionsModelData) {
					var definition = definitionsModelData[definitionIndex];
					var definitionFound = false;
					for (var definitionFilterItemIndex in definitionIdFilterItems) {
						var definitionFilterItem = definitionIdFilterItems[definitionFilterItemIndex];
						if (definition["id"] === definitionFilterItem["id"]) {
							definitionFound = true;
							break;
						}
					}
					if (!definitionFound) {
						var definitionFilterObject = {
							"id": "",
							"name": "",
							"isSelected": false
						};
						definitionFilterObject["id"] = definition["id"];
						definitionFilterObject["name"] = definition["name"];
						newDefinitions.push(definitionFilterObject);
					}
				}
				definitionIdFilterItems = definitionIdFilterItems.concat(newDefinitions);
			}
			filterModel.instancesFilter.categories.definitionId.items = definitionIdFilterItems;
			viewModel.setProperty("/filterModel", filterModel);
		},

		getWorkflowTasksModel: function () {
			return getOrCreateJSONModel("workflowTasksModel");
		},

		updateWorkflowTasksModel: function (workflowInstanceId, onSuccess, onError) {
			var that = this;
			var model = this.getWorkflowTasksModel();
			var viewModel = this.getViewModel();
			viewModel.setProperty("/busy/tasksList", true);
			var oQueryParams = {
				workflowInstanceId: workflowInstanceId
			};
			loadData(model, RESTEndPoints.uriTaskInstances(oQueryParams), onSuccess, onError).done(function (oData) {
				that.fireTaskInstancesUpdated({
					taskInstances: oData
				});
			}).always(function () {
				viewModel.setProperty("/busy/tasksList", false);
			});
		},

		getWorkflowTaskModel: function () {
			models.workflowTaskModel = models.workflowTaskModel || new JSONModel();
			return models.workflowTaskModel;
		},

		_updateWorkflowTaskModel: function (taskInstanceId, onSuccess, onError) {
			var taskModel = this.getWorkflowTaskModel();
			var fnSingleResultPostProcessor = function (newData, oldData) {
				if (newData) {
					return newData;
				} else {
					// loading the task instance did not return anything - so keep the original data
					return oldData;
				}
			};
			loadData(taskModel, RESTEndPoints.uriTaskInstance(taskInstanceId), onSuccess, onError, fnSingleResultPostProcessor);
		},

		updateWorkflowTaskModelWithGivenId: function (taskInstanceId, onSuccess, onError) {
			this._updateWorkflowTaskModel(taskInstanceId, onSuccess, onError);
		},

		updateWorkflowTaskModel: function (taskInstance, onSuccess, onError) {
			// 1. update task instance model with the current task instance
			var model = this.getWorkflowTaskModel();
			model.setData(taskInstance, false);
			// 2. load the current task instance to ensure to display the latest instance status
			this._updateWorkflowTaskModel(taskInstance.id, onSuccess, onError);
		},

		setTaskInstanceModelData: function (taskInstance) {
			this.getWorkflowTaskModel().setData(taskInstance);
		},

		assignProcessorForTaskInstance: function (processor, onSuccess, onError) {
			var id = this.getWorkflowTaskModel().getProperty("/id");
			this.setProcessorOfTaskInstance(id, processor, onSuccess, onError);
		},

		setProcessorOfTaskInstance: function (taskInstanceId, sProcessor, onSuccess, onError) {
			var oPayload = {
				processor: sProcessor
			};
			this.performRequestWithCSRFToken("PATCH", RESTEndPoints.uriTaskInstance(taskInstanceId), oPayload, onSuccess, onError);
		}
	});

	// Create essentially a singleton instance of this class
	modelAPISingleton = new ModelAPI();
	return modelAPISingleton;
});