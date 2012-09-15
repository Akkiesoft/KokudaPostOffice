
/* Main Screen */
function changeView(viewname) {
	var now = document.getElementById("viewStatus").className;
	if (now == viewname) { return; }
	document.getElementById(now).style.display = "none";
	document.getElementById(viewname).style.display = "block";
	document.getElementById("viewStatus").className = viewname;
}

/* Post to Haiku. */
function haiku()
{	
	var status = document.getElementById('status').value;
	if (status == '' && picURI == '') { return false; }

	if (connectionStatus == 'none') {
		navigator.notification.alert(
			'デバイスがネットワークに接続されていないようです。接続状況を確認して再度投稿してください。', // メッセージ
			function() {return;}, // コールバック関数
			'投稿できません...', // タイトル
			'OK' // ボタン名
		);
		return;
	}
	document.getElementById('postbutton').style.display = 'none';
	document.getElementById('posting').style.display = 'block';

    var oauthHeader = oauth.getHeader({'method':'POST','url':postURI});
	var params = {
		'keyword' : document.getElementById('keyword').value || 'id:'+hatenaID,
	    'status'  : status,
	    'source'  : appName
	};
	if (picURI) {
	    var options = new FileUploadOptions();
	    options.fileKey="file";
	    options.fileName=picURI.substr(picURI.lastIndexOf('/')+1);
	    options.mimeType="image/jpeg";
	    options.chunkedMode="false";
	    params.headers = {'Authorization':oauthHeader};
	    options.params = params;
	
	    var ft = new FileTransfer();
	    ft.upload(picURI, postURI, haikuSuccess, haikuFailed, options);
	}
	else {
		oauth.post(postURI, params, haikuSuccess, haikuFailed);
	}
}

function haikuSuccess() {
	var ps = document.getElementById('postSuccess');
	ps.style.zIndex = '5';
	ps.style.opacity = '0.8';
	document.getElementById('keyword').value = '';
	document.getElementById('status').value = '';
    picURI = '';
	document.getElementById('picture').style.display = 'none';
	document.getElementById('postbutton').style.display = 'block';
	document.getElementById('posting').style.display = 'none';
	setTimeout(function(){ document.getElementById('postSuccess').style.opacity = '0'; }, 2500);
	setTimeout(function(){ document.getElementById('postSuccess').style.zIndex = '-2'; }, 2550);
}
function haikuFailed() {
	navigator.notification.alert(
			'だいたいはネットワーク接続まわりか、認証が無効化してしまったとか、そんな感じです。あきらめないで！', // メッセージ
			function() {return;}, // コールバック関数
			'投稿に失敗しました...', // タイトル
			'OK' // ボタン名
	);
}

/* Keyword Picker */
/* JSONのデータを解析して表示 */
function parseJSONforKeyPicker(data) {
	var resultData = '<form><select name="select" class="keyPickerObject">';
	for(var i=0; i<data.length; i++) {
		var iTitle = data[i].title;
		var iWord = data[i].word;
		resultData += "<option value=\""+iWord+"\">"+iTitle+"</option>";
	}
	if (i == 0) { return false; }
	resultData += '</select><input type="button" onclick="setKeyword(this.form)" value="選択"></form>';
	return resultData;
}

function setKeyword(form) {
	var index = form.select.selectedIndex;
	var keyword = form.select.options[index].value;
	document.getElementById('keyword').value = keyword;
	changeView('viewmain');
}

function keywordSearch(form) {
	var searchWord = encodeURI(form.searchWord.value);
	if (!searchWord) { return false; }
	var keySearchResult = document.getElementById("keySearchResult");
	keySearchResult.innerHTML = '<img src="loading-key.gif">';
	$.getJSON("http://h.hatena.ne.jp/api/keywords/list.json?without_related_keywords=1&word="+searchWord+"&callback=?",
			  function(data){
				var result = parseJSONforKeyPicker(data);
				if (result == false) {
					result = 'キーワードが見つかりませんでした。';
				}
				keySearchResult.innerHTML = result;
			  }
	);
	return false;
}

/* Camera and Picture */
function cameraCapture() {
    navigator.camera.getPicture( cameraSuccess, cameraError, {quality: 85, destinationType: Camera.DestinationType.FILE_URI} );
}

function picFileCapture() {
    navigator.camera.getPicture( cameraSuccess, cameraError, {quality: 85, destinationType: Camera.DestinationType.FILE_URI, sourceType: 0} );
}

function cameraSuccess(imageURI) {
	var image = document.getElementById("picture");
	image.src = imageURI;
    picURI = imageURI;
    image.style.display = 'block';
}
function cameraError(message) {}
