sap.ui.define([
	"test/SelfMonitor/controller/Base",
	"test/SelfMonitor/utils/Curry",
	"test/SelfMonitor/utils/Utils"
], function(Base, curry, Utils) {
	"use strict";

	return Base.extend("test.SelfMonitor.controller.BaseDetail", {

		onNavButtonPress: function( /* oEvent */ ) {
			// TODO: use history.go(-1) once we can address individual items in the REST API
			// window.history.go(-1);

			// On a phone, splitApp.getCurrentMasterPage() returns the Instances/DefinitionsDetail
			// as the current master page, so we need to work arount this behavior
			var splitApp = this.getView().getParent().getParent();
			var currViewName = splitApp.getCurrentMasterPage().getViewName();
			var masterPages = splitApp.getMasterPages();
			var targetPage = null;

			function filterMasterPage(regex, masterPage) {
				return masterPage.getViewName().search(regex) === 0;
			}

			if (currViewName.search(/.*InstancesDetail.*/) === 0) {
				targetPage = Utils.arrayFind(masterPages, curry(filterMasterPage, /.*InstancesMaster.*/));
			} else if (currViewName.search(/.*TasksDetail.*/) === 0) {
				targetPage = Utils.arrayFind(masterPages, curry(filterMasterPage, /.*TasksMaster.*/));
			} else {
				targetPage = Utils.arrayFind(masterPages, curry(filterMasterPage, /.*DefinitionsMaster.*/));
			}

			splitApp.toMaster(targetPage);
		},

		_toggleViewVisibility: function(isVisible, viewName) {
			var splitAppView = this.getView().getParent();
			var pages = splitAppView.getPages();
			for (var i = 0; i <= pages.length - 1; i++) {
				if (pages[i].getViewName() === viewName) {
					pages[i].setVisible(isVisible);
				}
			}
		}

	});
});