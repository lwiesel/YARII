<?php
$qualities      = array(75, 60, 40, 20, 15);        // the qualities break-points to use (qualities, in %)
$resolutions    = array(1200, 992, 768, 520, 250);  // the resolution break-points to use (screen widths, in pixels)
$bandwidths     = array(100, 500, 700, 900);        // the bandwidth break-points to use (in kbps)
$resp_times     = array(6, 4, 2, 1, 0.5);           // the downloading time break-points (in seconds)
$cache_path     = "img/yarii-cache";                // where to store the generated re-sized images. Specify from your document root!
define("DEFAULT_JPG_QUALITY",   75);                // the quality of any generated JPGs on a scale of 0 to 100
define("SHARPEN",               FALSE);             // Shrinking images can blur details, perform a sharpen on re-scaled images?
define("WATCH_CACHE",           TRUE);              // check that the adapted image isn't stale (ensures updated source images are re-cached)
define("BROWSER_CACHE",         60 * 60 * 24 * 7);  // How long the BROWSER cache should last (seconds, minutes, hours, days. 7days by default)
define("MOBILE_FIRST",          TRUE);              // If no information is given, use low quality
define("STAMPED",               FALSE);             // Stamp images with quality on the top left corner
/* END CONFIG ----------------------------------------------------------------------------------------------------------
------------------------ Don't edit anything after this line unless you know what you're doing -------------------------
--------------------------------------------------------------------------------------------------------------------- */

//----------------------------------------------------------------------------------------------------------------------
// FUNCTIONS
//----------------------------------------------------------------------------------------------------------------------
/*
 * Mobile detection
 *
 * @return bool
 * only used in the event a cookie isn't available.
 */
function is_mobile()
{
    $userAgent = strtolower($_SERVER['HTTP_USER_AGENT']);
    if(strpos($userAgent, 'mobile') === FALSE)
    {
        return FALSE;
    } else {
        return TRUE;
    }
}

/*
 * Send headers and returns an image.
 *
 * @return string
 */
function sendImage($filename)
{
    $extension = strtolower(pathinfo($filename, PATHINFO_EXTENSION));

    if (in_array($extension, array('png', 'gif', 'jpeg'))) {
        header("Content-Type: image/" . $extension);
    } else {
        header("Content-Type: image/jpeg");
    }

    header("Cache-Control: private, max-age=" . BROWSER_CACHE);
    header('Expires: ' . gmdate('D, d M Y H:i:s', time() + BROWSER_CACHE) . ' GMT');
    header('Content-Length: ' . filesize($filename));

    readfile($filename);
    exit();
}

/*
 * Create and send an image with an error message.
 */
function sendErrorImage($message)
{
    $im = ImageCreateTrueColor(1000, 500);
    $text_color = ImageColorAllocate($im, 233, 14, 91);
    $message_color = ImageColorAllocate($im, 91, 112, 233);

    ImageString($im, 5, 5, 5, "Adaptive Images encountered a problem:", $text_color);
    ImageString($im, 3, 5, 25, $message, $message_color);

    header("Cache-Control: no-store");
    header('Expires: ' . gmdate('D, d M Y H:i:s', time() - 1000) . ' GMT');
    header('Content-Type: image/jpeg');
    ImageJpeg($im);
    ImageDestroy($im);
    exit();
}

/*
 * Generates the given cache file for the given source file with the given resolution
 */
function generateImage($source_file, $cache_file, $quality)
{
	$extension = strtolower(pathinfo($source_file, PATHINFO_EXTENSION));

    // Check the image dimensions
    $dimensions = GetImageSize($source_file);
    $width = $dimensions[0];
    $height = $dimensions[1];
	
    $dst = ImageCreateTrueColor($width, $height); // re-sized image

	switch ($extension) {
        case 'png':
            $src = @ImageCreateFromPng($source_file); // original image
            break;
        case 'gif':
            $src = @ImageCreateFromGif($source_file); // original image
            break;
        default:
            $src = @ImageCreateFromJpeg($source_file); // original image
            ImageInterlace($dst, true); // Enable interlancing (progressive JPG, smaller size file)
            break;
    }

    if ($extension == 'png') {
        imagealphablending($dst, false);
        imagesavealpha($dst, true);
        $transparent = imagecolorallocatealpha($dst, 255, 255, 255, 127);
        imagefilledrectangle($dst, 0, 0, $width, $height, $transparent);
    }

    ImageCopyResampled($dst, $src, 0, 0, 0, 0, $width, $height, $width, $height); // do the resize in memory
    ImageDestroy($src);

	if(STAMPED)
    {
        $text_color = ImageColorAllocate($dst, 255, 255, 255);
		imagettftext($dst, 40, 0, 10, 50, $text_color, '../font/coolvetica.ttf', 'Qualité : '.$quality);
    }

    $cache_dir = dirname($cache_file);

    // does the directory exist already?
    if (!is_dir($cache_dir)) {
        if (!mkdir($cache_dir, 0755, true)) {
            // check again if it really doesn't exist to protect against race conditions
            if (!is_dir($cache_dir)) {
                // uh-oh, failed to make that directory
                ImageDestroy($dst);
                sendErrorImage("Failed to create cache directory: $cache_dir");
            }
        }
    }

    if (!is_writable($cache_dir)) {
        sendErrorImage("The cache directory is not writable: $cache_dir");
    }
	
    // save the new file in the appropriate path, and send a version to the browser
    switch ($extension) {
        case 'png':
            $gotSaved = ImagePng($dst, $cache_file);
            break;
        case 'gif':
            $gotSaved = ImageGif($dst, $cache_file);
            break;
        default:
            $gotSaved = ImageJpeg($dst, $cache_file, $quality);
            break;
    }
    ImageDestroy($dst);
	
    if (!$gotSaved && !file_exists($cache_file)) {	
		sendErrorImage("Failed to create image: $cache_file");
    }

    return $cache_file;
}

/*
 * Sharpen images function (not recommanded)
 */
function findSharp($intOrig, $intFinal)
{
    $intFinal = $intFinal * (750.0 / $intOrig);
    $intA = 52;
    $intB = -0.27810650887573124;
    $intC = .00047337278106508946;
    $intRes = $intA + $intB * $intFinal + $intC * $intFinal * $intFinal;
    return max(round($intRes), 0);
}

/*
 * Refreshes the cached image if it's outdated
 */
function refreshCache($source_file, $cache_file, $quality) {
	if (file_exists($cache_file)) {
        // Not modified
        if (filemtime($cache_file) >= filemtime($source_file)) {
            return $cache_file;
        }

        // Modified, clear it
        unlink($cache_file);
    }
    return generateImage($source_file, $cache_file, $quality);
}

function chooseQuality($qualities, $bandwidths, $resolutions, $resp_times, $source_file){

    // A. GET GLOBAL INFORMATION ABOUT THE REQUEST AND THE BROWSER
    // 1. Check if the original quality is requested
    $force_quality = (isset($_GET['force_res']) && $_GET['force_res'] == 1);
    if($force_quality)
    {
        return DEFAULT_JPG_QUALITY;
    }
	
    // 2. Check if client is known as mobile
    $is_mobile = is_mobile();

    // 3. Get Client Width
    $client_width = 1; // Some low value to trigger the mobile-first behavior if the cookie is nok
    if (isset($_COOKIE['yarii_resolution'])) {
        $cookie_value = $_COOKIE['yarii_resolution'];

        // does the cookie look valid? [whole number, comma, potential floating number]
        if (! preg_match("/^[0-9]+$/", "$cookie_value")) { // no it doesn't look valid
            setcookie("yarii_resolution", "$cookie_value", time()-100); // delete the mangled cookie
        }
        else { // the cookie is valid, do stuff with it
            $client_width  = (int) $cookie_value; // the base resolution (CSS pixels)
        }
    } else {
        if((MOBILE_FIRST && !$force_quality) || $is_mobile)
        {
            return min($qualities);
        } else {
            return DEFAULT_JPG_QUALITY;
        }
    }

    // 4. Get Client PixelRatio
    $client_pixelratio = 1;
    if (isset($_COOKIE['yarii_pixelratio'])) {
        $cookie_value = $_COOKIE['yarii_pixelratio'];

        // does the cookie look valid? [whole number, comma, potential floating number]
        if (! preg_match("/^[0-9\.]+$/", "$cookie_value")) { // no it doesn't look valid
            setcookie("yarii_pixelratio", "$cookie_value", time()-100); // delete the mangled cookie
        }
        else { // the cookie is valid, do stuff with it
            $client_pixelratio  = (int) $cookie_value; //
        }
    }

    // 5. Get Client Bandwidth
    $client_bandwidth = 0.0001; // Some low value to trigger the mobile-first behavior if the cookie is nok
    if (isset($_COOKIE['yarii_bandwidth'])) {
        $cookie_value = $_COOKIE['yarii_bandwidth'];

        // does the cookie look valid? [whole number, comma, potential floating number]
        if (! preg_match("/^[0-9]+$/", "$cookie_value")) { // no it doesn't look valid
            setcookie("yarii_pixelratio", "$cookie_value", time()-100); // delete the mangled cookie
        }
        else { // the cookie is valid, do stuff with it
            $client_bandwidth  = (int) $cookie_value; // the base resolution (CSS pixels)
        }
    } else {
        if((MOBILE_FIRST && !$force_quality) || $is_mobile)
        {
            return min($qualities);
        } else {
            return DEFAULT_JPG_QUALITY;
        }
    }
    $source_size_kb = round(filesize($source_file) / 1024, 2);
    $dl_time = round($source_size_kb / $client_bandwidth * 100, 2);

	// 6. If client is mobile and low-bandwidh, stop now & give minimal quality
    if($is_mobile && $client_bandwidth < 100)
    {
        return min($qualities);
    }

    // 7. Sorting of the break-points
    rsort($qualities);
    sort($bandwidths);
    rsort($resp_times);

    $requested_width = $client_width * $client_pixelratio;

	//8. Evaluate Quality
    $quality = getCalcQual($qualities, $resolutions, $requested_width);

	//9. Evaluate Download Time
	$time = getCalcDlTime($resp_times, $dl_time);

	//10. Get total score
    $score = $quality['score'] + $time['score'];

	//11. Calculate target score
    $target_score = count($qualities) - 1;

    // 12. PixelRatio impact
    if(!$force_quality && $score < $target_score && $client_pixelratio > 1)
    {
        $quality = getCalcQual($qualities, $resolutions, $client_width);
        $time = getCalcDlTime($resp_times, $dl_time);

        $score = $quality['score'] + $time['score'];
    }

    // 13. Quality adjustment along bandwidth score
    if(!$force_quality && $score < $target_score)
    {
        $res_points_to_gain = $target_score - $score;
        $res_index = min($quality['score'] + $res_points_to_gain, count($qualities) - 1);

        $quality['quality'] = $qualities[$res_index];
    }

    return $quality['quality'];
}

function getCalcQual($qualities, $resolutions, $client_width){
    $result = array();

    $result['quality'] = DEFAULT_JPG_QUALITY;
    $result['score'] = 0;
    foreach($resolutions as $i => $res) // Filter down
    {
        if($client_width <= $res)
        {
            $result['quality'] = $qualities($i);
            $result['score'] = $i + 1;
        }
    }

    return $result;
}

function getCalcBandwidth($bandwidths, $client_bandwidth){
    $result = array();

    $result['bandwidth'] = 1/*$bandwidths[0]*/;
    $result['score'] = 0;
    foreach($bandwidths as $j => $bw)
    {
        if($client_bandwidth >= $bw)
        {
            $result['bandwidth'] = $bw;
            $result['score'] = $j + 1;
        }
    }

    return $result;
}

function getCalcDlTime($resp_times, $dl_time){
    $result = array();

    $result['time'] = 10/*$resp-times[0]*/;
    $result['score'] = 0;
    foreach($resp_times as $k => $rt)
    {
        if($dl_time <= $rt)
        {
            $result['time'] = $rt;
            $result['score'] = $k + 1;
        }
    }

    return $result;
}

//----------------------------------------------------------------------------------------------------------------------
// BEGINNING OF THE PROCEDURE
//----------------------------------------------------------------------------------------------------------------------
/* get all of the required data from the HTTP request */
$document_root = $_SERVER['DOCUMENT_ROOT'];
$requested_uri = str_replace("yarii.", "", parse_url(urldecode($_SERVER['REQUEST_URI']), PHP_URL_PATH));

/* if the requested URL starts with a slash, remove the slash */
/*if (substr($requested_uri, 0, 1) == "/") {
    $requested_uri = substr($requested_uri, 1);
}*/

$requested_file = basename($requested_uri);
$source_file = $document_root . $requested_uri;

/* 1. Check if the file exists at all */
if (!file_exists($source_file)) {
    header("Status: 404");
    exit();
}

/* 2. Check that PHP has the GD library available to use for image re-sizing */
if (!extension_loaded('gd')) { // it's not loaded
    if (!function_exists('dl') || !dl('gd.so')) { // and we can't load it either
        // no GD available, so deliver the image straight up
        trigger_error('You must enable the GD extension to make use of Adaptive Images', E_USER_WARNING);
        sendImage($source_file);
    }
}


/* 3. Does the $cache_path directory exist already? */
if (!is_dir($document_root . $cache_path)) // no
{
    if (!mkdir($document_root . $cache_path, 0755, true)) // so make it
    {
        if (!is_dir($document_root . $cache_path)) // check again to protect against race conditions
        {
            // uh-oh, failed to make that directory
            sendErrorImage("Failed to create cache directory at: " . $document_root . $cache_path);
        }
    }
}

/* 4. Which quality should we target ? */
$quality = chooseQuality($qualities, $bandwidths, $resolutions, $resp_times, $source_file);

/* 5. Image generation */
/* Use the quality value as a path variable and check to see if an image of the same name exists at that path */
$cache_file = $document_root.$cache_path."/".$quality.$requested_uri;

if(WATCH_CACHE && file_exists($cache_file))
{
    $file = $cache_file;
    // if cache watching is enabled, compare cache and source modified dates to ensure the cache isn't stale
    $file = refreshCache($source_file, $cache_file, $quality);
} else {
    /* It exists as a source file, and it doesn't exist cached - lets make one: */
    $file = generateImage($source_file, $cache_file, $quality);
}

/* 6. Send response */
sendImage($file);