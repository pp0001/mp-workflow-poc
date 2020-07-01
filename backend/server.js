/*eslint no-console: 0*/
"use strict";

var xsenv = require("@sap/xsenv");
var xssec = require("@sap/xssec");
var express = require("express");
var passport = require("passport");
var bodyParser = require("body-parser");

var app = express();

passport.use("JWT", new xssec.JWTStrategy(xsenv.getServices({
	uaa: {
		tag: "xsuaa"
	}
}).uaa));
app.use(passport.initialize());
app.use(passport.authenticate("JWT", {
	session: false
}));
app.use(bodyParser.json());

// app functionality
app.get("/", function (req, res) {
	var responseStr = "<!DOCTYPE HTML><html><head><title>MTApp</title></head><body><h1>MTApp</h1><h2>Welcome " + req.authInfo.userInfo.givenName +
		" " + req.authInfo.userInfo.familyName + "!</h2><p><b>Subdomain:</b> " + req.authInfo.subdomain + "</p><p><b>Identity Zone:</b> " + req.authInfo
		.identityZone + "</p></body></html>";
	res.status(200).send(responseStr);
});

// get dependency
app.get("/callback/v1.0/dependencies", function (req, res) {
	const VCAP_SERVICES = JSON.parse(process.env.VCAP_SERVICES);
	console.info(VCAP_SERVICES);
	console.info(VCAP_SERVICES.workflow[0].credentials);
	const workflowXsappname = VCAP_SERVICES.workflow[0].credentials.uaa.xsappname; 
	console.info(workflowXsappname);
	
	console.info(req.method + ": /callback/v1.0/dependencies: " + JSON.stringify(req.params) + " ");
	const dependencies = [
        { 
            appId: workflowXsappname,
            appName: "workflow"
        },
        { 
            appId: "2dae3406-23c5-45f5-b601-66b5411c0abc!b4702|portal-cf-service!b119",
            appName: "portal"
        }
    ];
    console.info("Returning dependencies: " + JSON.stringify(dependencies));
    res.status(200).send(dependencies);
});

// subscribe/onboard a subscriber tenant
app.put("/callback/v1.0/tenants/*", function (req, res) {
	console.info(req.method + ": /callback/v1.0/tenants/: " + JSON.stringify(req.params) + " ");
	console.info("subscribedSubdomain: " + req.body.subscribedSubdomain);
	console.info("subaccountDomain: " + req.body.subaccountDomain);
	// qa-tenant-mpstandalone-poc-workflow-approuter
	// controllibrary-mp-workflow-poc-approuter-mpstandalone
	var tenantAppURL = "https:\/\/" + req.body.subscribedSubdomain + "-mp-workflow-poc-approuter-mpstandalone" + ".cfapps.sap.hana.ondemand.com";
	res.status(200).send(tenantAppURL);
	
	// res.status(200);
});

// unsubscribe/offboard a subscriber tenant
app.delete("/callback/v1.0/tenants/*", function (req, res) {
	res.status(200).send("");
});

var server = require("http").createServer();
var port = process.env.PORT || 3000;

server.on("request", app);

server.listen(port, function () {
	console.info("Backend: " + server.address().port);
});
