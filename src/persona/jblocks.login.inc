<?php
if(!defined('JBLOCKS_PATH'))
	define('JBLOCKS_PATH',drupal_get_path('module','jblocks'));

function _jblocks_login_log($text) {
	$fp=fopen("jocly-login.log","a");
	fwrite($fp,$text."\n");
	fclose(fp);
}

function _jblocks_notify_logged($account) {
	$pictureUrl = url(drupal_get_path('theme','joclook').'/images/default-avatar.png',array('absolute'=>TRUE));
	if($account->picture)
		$pictureUrl = image_style_url('thumbnail',$account->picture->uri);
	else if(variable_get('user_picture_default'))
		$pictureUrl=url(variable_get('user_picture_default'),array('absolute'=>TRUE));
	$userData=array(
		'uid' => $account->uid,
		'name' => $account->name,
		'mail' =>  $account->mail,
		'roles' => array(),
		'picture' => $pictureUrl,
	);
	foreach($account->roles as $roleId=>$role)
		$userData['roles'][$role]=true;
	return 'Notify("login",'.drupal_json_encode($userData).');';
}

function _jblocks_user_logout() {
	global $user;

	watchdog('user', 'Session closed for %name.', array('%name' => $user->name));

	module_invoke_all('user_logout', $user);

	// Destroy the current session, and reset $user to the anonymous user.
	session_destroy();
}

function _jblocks_user_validate_name($pseudo) {
	$account=user_load_by_name($pseudo);
	if($account)
		return t('This name already exists');
	else
		return user_validate_name($pseudo);
}

function _jblocks_persona_login() {
	global $user,$base_url;
	
	/*
	$fp=fopen("jocly.log","a");
	fwrite($fp,drupal_json_encode($_REQUEST)."\n");
	fclose($fp);
	*/

	drupal_add_css(JBLOCKS_PATH.'/jblocks.css');
	drupal_add_js('https://login.persona.org/include.js','external');
	//drupal_add_js(JBLOCKS_PATH.'/jblocks.fit.js');
	require(JBLOCKS_PATH.'/jblocks.inc');
	_jblocks_header();
	ob_start();
?>

var jBlocks= jBlocks || {};
jBlocks.personaBaseUrl="<?= $base_url ?>";

function Clear() {
	$("div[data-role=content]").hide();
}

function Notify(event,param) {
	if(arguments.length>1)
		parent.$(parent.document).trigger('jblocks.'+event,param,"persona");
	else
		parent.$(parent.document).trigger('jblocks.'+event,"persona");
}

function NavigatorIdWatch(email) {
	function _NavigatorIdWatch() {
		navigator.id.watch({
		    loggedInUser: email,
		    onlogin: function (assertion) {
		    	var loginForm=$("<form/>").attr("id","login-form").attr("method","POST")
		    		.append($("<input/>").attr("name","assertion").attr("id","assertion-field").val(assertion))
		    		.appendTo($("body"));
		        loginForm[0].submit();
			},
		    onlogout: function () {
		        window.location = '?logout=1';
		    }
		});
	}
	function CheckNetwork() {
		$.ajax({
			url: jBlocks.personaBaseUrl+"?ts="+new Date().getTime(),
			success: function() {
				//alert("Got it");
				_NavigatorIdWatch();
			},
			error: function() {
				setTimeout(function() {
					CheckNetwork();
				},2000);
			},
		});
	}
	CheckNetwork();
}
function NavigatorIdRequest() {
	navigator.id.request({
		returnTo: "/jocly/jblocks/login/persona/new-user",
	});
}
function NavigatorIdLogout() {
	navigator.id.logout();
}

$.jBlocks("autoSyncContentSize");

$.jBlocks("updateViewport",{
	fixed: "both",
});

$.jBlocks("updateOptions",{
	onResize: function(geometry,viewport) {
		viewport.w=6;
		viewport.h=8;
	},
	//blockClass: "jblocks-block-border",
	//scrollable: true,
	//debugBlockLayout: true,
});

$.jBlocks("addNewBlock","Spacer",{
	priority: 100,
	w: 1,
	h: 7,
	pref: "top left",
	expandWidth: 0,
});
$.jBlocks("addNewBlock","Spacer",{
	priority: 100,
	w: 1,
	h: 7,
	pref: "top right",
	expandWidth: 0,
});
$.jBlocks("addNewBlock","Spacer",{
	priority: 100,
	w: 4,
	h: 1,
	pref: "left top",
	expandHeight: 0,
});

$.jBlocks("addNewBlock","Spacer",{
	priority: 100,
	w: 4,
	h: 1,
	pref: "left bottom",
	expandHeight: 0,
});

function MakeLoginButton() {
	$.jBlocks("addNewBlock","Link",{
		priority: 50,
		w: 4,
		h: 1,
	},{
		text: "<?= t('Login') ?>",
		onClick: function() { Clear();NavigatorIdRequest(); },
		contentBorderRadius: 0,
		onResize: function(geometry) {
			this.element.css({
				"font-size": geometry.height*0.3+"pt",
				"line-height": geometry.height+"px",
			});
		},
	});
}

function MakeLogoutButton() {
	$.jBlocks("addNewBlock","Link",{
		priority: 50,
		w: 4,
		h: 1,
	},{
		text: "<?= t('Logout') ?>",
		onClick: function() { Clear();NavigatorIdLogout(); },
		contentBorderRadius: 0,
		onResize: function(geometry) {
			this.element.css({
				"font-size": geometry.height*0.3+"pt",
				"line-height": geometry.height+"px",
			});
		},
});
}

function MakeInputName(inputNameText,pseudo,error) {
	$.jBlocks("addNewBlock","Text",{
		priority: 50,
		w: 4,
		h: 3,
		pref: "left top",
	},{
		text: inputNameText,
		multiline: true,
		blockContentClass: "jblocks-centered",
	});
	var nameInput=$.jBlocks("addNewBlock","Input",{
		priority: 50,
		w: 4,
		h: 1,
		pref: "left top",
	},{
		text: pseudo,
		onKeyDown: function() {
			$(".jblocks-login-error").hide();
		},
	});
	$.jBlocks("addNewBlock","Text",{
		priority: 50,
		w: 4,
		h: 1,
		pref: "left top",
	},{
		text: error?error:"",
		multiline: true,
		blockContentClass: "jblocks-centered jblocks-login-error",
	});
	$.jBlocks("addNewBlock","JBlock",{
		priority: 50,
		w: 4,
		h: 1,
		pref: "left top",
	},{
		onCreate: function() {
			var $this=this;
			this.selfJBlocks.addNewBlock("Link",{
				priority: 50,
				w: 2,
				h: 1,
				pref: "left top",
			},{
				text: "<?= t('Cancel') ?>",
				onClick: function() {
					Clear();
					Notify('logincancel');
					NavigatorIdLogout();
				},
			});
			this.selfJBlocks.addNewBlock("Link",{
				priority: 50,
				w: 2,
				h: 1,
				pref: "right top",
			},{
				text: "<?= t('Continue') ?>",
				onClick: function() {
					Clear();
					Notify('logincancel');
					window.location='?firstlogin=1&pseudo='+encodeURIComponent(nameInput.val());
				},
			});
		}
	});
}

<?php 
	$js=ob_get_clean();
	$extraHTML='';
	if (!empty($_POST)) {
		if(!empty($_SESSION['JB_email']))
			unset($_SESSION['JB_email']);
	    $result = _jblocks_verify_assertion($_POST['assertion']);
	    if ($result->status === 'okay') {
	    	if($user->uid==0) {
	    		$account=user_load_by_mail($result->email);
	    		if($account) {
	    			$user=$account;
	    			user_login_finalize();
	    			$js.=_jblocks_notify_logged($account);
	    			$extraHTML.=_jblocks_watch($result->email);
	    			$js.='MakeLogoutButton();';	
	    		} else  {
	    			$_SESSION['JB_email']=$result->email;
	    			header("Location: ?firstlogin=1");
	    		}
	    	} else {
	    		$account=user_load($user->uid);
	    		$js.=_jblocks_notify_logged($account);
	    		$extraHTML.=_jblocks_watch($result->email);
				$js.='MakeLogoutButton();';	
	    	}
	    } else {
	        $extraHTML.=_jblocks_watch();
	        echo "<p>Error: " . $result->reason . "</p>";
	    }
	} elseif (!empty($_GET['logout'])) {
		if(!empty($_SESSION['JB_email']))
			unset($_SESSION['JB_email']);
		$extraHTML.=_jblocks_watch();
	    _jblocks_user_logout();
	    drupal_add_js('window.location="persona";','inline');
	} elseif (!empty($_GET['firstlogin'])) {
		if(!empty($_SESSION['JB_email'])) {
			$extraHTML.=_jblocks_watch($_SESSION['JB_email']);
   			$m=array();
   			$askPseudo=true;
   			$pseudo="";
   			if(!empty($_GET['pseudo'])) {
   				$pseudo=$_GET['pseudo'];
   				$error=_jblocks_user_validate_name($pseudo);
   				if(!$error) {
   					$askPseudo=false;
					$fields = array(
					    'name' => $pseudo,
					    'mail' => $_SESSION['JB_email'],
					    'pass' => user_password(8),
					    'status' => 1,
					    'init' => $_SESSION['JB_email'],
						'signature_format' => 'filtered_html',
						'timezone' => 'Europe/Berlin',
					    'roles' => array(
					    		DRUPAL_AUTHENTICATED_RID => 'authenticated user',
					    ),
					);
					$account = user_save('', $fields);
	    			$user=$account;
	    			user_login_finalize();
					$js.=_jblocks_notify_logged($account);
					$js.='MakeLogoutButton();';	
   				}
   			} else {
   				if(preg_match('/^([^@]+)@/',$_SESSION['JB_email'],$m))
   					$pseudo=$m[1];
   				$error=_jblocks_user_validate_name($pseudo);
   			}
   			if($askPseudo) {
   				$js.='Notify("logincreate",{email:"'.$_SESSION['JB_email'].'"});';
   				$js.='var inputNameText="'.t('You logged to Jocly for the first time. At this point, we only know you as @email. Please enter a name for other players to see you as.',
					array('@email'=>$_SESSION['JB_email'])).'";';
   				$js.='MakeInputName(inputNameText,"'.$pseudo.'",'.(empty($error)?'null':'"'.$error.'"').');';
			}
		} else 
			header('Location: #');
	} else {
		if(!empty($_SESSION['JB_email']))
			unset($_SESSION['JB_email']);
		if($user->uid==0) {
	    	drupal_add_js('parent.$(parent.document).trigger("jblocks.logout","persona");','inline');
			$extraHTML.=_jblocks_watch();
			$js.='MakeLoginButton();';		
		} else {
	    	$account=user_load($user->uid);
	    	$js.=_jblocks_notify_logged($account);
	    	$extraHTML.=_jblocks_watch($account->mail);
			$js.='MakeLogoutButton();';		
		}
			
	}
	drupal_add_js($js,'inline');
	$output=_jblocks_page_content($extraHTML);
	return $output;
}

function _jblocks_watch($email = 'null') {
    if ($email !== 'null') {
        $email = "'$email'";
    }
    ob_start();
    echo <<<EOF
<script>
	NavigatorIdWatch($email);
</script>
EOF;
    return ob_get_clean();
}

function _jblocks_verify_assertion($assertion, $cabundle = NULL) {
    $audience = (empty($_SERVER['HTTPS']) ? 'http://' : 'https://') . $_SERVER['SERVER_NAME'] . ':' . $_SERVER['SERVER_PORT'];
    $postdata = 'assertion=' . urlencode($assertion) . '&audience=' . urlencode($audience);

    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, "https://verifier.login.persona.org/verify");
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $postdata);
    if (substr(PHP_OS, 0, 3) == 'WIN') {
        if (!isset($cabundle)) {
            $cabundle = dirname(__FILE__).DIRECTORY_SEPARATOR.'cabundle.crt';
        }
        curl_setopt($ch, CURLOPT_CAINFO, $cabundle);
    }
    $json = curl_exec($ch);
    curl_close($ch);

    return json_decode($json);
}

function _jblocks_new_user() {
	drupal_add_css(JBLOCKS_PATH.'/jblocks.css');
	//drupal_add_js(JBLOCKS_PATH.'/jblocks.fit.js');
	require('jblocks.inc');
	_jblocks_jqm();
	//drupal_add_js('JoclyFit.AutoFitContent();','inline');
	ob_start();
	echo '<div id="new-user" data-role="page">';
	echo '<div data-role="content">';
	echo '<h1>'.t('Welcome to Jocly').'</h1>';
	echo '<p>'.t('If the window you logged in from is still open, you can close this tab and return to that first place. Otherwise click the button below.').'<p>';
	echo '<p><a data-role="button" href="/jocly/hub" rel="external">'.t('Open a new Jocly Hub').'</a></p>';
	echo '</div></div>';
	return ob_get_clean();
}

?>
