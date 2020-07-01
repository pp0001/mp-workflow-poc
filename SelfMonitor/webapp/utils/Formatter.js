sap.ui.define([
	"test/SelfMonitor/utils/i18n",
	"sap/ui/core/format/DateFormat",
	"test/SelfMonitor/utils/ExecutionLogIcons",
	"sap/ui/core/MessageType",
	"sap/ui/core/ValueState"
], function(
	I18n,
	DateFormat,
	ExecutionLogIcons,
	MessageType,
	ValueState
) {
	"use strict";

	var oDateFormatInput = DateFormat
		.getDateTimeInstance({
			pattern: "yyyy-MM-ddTHH:mm:ss.SSSZ"
		});
	var oDateFormatOutput = DateFormat
		.getDateTimeInstance({
			style: "medium"
		});
	var rCamelToWords = /([A-Z])/g;

	return {
		formatWorkflowInstanceTitle: function(sSubject, sDefinitionId, oTimestamp) {
			// Use subject if available, otherwise use fallback text created from definition id and started date
			if (sSubject) {
				return sSubject;
			} else if (sDefinitionId) {
				var oDate = oDateFormatInput.parse(oTimestamp);
				var sDate = oDateFormatOutput.format(oDate);
				// Turn a camel case definition ID into separate words and capitalize first letter
				var sName = sDefinitionId.replace(rCamelToWords, " $1").trim();
				sName = sName.charAt(0).toUpperCase() + sName.slice(1);

				return I18n.getText("INSTANCES_WORKFLOW_NAME", [sName, sDate]);
			}
			jQuery.sap.log.error(
				"[Formatter::formatWorkflowInstanceTitle] Could not format title: Missing both subject and definition id.");
		},

		formatStatusText: function(sStatus) {
			return I18n.getText("INSTANCES_WORKFLOW_STATUS_" + (
				sStatus ? sStatus.toUpperCase() : "UNDEFINED"
			));
		},

		formatTaskStatusText: function(sStatus) {
			return I18n.getText("TASKS_STATUS_" + (
				sStatus ? sStatus.toUpperCase() : "UNDEFINED"
			));
		},

		formatTaskPriorityText: function(sPriority) {
			return I18n.getText("TASKS_PRIORITY_" + (
				sPriority ? sPriority.toUpperCase() : "UNDEFINED"
			));
		},

		formatTaskDueOnText: function(sDueOn) {
			return sDueOn ? (I18n.getText("TASKS_DETAIL_DUE_ON") + " " + sDueOn) : "";
		},

		formatErrorMessageTitle: function(aItems) {
			var iCount = aItems.length;
			return iCount > 0 ? I18n.getText("INSTANCES_DETAIL_ERROR_MESSAGES_HEADER_WITH_COUNT", iCount) :
				I18n.getText("INSTANCES_DETAIL_ERROR_MESSAGES_HEADER");
		},

		formatExecutionLogTitle: function(sType, sSubject) {
			return I18n.getText("EXECUTION_LOG_TYPE_" + sType, [sSubject]);
		},

		formatExecutionLogIcon: function(sType) {
			return ExecutionLogIcons[sType];
		},

		formatExecutionLogIconTooltip: function(sType) {
			return I18n.getText("EXECUTION_LOG_TOOLTIP_" + sType);
		},

		formatExecutionLogStatus: function(sType) {
			if (sType === "SERVICETASK_FAILED" || sType === "SCRIPTTASK_FAILED" || sType === "USERTASK_FAILED" || sType === "MAILTASK_FAILED" || sType === "PARALLEL_GATEWAY_FAILED" || sType === "EXCLUSIVE_GATEWAY_FAILED") {
				return "Error";
			}
			return "";
		},

		formatStatusHighlight: function(sStatus) {
			return sStatus === "ERRONEOUS" ? MessageType.Error : MessageType.None;
		},

		formatStatusState: function(sStatus) {
			if (sStatus === "RUNNING" || sStatus === "READY" || sStatus === "RESERVED") {
				return ValueState.Success;
			}

			if (sStatus === "ERRONEOUS") {
				return ValueState.Error;
			}

			if (sStatus === "SUSPENDED") {
				return ValueState.Warning;
			}

			return ValueState.None;
		}
	};
});