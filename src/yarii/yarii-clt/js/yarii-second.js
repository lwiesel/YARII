( function ( yarii, window, document, navigator ) {
    "use strict";

    yarii.options = yarii.options || {};

    // Options
    var opts = yarii.options,
    speedTestUri                = opts.speedTestUri             || 'http://guil.chessyweb.com/build_0.3/libs/yarii/speed-test/',
    speedTestKB                 = opts.speedTestKB              || 25,
    minKbpsForHighBandwidth     = opts.minKbpsForHighBandwidth  || 100,
    speedTestExpireMinutes      = opts.speedTestExpireMinutes   || 30,

    // Property strings
    BANDWIDTH                   = 'bandwidth',
    CONNECTION_KBPS             = 'connKbps',
    CONNECTION_TYPE             = 'connType',
    CONNECTION_TEST_RESULT      = 'connTestResult',
    STATUS_LOADING              = 'loading',
    STATUS_COMPLETE             = 'complete',
    CONNECTION_TYPE_SLOW        = 'connTypeSlow',
    LOCAL_STORAGE_KEY           = 'yarii',


    // Misc vars
    speedConnectionStatus,

    // Functions
    speedTest = function(){
        // If there is a status then we've already got info or it already started
        if ( speedConnectionStatus ) return;

        // if we know the connection is 2g or 3g
        // don't even bother with the speed test, cuz its slow
        // Network connection feature detection referenced from Modernizr
        // Modernizr v2.5.3, www.modernizr.com
        // Copyright (c) Faruk Ates, Paul Irish, Alex Sexton
        // Available under the BSD and MIT licenses: www.modernizr.com/license/
        // https://github.com/Modernizr/Modernizr/blob/master/feature-detects/network-connection.js
        // Modified by Adam Bradley for Foresight.js
        var connection = navigator.connection || { type: 'unknown' }; // polyfill
        var isSlowConnection = connection.type == 3 // connection.CELL_2G
            || connection.type == 4 // connection.CELL_3G
            || /^[23]g$/.test( connection.type ); // string value in new spec
        yarii[ CONNECTION_TYPE ] = connection.type;
        if ( isSlowConnection ) {
            // we know this connection is slow, don't bother even doing a speed test
            yarii[ CONNECTION_TEST_RESULT ] = CONNECTION_TYPE_SLOW;
            yarii[ CONNECTION_KBPS ] = 1;
            speedConnectionStatus = STATUS_COMPLETE;
            return;
        }

        // check if a speed test has recently been completed and its
        // results are saved in the local storage
//        try {
//            var fsData = JSON.parse( localStorage.getItem( LOCAL_STORAGE_KEY ) );
//            if ( fsData !== null ) {
//                if ( ( new Date() ).getTime() < fsData.exp ) {
//                    // already have connection data within our desired timeframe
//                    // use this recent data instead of starting another test
//                    yarii[ BANDWIDTH ] = fsData.bw;
//                    yarii[ CONNECTION_KBPS ] = fsData.kbps;
//                    yarii[ CONNECTION_TEST_RESULT ] = 'localStorage';
//                    speedConnectionStatus = STATUS_COMPLETE;
//                    return;
//                }
//            }
//        } catch( e ) { }

        var
        speedTestImg = document.createElement( 'img' ),
        endTime,
        startTime,
        speedTestTimeoutMS;

        speedTestImg.onload = function () {
            // speed test image download completed
            // figure out how long it took and an estimated connection speed
            endTime = ( new Date() ).getTime();

            var duration = ( endTime - startTime ) / 1000;
//            duration = ( duration > 1 ? duration : 1 ); // just to ensure we don't divide by 0
//            duration += 10;

            yarii[ CONNECTION_KBPS ] = ( ( speedTestKB * 1024 * 8 ) / duration ) / 1024 || 1;
            yarii[ BANDWIDTH ] = ( yarii[ CONNECTION_KBPS ] >= minKbpsForHighBandwidth ? 'high' : 'low' );

            speedTestComplete( 'networkSuccess' );
        };

        speedTestImg.onerror = function () {
            // fallback incase there was an error downloading the speed test image
            speedTestComplete( 'networkError', 5 );
        };

        speedTestImg.onabort = function () {
            // fallback incase there was an abort during the speed test image
            speedTestComplete( 'networkAbort', 5 );
        };

        // begin the network connection speed test image download
        startTime = ( new Date() ).getTime();
        speedConnectionStatus = STATUS_LOADING;
        if ( document.location.protocol === 'https:' ) {
            // if this current document is SSL, make sure this speed test request
            // uses https so there are no ugly security warnings from the browser
            speedTestUri = speedTestUri.replace( 'http:', 'https:' );
        }
//        speedTestImg.src = speedTestUri + "?r=" + Math.random();
        speedTestImg.src = speedTestUri + speedTestKB + "K.jpg?r=" + Math.random();

        // calculate the maximum number of milliseconds it 'should' take to download an XX Kbps file
        // set a timeout so that if the speed test download takes too long
        // than it isn't a 'high-bandwidth' and ignore what the test image .onload has to say
        // this is used so we don't wait too long on a speed test response
        // Adding 350ms to account for TCP slow start, quickAndDirty === TRUE
        speedTestTimeoutMS = ( ( ( speedTestKB * 8 ) / minKbpsForHighBandwidth ) * 1000 ) + 350;
        setTimeout( function () {
            yarii[ CONNECTION_KBPS ] = minKbpsForHighBandwidth / 2;
            speedTestComplete( 'networkSlow' );
        }, speedTestTimeoutMS );
    },

    speedTestComplete = function ( connTestResult, expireMinutes ) {
        // if we haven't already gotten a speed connection status then save the info
        if (speedConnectionStatus === STATUS_COMPLETE) return;

        // first one with an answer wins
        speedConnectionStatus = STATUS_COMPLETE;
        yarii[ CONNECTION_TEST_RESULT ] = connTestResult;

//        if(connTestResult !== 'networkSuccess')
//        {
//            try {
//                if ( !expireMinutes ) {
//                    expireMinutes = speedTestExpireMinutes;
//                }
//                var fsDataToSet = {
//                    kbps: yarii[ CONNECTION_KBPS ],
//                    bw: yarii[ BANDWIDTH ],
//                    exp: ( new Date() ).getTime() + (expireMinutes * 60000)
//                };
//                localStorage.setItem( LOCAL_STORAGE_KEY, JSON.stringify( fsDataToSet ) );
//            } catch( e ) { }
//        }

        var connection_kbps = Math.round(yarii[ CONNECTION_KBPS ]);
        if(isNaN(connection_kbps))
        {
            connection_kbps = 1;
        }
        document.cookie = 'yarii_bandwidth=' + connection_kbps + '; path=/';
    }
    ;

    speedTest();

} ( this.yarii = this.yarii || {}, this, document, navigator ) );


