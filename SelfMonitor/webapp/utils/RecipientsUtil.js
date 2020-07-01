sap.ui.define([
	"test/SelfMonitor/config/AppConfig",
	"test/SelfMonitor/utils/i18n"
], function(AppConfig, I18n) {
	"use strict";

	var _isNonEmptyArray = function(aArray) {
		return Array.isArray(aArray) && aArray.length > 0;
	};

	var _formatAbbreviatedRecipients = function(aRecipients) {
		if (_isNonEmptyArray(aRecipients)) {
			return aRecipients.slice(0, AppConfig.NumAbbreviatedRecipients).join(", ");
		}
		return "";
	};

	var _isRecipientsFallbackRequired = function(aRecipients1, aRecipients2, aRecipients3) {
		// For task recipients there will be two arguments - recipient users and recipient groups array
		// For mail recipients there will be three arguments - to, cc, bcc
		return !_isNonEmptyArray(aRecipients1) && !_isNonEmptyArray(aRecipients2) && !_isNonEmptyArray(aRecipients3);
	};

	var _hasAdditionalRecipients = function(aRecipients) {
		return Array.isArray(aRecipients) && aRecipients.length > AppConfig.NumAbbreviatedRecipients;
	};

	var _formatAdditionalRecipientsLink = function(aRecipients) {
		if (Array.isArray(aRecipients)) {
			return I18n.getText("RECIPIENT_MORE_USERS", aRecipients.length -
				AppConfig.NumAbbreviatedRecipients);
		}
		return "";
	};

	return {

		isNonEmptyArray: function(aArray) {
			return _isNonEmptyArray(aArray);
		},

		formatAbbreviatedRecipients: function(aRecipients) {
			return _formatAbbreviatedRecipients(aRecipients);
		},

		isRecipientsFallbackRequired: function(aRecipients1, aRecipients2, aRecipients3) {
			return _isRecipientsFallbackRequired(aRecipients1, aRecipients2, aRecipients3);
		},

		hasAdditionalRecipients: function(aRecipients) {
			return _hasAdditionalRecipients(aRecipients);
		},

		formatAdditionalRecipientsLink: function(aRecipients) {
			return _formatAdditionalRecipientsLink(aRecipients);
		}
	};

});