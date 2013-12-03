
String.prototype.hashCode = function(){
    var hash = 0, i, char;
    if (this.length == 0) return hash;
    for (i = 0, l = this.length; i < l; i++) {
        char  = this.charCodeAt(i);
        hash  = ((hash<<5)-hash)+char;
        hash |= 0; // Convert to 32bit integer
    }
    return hash;
};

(function($) {
    // -------------------------------------------------------------------------------------------------------------
    // FUNCTIONS
    // -------------------------------------------------------------------------------------------------------------
    function getImageActualSize($img){
//            console.log('getImageActualSize de ' + $img.attr('src'));

        var result;
        $("<img/>") // Make in memory copy of image to avoid css issues
            .attr("src", $img.attr("src"))
            .load(function() {
                result.real_width = this.width;   // Note: $(this).width() will not
                result.real_height = this.height; // work for in memory images.

                return result;
            });
    }

    function checkImageResolution($yariitem, animation){
        var src;
		var salt;
		var isImage;
		
		if($yariitem.prop("tagName").toLowerCase() == 'img')
        {
            src = $yariitem.attr("src");
            isImage = true;
        } else {
            src = $yariitem.css('background-image');
            src = src.replace('url(','').replace(')','').replace('"', '').replace('"', '');
            isImage = false;
        }
		salt = $yariitem.attr("data-salt");

        if($yariitem.attr('data-yariied') != 'true')
        {
            if(window.loading_status[src.hashCode() + salt] != 'LOADING')
            {
                var w = window,
                    d = document,
                    e = d.documentElement,
                    g = d.getElementsByTagName('body')[0],
                    x = w.innerWidth || e.clientWidth || g.clientWidth,
                    y = w.innerHeight|| e.clientHeight|| g.clientHeight;

                document.cookie = 'yarii_resolution=' + Math.max(x,y) + '; path=/';

                window.loading_status[src.hashCode() + salt] = 'LOADING';

                var src_base = src.split('?');

                console.log('src_base : ' + src_base);
                console.log('src : ' + src_base[0]);

                var $new_img = $("<img/>");

//                    $img.unbind();
                $new_img.load(function(){
//                        console.log('Image ' + $new_img.attr('src') + 'rechargée !');
                    window.loading_status[src.hashCode() + salt] = 'IDLE';

                    if(isImage)
                    {
                        console.log('Got animation = ' + animation);
						if(animation == 'fade')
						{
							$yariitem.parent('div').css('position', 'relative');
						
							var yariitem_height = $yariitem.outerHeight();
							var yariitem_width = $yariitem.outerWidth();
							var yariitem_left = $yariitem.position().left;
							var yariitem_top = $yariitem.position().top;
							
							var $temp = $yariitem.clone();
							$temp
								.hide()
								.addClass('no-flick')
								.attr('src', src_base[0])
								.css('position', 'absolute')
								.css('z-index', 1)
								.css('top', yariitem_top)
								.css('left', yariitem_left)
								.width(yariitem_width)
								.height(yariitem_height)
							;
	
	//                            $('<img src="' +  + '" style="border: ' + yarii_border + ';display: none;position: absolute;top: 0;left:' + yariitem_left + ';width: ' + yariitem_width + 'px;height: ' + yariitem_height + 'px;"/>');
	
							$yariitem.parent().append($temp).find($temp).fadeIn(200, function(){
								$yariitem.attr('src', $new_img.attr('src'));
								$yariitem.attr('data-yariied', 'true');
								$temp.delay(3000).fadeOut(600, function(){
									$(this).remove();
								});
							});
						} else {
							$yariitem.attr('src', $new_img.attr('src'));
							$yariitem.attr('data-yariied', 'true');
						}
						




//                        $yariitem.attr('src', $new_img.attr('src'));
                    } else {
						
						if(animation == 'fade')
						{
//                        	$yariitem.css('background-image', 'url("' + $new_img.attr('src') + '")');

							var yariitem_height = $yariitem.height();
							var yariitem_width = $yariitem.width();
	

							$yariitem.parent().css('position', 'relative');
							
							var $temp = $('<div style="display: none;-webkit-backface-visibility: hidden;-webkit-transform: translate3d(0,0,0);background-position: top; background-repeat: no-repeat; -webkit-background-size: cover;-moz-background-size: cover;-o-background-size: cover;background-size: cover; position: absolute;top: 0;left:0;width: ' + yariitem_width + 'px;height: ' + yariitem_height + 'px;overflow: hidden;"></div>');
	
							$temp.addClass('no-flick');
							$temp.parent().css('-webkit-transform', 'translate3d(0,0,0)');
							
							$yariitem.parent().append($temp);
							
							var delayToShowBG = 0;
							/* SPECIAL WEBKIT */
							var chrome = /chrom(e|ium)/.test(navigator.userAgent.toLowerCase()); 
							
							if(chrome){
								delayToShowBG = 800;
								console.log('Got Chrome !');
							}
							
							$temp.css('background-image', 'url("' + src + '")').delay(delayToShowBG).ready(function(){
								$temp.fadeIn(200, function(){
									//alert('temp ajouté');
									console.log('Container ajouté');
									$yariitem.css('background-image', 'url("' + $new_img.attr('src') + '")').ready(function(){
										console.log('Background-image chargée.');
										$temp.delay(delayToShowBG).fadeOut(600, function(){
											console.log('Cache dégagé.');
											$(this).remove();
										});
									});
								});
							});
	
//                        	$yariitem.css('background-image', 'url("' + $new_img.attr('src') + '")');
//                        	$temp.delay(2000).fadeOut(600);
						} else {
							$yariitem.css('background-image', 'url("' + $new_img.attr('src') + '")');
							$yariitem.attr('data-yariied', 'true');
						}
                    }

                    $yariitem.attr('data-realwidth', this.width);

//                        console.log('New actual Width : ' + this.width);
                });

                $new_img.attr("src", src_base[0] + '?force_res=1');

				console.log('Image en reloading ! force_res = 1');
            }

        } //else {
//                console.log('Image au poil !');
//            }
    }

    $.fn.yarii = function(additionalOptions) {
        // -------------------------------------------------------------------------------------------------------------
        // OPTIONS
        // -------------------------------------------------------------------------------------------------------------
        var options = { //- set default options
            animation : 'none'
        };
		options = $.extend(options, additionalOptions ); //- override default options with user-supplied options

        window.loading_status = [];
		
		window.salt = 1;

//        console.log('Avant boucle');
//        console.log($(this));

        $(this).each(function() { //- do it for 'em all
//            console.log('Début boucle');
//            console.log($(this).attr('src'));
            var $this = $(this); //- get this variable for later
			var src;
			
			$this.attr('data-salt', window.salt);
			window.salt ++;

            if($this.prop("tagName").toLowerCase() == 'img')
            {
                src = $this.attr("src");
            } else {
                src = $(this).css('background-image');
                src = src.replace('url(','').replace(')','').replace('"', '').replace('"', '');
            }
//
//            var breakpoints = options.breakpoints; //- create a new variable for breakpoints object
//            var defaultBreakpoint = { "default_bp":1000000 }; //- set a "default" breakpoint for anything larger than the largest breakpoint
//            breakpoints = $.extend(breakpoints,defaultBreakpoint);
//
//            resizeImage($this,breakpoints,src,extension);

            // Write picture properties in data-res attribute
            $("<img/>") // Make in memory copy of image to avoid css issues
                .attr("src", src)
                .load(function() {
                    var real_width = this.width;   // Note: $(this).width() will not

//                    console.log('Local Width : ' + $this.width());
//                    console.log('Actual Width : ' + real_width);

                    $this.attr('data-realwidth', real_width);
                });


            $(window).bind("load resize",function() {
                checkImageResolution($this, options.animation);
				console.log('Just launched event to ' + $this.attr('src'));
            });



        });

        // -------------------------------------------------------------------------------------------------------------
        // END OF PROCEDURE
        // -------------------------------------------------------------------------------------------------------------
        return this;
    };
})(jQuery);