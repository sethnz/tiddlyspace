(function() {

var $;
var host = document.location.toString().split("#")[0]; // XXX: brittle?

var main = function() {
	document.getElementById("registerButton").onclick = onClickRegister;
	document.getElementById("loginButton").onclick = onClickLogin;
};

var register = function(username, password) {
	var userCallback = function(resource, status, xhr) {
		notify("user created: " + username);
		var space = new TiddlyWeb.Space(username, [username], host);
		space.put(spaceCallback, errback);
	};
	var spaceCallback = function(resource, status, xhr) {
		notify("space created: " + username);
	};
	var errback = function(xhr, error, exc) {
		notify("error", username, xhr.statusText);
	};

	var user = new TiddlyWeb.User(username, password, host);
	user.create(userCallback, errback);
	return false;
};

var login = function(username, password) {
	// TODO
	return false;
};

var onClickRegister = function(ev) {
	loadDependencies(function() {
		showForm("Register", null, register);
	});
	return false;
};

var onClickLogin = function(ev) {
	loadDependencies(function() {
		showForm("Register", null, register);
	});
	return false;
};

var showForm = function(label, btnLabel, action) {
	var callback = function(ev) {
		var form = $(this).closest("form");
		var username = form.find("input[type=text]").val();
		var password = form.find("input[type=password]").val();
		action(username, password);
	};
	$("#userForm").
		remove().
		attr("action", "#"). // XXX: ?
		find("legend").text(label).end().
		find("input[type=submit]").
			val(btnLabel || label).
			click(callback).
			end().
		prependTo(document.body).
		show();
	$("html, body").animate({ scrollTop: 0 }, 1000);
};

var notify = function(msg) { // TODO
	// XXX: DEBUG
	try {
		console.log.apply(this, arguments);
	} catch(exc) {
		alert(msg);
	}
};

var loadDependencies = function(callback) {
	var uris = [
		["static/jquery.min.js", function() {
			jQuery.noConflict();
			$ = jQuery;
		}],
		"static/jquery-json.min.js",
		"bags/tiddlyspace/tiddlers/chrjs",
		"bags/tiddlyspace/tiddlers/users",
		"bags/tiddlyspace/tiddlers/space"
	];
	if(window.jQuery && jQuery.toJSON &&
		window.TiddlyWeb && window.TiddlyWeb.User && window.TiddlyWeb.Space) {
		uris = [];
	}
	// linearize callbacks
	var next = function() {
		if(uris.length) {
			var uri = uris.shift();
			if(typeof uri != "object") {
				var _callback = next;
			} else {
				var __callback = uri[1];
				_callback = function() {
					__callback();
					next();
				}
				uri = uri[0];
			}
			loadScript(uri, _callback);
		} else {
			callback();
		}
	};
	next();
};

main();

})();