<?php
if(!defined('JBLOCKS_PATH'))
	define('JBLOCKS_PATH',drupal_get_path('module','jblocks'));

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
	//die(drupal_json_encode($userData));
	drupal_add_js('Notify("login",'.drupal_json_encode($userData).');','inline');
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
	global $user;
	
	drupal_add_css(JBLOCKS_PATH.'/jblocks.css');
	drupal_add_js('https://login.persona.org/include.js','external');
	drupal_add_js(JBLOCKS_PATH.'/jblocks.fit.js');
	require(JBLOCKS_PATH.'/jblocks.inc');
	_jblocks_jqm();
	ob_start();
?>
JoclyFit.AutoFitContent();
function Clear() {
	$("div[data-role=content]").hide();
}

function Notify(event,param) {
	if(arguments.length>1)
		parent.$(parent.document).trigger('jblocks.'+event,param);
	else
		parent.$(parent.document).trigger('jblocks.'+event);
}

function NavigatorIdWatch(email) {
	navigator.id.watch({
	    loggedInUser: email,
	    onlogin: function (assertion) {
	        var assertion_field = document.getElementById("assertion-field");
	        assertion_field.value = assertion;
	        var login_form = document.getElementById("login-form");
	        login_form.submit();
	    },
	    onlogout: function () {
	        window.location = '?logout=1';
	    }
	});
}
function NavigatorIdRequest() {
	navigator.id.request({
		returnTo: "/jocly/jblocks/login/persona/new-user",
	});
}
function NavigatorIdLogout() {
	navigator.id.logout();
}
<?php 
	drupal_add_js(ob_get_clean(),'inline');
	ob_start();
	echo "<div data-role='page' id='jblocks-login'>";
	echo "<div data-role='content'>";
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
	    			_jblocks_notify_logged($account);
	    			_jblocks_watch($result->email);
	    			echo '<div data-role="controlgroup">';
	    			echo '<a href="javascript:Clear();NavigatorIdLogout()" data-role="button">Logout</a>';
	    			echo '</div/>';
	    		} else  {
	    			$_SESSION['JB_email']=$result->email;
	    			header("Location: ?firstlogin=1");
	    		}
	    	} else {
	    		$account=user_load($user->uid);
	    		_jblocks_notify_logged($account);
	    		_jblocks_watch($result->email);
	    		echo '<div data-role="controlgroup">';
	    		echo '<a href="javascript:Clear();NavigatorIdLogout()" data-role="button">Logout</a>';
	    		echo '</div>';
	    	}
	    } else {
	        _jblocks_watch();
	        echo "<p>Error: " . $result->reason . "</p>";
	    }
	} elseif (!empty($_GET['logout'])) {
		if(!empty($_SESSION['JB_email']))
			unset($_SESSION['JB_email']);
		_jblocks_watch();
	    _jblocks_user_logout();
	    drupal_add_js('window.location="persona";','inline');
	} elseif (!empty($_GET['firstlogin'])) {
		if(!empty($_SESSION['JB_email'])) {
			_jblocks_watch($_SESSION['JB_email']);
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
					_jblocks_notify_logged($account);
	    			echo '<div data-role="controlgroup">';
					echo '<a href="javascript:Clear();NavigatorIdLogout()" data-role="button">Logout</a>';
					echo '</div>';
   				}
   			} else {
   				if(preg_match('/^([^@]+)@/',$_SESSION['JB_email'],$m))
   					$pseudo=$m[1];
   				$error=_jblocks_user_validate_name($pseudo);
   			}
   			if($askPseudo) {
   				drupal_add_js('Notify("logincreate",{email:"'.$_SESSION['JB_email'].'"});','inline');
?>
			<p><?= t('You logged to Jocly for the first time. At this point, we only know you as @email. Please enter a name for other players to see you as.',
					array('@email'=>$_SESSION['JB_email'])) ?></p>
			<input type="text" id="pseudo" value="<?= $pseudo ?>"/>
<?php 			if($error) { ?>
			<p class="jblocks-login-error"><?= $error ?></p>
<?php 			} ?>
   			<div data-role="controlgroup" data-type="horizontal">
   				<a href="javascript:Clear();Notify('logincancel');NavigatorIdLogout();" data-role="button">Cancel</a>
   				<a href="javascript:Clear();Notify('logincancel');window.location='?firstlogin=1&pseudo='+encodeURIComponent(document.getElementById('pseudo').value);" data-role="button">Continue</a>
   			</p>';
<?php 
			}
		} else 
			header('Location: #');
	} else {
		if(!empty($_SESSION['JB_email']))
			unset($_SESSION['JB_email']);
		if($user->uid==0) {
	    	drupal_add_js('parent.$(parent.document).trigger("jblocks.logout");','inline');
			_jblocks_watch();
	    	echo "<p><a href=\"javascript:Clear();NavigatorIdRequest();\" data-role=\"button\">Login</a>";
		} else {
	    	$account=user_load($user->uid);
	    	_jblocks_notify_logged($account);
	    	_jblocks_watch($account->mail);
	    	echo '<div Xdata-role="controlgroup">';
	    	echo '<a href="javascript:Clear();NavigatorIdLogout()" data-role="button">Logout</a>';
	    	echo '</div>';
		}
			
	}
	echo "</div></div>";
	return ob_get_clean();
}

function _jblocks_watch($email = 'null') {
    if ($email !== 'null') {
        $email = "'$email'";
    }
    echo <<<EOF
<script>
	NavigatorIdWatch($email);
</script>
<form id="login-form" method="POST">
<input id="assertion-field" type="hidden" name="assertion" value="">
</form>
EOF;
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
	drupal_add_js(JBLOCKS_PATH.'/jblocks.fit.js');
	require('jblocks.inc');
	_jblocks_jqm();
	drupal_add_js('JoclyFit.AutoFitContent();','inline');
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
