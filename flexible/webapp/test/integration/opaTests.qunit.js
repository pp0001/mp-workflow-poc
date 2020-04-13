/* global QUnit */
QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require([
		"com/flexible/flexible/test/integration/AllJourneys"
	], function () {
		QUnit.start();
	});
});