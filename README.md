# YARII, Responsive Images! #
----------
### *- ALPHA VERSION - USE WITH CAUTION -* ###
----------
## What is it ? ##
**YARII is a way to implement responsive images without any img markup changes, thanks to server-side modules.**

YARII detects **screen resolution, bandwith and HD screens** to serve the exact image needed.

On top of that, a JQuery script ensure beautiful **progressive enhancement on js-able browsers**.


*YARII has not been entirely created from scratch. Some parts of code are forked from these great projects :*

- [MattWilcox/Adaptative-Images](https://github.com/MattWilcox/Adaptive-Images "MattWilcox/Adaptative-Images")
- [adamdbradley/foresight.js](https://github.com/adamdbradley/foresight.js/ "adamdbradley/foresight.js")
- [drewbrolik/Responsive-Img](https://github.com/drewbrolik/Responsive-Img "drewbrolik/Responsive-Img")

*Go check them, they really are inspiring projects.*

## How does it work ? ##
YARII's action is divided in 2 steps: 

1. YARII intercepts images requests on server side and send an appropriate image to the client depending on  its **resolution** (also detecting **HD screens)** and its **bandwidth**.

2. YARII starts reloading full quality image as **background task**, **if necessary** (i.e. image quality too low for the client). When load is complete, the low quality image get replaced, optionally with animation.


## So what about browsers without Javascript enabled ? ##
YARII is based on a **Progressive Enhancement** philosophy. Recent publications stated that images should be sent to non-js browser in low quality by default (mobile first behavior).

YARII let you choose wether you want to sent low quality images or original images to non-js browsers.

<!-- But just remember that **YARII is able to detect searchbots like Google's**, so that the images sent to them are always in full quality, even if you choose mobile first approach. Your SEO is safe ! -->

## Installation ##
### Server side ###
First, put the `yarii-srv` folder wherever you want on your server.

Then, add these lines in your `.htaccess` file. Don't forget to adapt the path to your configuration.

    <IfModule mod_rewrite.c>
    	Options +FollowSymlinks
    	RewriteEngine On
    
    	# YARII -----------------------------------------------------------------------------------
    
    	# Add any directories you wish to omit from the YARII process on a new line, as follows:
    	# RewriteCond %{REQUEST_URI} !ignore-this-directory
    	# RewriteCond %{REQUEST_URI} !and-ignore-this-directory-too
    
    	#  RewriteCond %{REQUEST_URI} !assets
    
    	# don't apply the YARII behaviour to images inside YARII's cache folder:
    	RewriteCond %{REQUEST_URI} !yarii-cache
    
    	RewriteCond %{REQUEST_URI} \/yarii\.
    
    	# Send any GIF, JPG, or PNG request that IS NOT stored inside one of the above directories
    	# to yarii.php so we can select appropriately versions
    
    	RewriteRule \.(?:jpe?g|gif|png|JPG)$ path/to/yarii-srv/yarii.php
    
    	# END YARII -------------------------------------------------------------------------------
    </IfModule>

If you don't have access to your `.htaccess` or if you want to select the folders where YARII applies, just create one in your image directory, assuming you regrouped your images in one location. Otherwise, just create one file per directory.

<!--You can configure YARII by changing the values in `yarii-config.php`:-->
**Soon : the "How to configure YARII" page**
<!-- See the [how to configure YARII](http://path/to/yarii/config/section "How to configure YARII") section. -->

### Client side ###
Add links to the folowing javascript files:

- `yarii-first.js` (resolution detection)
- `yarii-second.js` (bandwidth detection)
- `yarii-third.js` (background task reload of full quality images)

To enable full quality images reloading, add this line at the end of the page, before `</body>`:
    
	<script>
    	$('img').yarii();
    </script>

That's it ! You're done !

<!-- To understand how you can configure YARII on the client side, see the [how to configure YARII](http://path/to/yarii/config/section "How to configure YARII") section. -->
**Soon : the "How to configure YARII" page**

## Changelog ##
0.0.1

- Beta version

## License ##
Soon
