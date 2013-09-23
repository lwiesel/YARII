# YARII, Responsive Images for All ! #
----------
## *- BETA LAUNCH EARLY OCTOBER 2013 -* ##
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

But just remember that **YARII is able to detect searchbots like Google's**, so that the images sent to them are always in full quality, even if you choose mobile first approach. Your SEO is safe !

## Installation ##

Coming very soon... :)
