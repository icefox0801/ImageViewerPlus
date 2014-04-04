/**
 *
 *
 **/
(function($){

    var isIE = !+[1,],
        dequeue = function ($elem) {

            if($elem.is(':animated')) $elem.dequeue();

        };
    /* ImageViewer类定义，ImageViewer类封装并暴露了ImageSlider和ImageTool类的方法 */
    var ImageViewer = function (elem, album, options) {

        var imageSlider = new ImageSlider(elem, album, options);
            wrapper = imageSlider.$container.get(0);
            img = imageSlider.$img.get(0);
            imageTool = new ImageTool(wrapper, img, options);

        return this;
    };

    /* ImageSlider类定义*/
    var ImageSlider = function (elem, album, options) {

        this.currentIndex = options.currentIndex;
        this.maxIndex = album.length - 1;
        this.thumbNumber = Math.floor(options.width / ( options.thumbWidth + 5)); // 每页的缩略图数 
        this.album = album;
        this.$elem = $(elem);
        this.$wrapper = options.wrapper === false ? $('body') : $(options.wrapper);
        this.$container = null;
        this.$img = null;
        this.$navi = null;
        this.$ul = null;
        this.thumbOffset = 0;
        this.list = [];
        this.transitionSetting = options.transitionSetting;
        this.init(options);

    };
    /* ImageViewer方法定义*/
    ImageSlider.prototype = {

        constructor: ImageSlider,

        init: function (options) {

            var _t = this,
                width = options.width,
                height = options.height;

            _t.$elem.hide();
            _t.$elem.addClass('iv-wrapper');
            _t.$elem.append(_t.createContainer(width, height));
            _t.$elem.append(_t.createNavi(_t.album, width));
            _t.setIndex(_t.currentIndex);
            _t.$elem.show();
        },

        createContainer: function (width, height) {

            var _t = this,
                $container = $('<div/>'),
                $next = $('<div/>').append('<span />'),
                $prev = $('<div/>').append('<span />'),
                $img = $('<img />'),
                $content = $('<div/>').append($img);

            $container.addClass('iv-container');
            $next.addClass('iv-indicator next').attr('title', '下一张');
            $prev.addClass('iv-indicator prev').attr('title', '上一张');
            $container.width(width + 40 * 2); // #FIXME: magic number
            $content.addClass('iv-content');
            $content.css({
                width: width,
                height: height
            });
            $img.css({
                'max-width': width,
                'max-height': height
            });

            $container.append($content).append($prev).append($next);

            // 事件绑定
            $prev.on('click', function (event) {
                _t.switchImage(_t.currentIndex - 1);
            }).on('mouseover', function (event) {
                $(this).addClass('hover');
            }).on('mouseout', function (event) {
                $(this).removeClass('hover');
            });

            $next.on('click', function (event) {
                _t.switchImage(_t.currentIndex + 1);
            }).on('mouseover', function (event) {
                $(this).addClass('hover');
            }).on('mouseout', function (event) {
                $(this).removeClass('hover');
            });

            _t.$img = $img;
            _t.$container = $container;

            return $container;

        },

        createNavi: function (album, width) {

            var _t = this,
                $navi = $('<div/>'),
                $naviWrapper = $('<div/>'),
                $naviPrev = $('<div/>'),
                $naviNext = $('<div/>'),
                $ul = $('<ul/>'),
                list = [],
                thumbImg = [],
                fadeTime = _t.transitionSetting.thumbFadeTime,
                opacity = _t.transitionSetting.thumbOpacity,
                len = album.length,
                ulWidth = ( 100 + 5 ) * len; // #FIXME: magic number

            $navi.addClass('iv-navi');
            $naviWrapper.addClass('iv-navi-wrapper');
            $naviPrev.addClass('iv-thumb-indicator prev');
            $naviNext.addClass('iv-thumb-indicator next');
            $ul.addClass('iv-thumb-list');
            $naviWrapper.width(width);
            $navi.width(width + 40 * 2); // #FIXME: magic number
            // #TODO: 将css中li的宽度和js中li的宽度统一
            $ul.width(ulWidth);

            $.each(album, function (idx, item) {

                thumbImg[idx] = $('<img/>');
                list[idx] = $('<li/>');
                list[idx].addClass('iv-thumb-item');

                thumbImg[idx][0].src = album[idx];
                thumbImg[idx].css({
                    opacity: opacity
                });
                $ul.append(list[idx].append(thumbImg[idx]));

            });

            $navi.append($naviWrapper.append($ul));
            $navi.append($naviPrev.append($('<span/>'))).append($naviNext.append($('<span/>')));

            // 事件绑定
            $ul.find('.iv-thumb-item').on('mouseover', function (event) {

                var $t = $(this),
                    index = $t.index();

                dequeue($t.find('img'));
                dequeue(_t.$img);
                $t.not('.selected').find('img').fadeTo(fadeTime, 1, function () {
                    _t.transformImage(index);
                });
                $t.addClass('hover');

            }).on('mouseout', function (event) {

                var $t = $(this),
                    index = _t.$ul.find('.selected').index();

                event.stopPropagation(); // 阻止事件冒泡到外层ul上
                dequeue(_t.$img);
                $t.not('.selected').find('img').fadeTo(fadeTime, opacity, function () {
                    _t.transformImage(index);
                });
                $t.removeClass('hover');

            }).on('click', function (event) {

                var $t = $(this),
                    idx = $t.index();

                dequeue($t.find('img'));
                _t.setIndex(idx);

            });

            var isHovered = false,
                slideTimer,
                enableHoverSlide = _t.transitionSetting.enableHoverSlide;

            $navi.find('.prev,.next').on('mouseover', function (event) {

                var $t = $(this),
                    isForword;
                
                $t.addClass('hover');

                if (!enableHoverSlide) return false;
                    
                isHovered = true;
                isForword = $t[0].className.match('prev') ? false : true;
                slideTimer = setInterval(function () {

                    var marginLeft = $t.css('margin-left');

                    if(isHovered === false) {
                        clearInterval(slideTimer);
                    } else if (!_t.$ul.is(':animated')){
                        var offset = _t.thumbOffset + (isForword ? 100 : -100);
                        _t.scrollThumb(offset, 'linear');
                    }
                    
                } ,20);

            }).on('mouseout', function (event) {

                var $t = $(this);

                $t.removeClass('hover');

                if (!enableHoverSlide) return false;

                dequeue(_t.$ul);
                isHovered = false;
                clearInterval(slideTimer);

            });

            $navi.find('.prev,.next').on('click', function (event) {

                var $t = $(this),
                    isForword = $t[0].className.match('prev') ? false : true,
                    index = _t.currentIndex + (isForword ? _t.thumbNumber : (-_t.thumbNumber));

                index = index < 0 ? 0 : (index > _t.maxIndex ? _t.maxIndex : index);

                _t.setIndex(index);

            });

            
            _t.$navi = $navi;
            _t.$ul = $ul;
            _t.list = list;

            return $navi;

        },

        setIndex: function (index) {

            var _t = this;

            _t.currentIndex = index;
            _t.transformImage(index);
            _t.highlightThumb(index);
            _t.centerSelectedThumb(index);

        },

        highlightThumb: function (index) {

            var _t = this,
                fadeTime = _t.transitionSetting.thumbFadeTime,
                opacity = _t.transitionSetting.thumbOpacity;

            _t.$navi.find('.selected').removeClass('selected').find('img').fadeTo(fadeTime, opacity);
            _t.list[index].addClass('selected').find('img').fadeTo(fadeTime, 1);
        },

        centerSelectedThumb: function (index) {

            var _t = this,
                $naviWraper = _t.$navi.find('.iv-navi-wrapper'),
                offsetLeft,
                scrollLeft,
                marginLeft;

            offsetLeft = (100 + 5) * index; // #FIXME: magic number
            scrollLeft = ($naviWraper.width() - 100) / 2;
            marginLeft = offsetLeft - scrollLeft;
            _t.scrollThumb(marginLeft);

        },

        scrollThumb: function (offset, easing) {

            var _t = this,
                $naviWraper = _t.$navi.find('.iv-navi-wrapper'),
                slideSpeed = _t.transitionSetting.slideSpeed,
                maxMarginLeft = _t.$ul.width() - $naviWraper.width(),
                slideTime = Math.abs(offset - _t.thumbOffset) / slideSpeed * 1000;

            if(typeof arguments[1] === 'undefined') {
                easing = _t.transitionSetting.thumbEasing;
            }

            offset =  offset < 0 ? 0 : (offset > maxMarginLeft ? maxMarginLeft : offset);

            if(_t.$ul.is(':animated')) _t.$ul.stop();
            _t.thumbOffset = offset;
            _t.$ul.animate({'margin-left': '-' + offset + 'px'}, slideTime, easing);

        },

        transformImage: function (index) {

            var _t = this,
                fadeTime = _t.transitionSetting.fadeTime,
                opacity = _t.transitionSetting.opacity;

            dequeue(_t.$img);
            _t.$img.fadeTo(fadeTime, opacity, function() {
                _t.$img[0].src = _t.album[index];
            }).fadeTo(fadeTime, 1);
        },

        preview: function (index) {

        },

        refactoring: function () {

            var _t = this;

            return _t;

        },

        destroy: function () {

        }

    };

    /* ImageUtil Class Definition*/
    var ImageTool = function(wrapper, img, options) {

        if(!options.enableToolbar) return false;

        this.$wrapper = $(wrapper);
        this.$img = $(img);
        this.$toolbar = null;
        this.rotate = 0;
        this.init(options);

    };

    ImageTool.prototype = {

        constructor: ImageTool,

        init: function (options) {

            var _t = this,
                img = _t.$img.get(0);

            _t.$img.addClass('iv-image-enhanced');
            _t.$wrapper.append(_t.createToolbar());
            _t.bindKeydownEvents();
            _t.imgReady(img);

        },

        createToolbar: function () {

            var _t = this,
                $toolbar = $('<div/>'),
                $toolbarCon = $('<div/>'),
                $rotateLeftBtn = $('<a href="javascript:void(0)"/>'),
                $rotateRightBtn = $('<a href="javascript:void(0)"/>'),
                $zoomInBtn = $('<a href="javascript:void(0)"/>'),
                $zoomOutBtn = $('<a href="javascript:void(0)"/>'),
                $closeBtn = $('<a href="javascript:void(0)"/>');

            $toolbar.addClass('iv-toolbar');
            $toolbarCon.addClass('iv-toolbar-con');
            $rotateLeftBtn.addClass('iv-rotate-left-btn').attr("title","左转");
            $rotateRightBtn.addClass('iv-rotate-right-btn').attr("title","右转");
            $zoomInBtn.addClass('iv-zoom-in-btn').attr("title","原始大小");
            $zoomOutBtn.addClass('iv-zoom-out-btn').attr("title","适应窗口");
            $closeBtn.addClass('iv-close-btn').attr("title","关闭");

            // 按钮事件
            $rotateLeftBtn.on('click', function (event) {
                _t.rotateLeft();
            });

            $rotateRightBtn.on('click', function (event) {
                _t.rotateRight();
            });

            $zoomInBtn.on('click', _t.zoomIn);
            $zoomOutBtn.on('click', _t.zoomOut);
            $closeBtn.on('click', _t.closeDialog);
            
            $toolbarCon.append($rotateLeftBtn).append($rotateRightBtn);
            $toolbarCon.append($zoomInBtn).append($zoomOutBtn);
            $toolbarCon.append($closeBtn);
            $toolbar.append($toolbarCon);

            _t.$toolbar = $toolbar;
            return $toolbar;
        },

        imgReady: function (img) {

            img.onload = function(){

                imgObjWidth = img.width;
                imgObjHeight = img.height;
                dragMaxLeft = imgObjWidth - width;
                dragMaxTop = imgObjHeight - height;
                dragGap = (imgObjWidth-imgObjHeight)/2;
                if(width/height > imgObjWidth/imgObjHeight){
                    imgZoomWidth = parseInt(imgObjWidth/imgObjHeight*height);
                    imgZoomHeight = height;
                }else{
                    imgZoomWidth = width;
                    imgZoomHeight = parseInt(imgObjHeight/imgObjWidth*width);
                }

                imgObj
                    .attr("width",imgZoomWidth).attr("height",imgZoomHeight)
                    .css({
                        left:(width-imgZoomWidth)/2,
                        top:(height-imgZoomHeight)/2,
                        cursor:"move"
                    });
                dragTop = (height-imgZoomHeight)/2;
                dragLeft = (width-imgZoomWidth)/2;  
                if(isIE){
                    imgObj.css("filter","progid:DXImageTransform.Microsoft.BasicImage(rotation=0)");
                }else{
                    imgObj
                        .css("-webkit-transform","rotate(0deg)")
                        .css("-moz-transform","rotate(0deg)")
                        .css("-o-transform","rotate(0deg)")
                        .css("transform","rotate(0deg)");
                }
            }
            img.src=src;

        },

        bindKeydownEvents: function () {

            var _t = this,
                img = _t.$img.get(0);

            $(document).on("keydown",function(event){

                if(!!img){
                    switch(event.keyCode){
                        case 83://s
                            _t.rotateLeft();
                            break;
                        case 70://f
                            _t.rotateRight();
                            break;
                        case 68://d
                            if(zoomIn){
                                _t.zoomOut();
                            }else{
                                _t.zoomIn();
                            }
                            break;
                        case 67://c
                            _t.closeDialog();
                            break;
                    }
                }

            });
        },

        setRotateAnim: function () {

            var _t = this,
                $img = _t.$img;

            if(isIE){
                $img.css('filter','progid:DXImageTransform.Microsoft.BasicImage(rotation='+(rotate<0?4-(-rotate%4):rotate%4)+')');
                
                if(!zoomIn){

                    if(_t.rotate%2 == 1){
                        $img.css({
                            left: (width - imgZoomHeight) / 2,
                            top: (height - imgZoomWidth) / 2
                        });
                    } else {
                        $img.css({
                            left: (width - imgZoomWidth) / 2,
                            top: (height - imgZoomHeight) / 2
                        });
                    }

                }

            } else {
                $img.css('-webkit-transform', 'rotate('+_t.rotate*90+'deg)')
                    .css('-moz-transform', 'rotate('+_t.rotate*90+'deg)')
                    .css('-o-transform', 'rotate('+_t.rotate*90+'deg)')
                    .css('transform', 'rotate('+_t.rotate*90+'deg)');
            }

        },

        rotateLeft: function () {

            var _t = this;

            _t.rotate--;
            _t.setRotateAnim();

            return false;
        },

        rotateRight: function () {

            var _t = this;

            _t.rotate++;
            _t.setRotateAnim();

            return false;
        },

        zoomIn: function () {

        },

        zoomOut: function () {

        },

        closeDialog: function () {

        }

    };

    /* Integration with jQuery*/
    $.fn.imageViewer = function (album, options) {

        var imageViewers = [];

        if($.type(arguments[0]) === 'object') {
            options = album;
            album = [];
        }

        options = $.extend({}, $.fn.imageViewer.defaults, options, true);

        $(this).each(function (idx, elem) {

            var $t = $(elem);

            if(!$t.data('viewer')) {
                $t.data('viewer', imageViewers[idx] = new ImageViewer(elem, album, options));
            } else {
                imageViewers[idx] = $t.data('viewer').refactoring(album);
            }

        });

        return imageViewers;
    };

    $.fn.imageViewer.defaults = {

        enableToolbar: true,
        /* width, height, thumbHeight, thumbWidth变更时需重新编译scss文件，或手动指定样式 */
        width: 600,
        height: 500,
        thumbHeight: 80,
        thumbWidth: 100,
        currentIndex: 0,
        wrapper: false, // 包裹控件的jQuery对象选择器，设置为false时为body
        position: 'fixed', // 'fixed'|'absolute'|'normal'
        mask: true, // true|false
        loop: true, // true|false
        transitionSetting: {

            enableHoverSwicth: true, // true|false 是否在鼠标悬停时切换图片（悬停结束后切换回原图片）
            enableHoverSlide: false, // true|false 是否在“前进”、“后退”按钮悬停时滚动图片
            slideSpeed: 2000, // 滚动速度：pixels/s
            opacity: 0.9,
            fadeTime: 100, // ms
            thumbOpacity: 0.5,
            thumbFadeTime: 200, // ms
            thumbEasing: 'linear'
        }
    };

})(jQuery);