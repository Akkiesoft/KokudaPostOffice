function setLoginForm(addMessage)
{
	if (addMessage) {
		addMessage = '<p style="color:red;">' + addMessage + '</p>';
	}

	oauth.setAccessToken('', '');
	oauth.setVerifier('');
	var url = oauth.authorizationUrl;
	oauth.request({
		'url': oauth.requestTokenUrl,
		'callbackUrl': "oob",
		'data':{
			'scope':'read_public,write_public'
		},
		'success': function (data) {
			var token = oauth.parseTokenRequest(data, data.responseHeaders['Content-Type'] || undefined);
			oauth.setAccessToken([token.oauth_token, token.oauth_token_secret]);
			var AuthURL = url + '?' + data.text;
			accountStatus.innerHTML = addMessage +
				'<p>アカウントが設定されていません。次のリンクを開いて認証した後、コードをコピーして下のフォームに入力してください。</p>' +
				'<p><a href="'+AuthURL+'" target="_blank">コードを取得する</a></p>' +
				'コード: <input id="pin" value=""><br><input type="button" value="設定" onClick="auth()">';
		},
		'failure': function (data) {
			accountStatus.innerHTML = '認証用のURLの取得に失敗しました。';
		}
	});
}

function auth()
{
	var pin = document.getElementById('pin').value;
	oauth.setVerifier(pin);
	oauth.fetchAccessToken(
		function() {
			localStorage['token'] = oauth.getAccessTokenKey();
			localStorage['tokenSecret'] = oauth.getAccessTokenSecret();
			document.getElementById('navibar').style.display = 'block';
			changeView('viewmain');
			navigator.notification.alert(
				'ログインできました。', // メッセージ
				function() {return;}, // コールバック関数
					'ログイン成功', // タイトル
					'OK' // ボタン名
			);
			oauth.getJSON(
				"http://h.hatena.ne.jp/api/statuses/user_timeline.json?count=1",
				function (data) {
					localStorage['hatenaID'] = data[0].user.id;
					localStorage['userIconURL'] = data[0].user.profile_image_url;
					hatenaID	= window.localStorage['hatenaID'];
					userIconURL	= window.localStorage['userIconURL'];
					setAccountInformation();
				},
				function (data) {
					accountStatus.innerHTML = 'アカウント情報の取得に失敗しました。';
				}
			);
		},
		function() {
			setLoginForm("認証に失敗しました。");
		}
	);
}

function setAccountInformation()
{
	accountStatus.innerHTML = 
		'<div style="height:70px;margin:10px 0;"><img src="' + userIconURL + '" style="float:left; margin:0 10px;">次のユーザーとしてログイン中<br>id:' + localStorage['hatenaID'] + '</div><br style="clear:both;">' +
		'<input type="button" value="ログアウト" onClick="return logout()">';

	if (connectionStatus != 'none') {
		document.getElementById('favoriteKeys').style.display = "block";
		oauth.getJSON("http://h.hatena.ne.jp/api/statuses/keywords.json?without_related_keywords=1&callback=?",
					  function(data){
						document.getElementById("keyPickerFromUserMenu").innerHTML = parseJSONforKeyPicker(data);
					  },
					  function(data){
						alert('お気に入りキーワードの取得に失敗しました。。。');
					  }
		);
	}
}

function logout()
{
	navigator.notification.confirm(
		'ログアウトしてもよろしいですか？', // メッセージ
		function(buttonIndex){
			if (buttonIndex == 1) {
				window.localStorage.clear();
				location.reload();
			} else {
				return false;
			}
		},
		'確認', // タイトル
		'はい,いいえ' // ボタン
	);
}

