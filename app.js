//[SCRIPT01]
function LoginToFacebook() {
	FB.login(function(response) {
		statusChangeCallback(response);
	}, {
		scope: 'public_profile,email'
	});
}
// This is called with the results from from FB.getLoginStatus().
function statusChangeCallback(response) {
	console.log('statusChangeCallback');
	console.log(response);
	// The response object is returned with a status field that lets the
	// app know the current login status of the person.
	// Full docs on the response object can be found in the documentation
	// for FB.getLoginStatus().
	if (response.status === 'connected') {
		// Logged into your app and Facebook.
		$('#facebookButton').text('Connected');
		// send access token to the server
		console.log(response.authResponse);
		var form_data = {
			accessToken: response.authResponse.accessToken,
			facebookId: response.authResponse.userID
		};
		$.ajax({
			type: "POST",
			url: base_url + "api/auth/FacebookLogin",
			data: form_data,
			success: function(response) {
				console.log(response.resultCode);
				//var json = response;
				if (response.resultCode > 0) {
					document.cookie = 'token=' + response.password + '; expires=Thu, 18 Dec 2083 12:00:00 UTC';
					document.cookie = 'fuid=' + response.user + '; expires=Thu, 18 Dec 2083 12:00:00 UTC';
					// if getConversations -> get convs from server
				} else if (response.resultCode == -1) {
					alert('access token not valid');
				}
			},
			dataType: "json" //set to JSON
		})
	} else if (response.status === 'not_authorized') {
		// The person is logged into Facebook, but not your app.
		document.getElementById('status').innerHTML = 'Please log ' +
			'into this app.';
	} else {
		// The person is not logged into Facebook, so we're not sure if
		// they are logged into this app or not.
		document.getElementById('status').innerHTML = 'Please log ' +
			'into Facebook.';
	}
}
window.fbAsyncInit = function() {
	FB.init({
		appId: '782732791789048',
		xfbml: true,
		version: 'v2.4'
	});
	console.log('calling get status');
	FB.getLoginStatus(function(response) {
		statusChangeCallback(response);
	});
};
(function(d, s, id) {
	var js, fjs = d.getElementsByTagName(s)[0];
	if (d.getElementById(id)) {
		return;
	}
	js = d.createElement(s);
	js.id = id;
	js.src = "//connect.facebook.net/en_US/sdk.js";
	fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'facebook-jssdk'));

function getCookie(cname) {
	var name = cname + "=";
	var ca = document.cookie.split(';');

	for (var i = 0; i < ca.length; i++) {
		var c = ca[i];
		while (c.charAt(0) == ' ') c = c.substring(1);
		if (c.indexOf(name) == 0) return c.substring(name.length, c.length);
	}
	return "";
}
var wantsToSend = 0;

function logout() {
	document.cookie = "username=; expires=Thu, 01 Jan 1970 00:00:00 UTC";
	document.cookie = "userId=; expires=Thu, 01 Jan 1970 00:00:00 UTC";
	document.cookie = "password=; expires=Thu, 01 Jan 1970 00:00:00 UTC";
}

function sendMessage() {
	console.log('inside send message');
	wantsToSend = 1;
	var response = "";
	var maan = $("#maan").val();
	var message = $("#message").val();
	var userid = getCookie('userId');
	var username = getCookie('username');
	var password = getCookie('password');

	if (username == null || username == '') {
		console.log('open modal');
		$('#myModalO').modal('show');
		return;
	} else {
		wantsToSend = 0;
	}
	var form_data = {
		userName: username,
		password: password,
		userId: userid,
		facebookUserName: maan,
		messageText: message
	};
	$.ajax({
		type: "POST",
		url: base_url + "api/chat/SendMessageAnonimo",
		data: form_data,
		success: function(response) {
			console.log(response);
			//var json = response;
			if (response.resultCode > 0) {
				// show message - your message was sent!
				$("#maan").text('');
				$("#message").text('');
				alert("Your message was sent!");
			}
		},
		dataType: "json" //set to JSON
	})
}


//[SCRIPT02]
var resizefunc = [];

function sendMessageEmpty() {
	var maan = document.getElementById('maan').value;
	var nickNameEmpty = document.getElementById('nickNameEmpty');
	var message = document.getElementById('message').value;
	var messageEmpty = document.getElementById('messageEmpty');
	if (maan == "") {
		nickNameEmpty.innerHTML = "empty";
	} else {
		nickNameEmpty.innerHTML = "";
	}
	if (message == "") {
		messageEmpty.innerHTML = "empty";
	} else {
		messageEmpty.innerHTML = "";
	}
}

//[SCRIPT03]
//var base_url = 'http://rhc.azurewebsites.net/';
var base_url = 'http://localhost:60299/';
$(document).ready(function() {
	$('.dropdown-toggle').dropdown()
	$("#logOutBtn").click(function() {
		$("#loginMenu").hide();
		$("#signIn").show();
	});
	$("#logInBtn").click(function() {
		$("#loginMenu").show();
		$("#signIn").hide();
	});
});


function login() {
	var response = "";
	var username = $("#username").val();
	var password = $("#password").val();
	console.log(username + password);
	var form_data = {
		userName: username,
		password: password
	};
	$.ajax({
		type: "POST",
		//url: base_url + "api/auth/login",
		url: "/auth/login",
		data: form_data,
		success: function(response) {
			console.log(response.resultCode);
			//var json = response;
			if (response.resultCode > 0) {
				document.cookie = 'username=' + response.userName + '; expires=Thu, 18 Dec 2083 12:00:00 UTC';
				document.cookie = 'password=' + response.password + '; expires=Thu, 18 Dec 2083 12:00:00 UTC';
				document.cookie = 'userId=' + response.resultCode + '; expires=Thu, 18 Dec 2083 12:00:00 UTC';
				$('#myModalO').modal('hide');
				// show in UI that we're logged in
				$("#signIn").hide();
				$('#logOutBtn').show();
				showLoggedIn(response.userName);
				if (wantsToSend == 1)
					sendMessage();
			} else if (response.resultCode == -2) {
				// show message "user does not exist"
				alert('user name does not exist');
			} else if (response.resultCode == -3) {
				// show message "wrong password"
				alert('wrong password');
			}
			//var output = "<ul>";
			//for (var i in json) {
			//    output += "<li>" + json.userName + ",  " + json.password + "</li>";
			//}
			//output += "</ul>";
			//$('span').html(output);
		},
		dataType: "json" //set to JSON
	})

}

function register() {
	var response = "";
	var username = $("#userNameRegister").val();
	var password = $("#passwordRegister").val();
	var email = $("#emailRegister").val();
	var form_data = {
		userName: username,
		password: password,
		email: email
	};
	$.ajax({
		type: "POST",
		// url: base_url + "api/auth/SignUp",
		url: "api/auth/SignUp",
		data: form_data,
		success: function(response) {
			console.log(response);
			if (response.resultCode > 0) {
				document.cookie = 'username=' + response.userName + '; expires=Thu, 18 Dec 2083 12:00:00 UTC';
				document.cookie = 'password=' + response.password + '; expires=Thu, 18 Dec 2083 12:00:00 UTC';
				document.cookie = 'userId=' + response.resultCode + '; expires=Thu, 18 Dec 2083 12:00:00 UTC';
				console.log('hiding');
				$('#myModalO').modal('hide');
				// show in UI that we're logged in
				showLoggedIn(response.userName);
				if (wantsToSend == 1)
					sendMessage();
			} else if (response.resultCode == -2) {
				// show message "user already exists"
				alert('user already exists');
			}
			//var json = response;
			//var output = "<ul>";
			//for (var i in json) {
			//    output += "<li>" + json.userName + ",  " + json.password + "</li>";
			//}
			//      output += "</ul>";
			//    $('span').html(output);
		},
		dataType: "json" //set to JSON
	})
}

function showLoggedIn() {}

function sendMessageEmpty() {
	var maan = document.getElementById('maan').value;
	var nickNameEmpty = document.getElementById('nickNameEmpty');
	var message = document.getElementById('message').value;
	var messageEmpty = document.getElementById('messageEmpty');
	if (maan == "") {
		nickNameEmpty.innerHTML = "empty";
	} else {
		nickNameEmpty.innerHTML = "";
	}
	if (message == "") {
		messageEmpty.innerHTML = "empty";
	} else {
		messageEmpty.innerHTML = "";
	}
}