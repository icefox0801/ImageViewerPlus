/**
 *
 *
 **/
(function($){

    /* ImageViewer Class Definition*/
    var ImageViewer = function (elem, album, options) {

        this.currentIndex = options.currentIndex;
        this.maxIndex = album.length - 1;
        this.thumbNumber = Math.floor(options.width / ( options.thumbWidth + 5)); // 每页的缩略图数 
        this.album = album;
        this.$elem = $(elem);
        this.$wrapper = options.wrapper === false ? $('body') : $(options.wrapper);
        this.$img = null;
        this.$navi = null;
        this.$ul = null;
        this.thumbOffset = 0;
        this.list = [];
        this.transitionSetting = options.transitionSetting;
        this.init(options);

    };

    ImageViewer.prototype = {

        constructor: ImageViewer,

        init: function (options) {

            var _t = this,
                width = options.width,
                height = options.height;

            _t.$elem.hide();
            _t.$elem.addClass('iv-container');
            _t.$elem.append(_t.createWrapper(width, height));
            _t.$elem.append(_t.createNavi(_t.album, width));
            _t.setIndex(_t.currentIndex);
            _t.$elem.show();
        },

        createWrapper: function (width, height) {

            var _t = this,
                $wrapper = $('<div/>'),
                $next = $('<div/>').append('<span />'),
                $prev = $('<div/>').append('<span />'),
                $img = $('<img />'),
                $content = $('<div/>').append($img);

            $wrapper[0].className = 'iv-wrapper';
            $next[0].className = 'iv-indicator next';
            $prev[0].className = 'iv-indicator prev';
            $content[0].className = 'iv-content';
            $content.css({
                width: width,
                height: height
            });
            $img.css({
                'max-width': width,
                'max-height': height
            });

            $wrapper.append($content).append($prev).append($next);

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
            _t.$wrapper = $wrapper;

            return $wrapper;

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

            $navi[0].className = 'iv-navi';
            $naviWrapper[0].className = 'iv-navi-wrapper';
            $naviPrev[0].className = 'iv-thumb-indicator prev';
            $naviNext[0].className = 'iv-thumb-indicator next';
            $ul[0].className = 'iv-thumb-list';
            $naviWrapper.width(width);
            $navi.width(width + 2 * 40); // #FIXME: magic number
            // #TODO: 将css中li的宽度和js中li的宽度统一
            $ul.width(ulWidth);

            $.each(album, function (idx, item) {

                thumbImg[idx] = $('<img/>');
                list[idx] = $('<li/>');
                list[idx][0].className = 'iv-thumb-item';

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

                $t.find('img').is(':animated') && $t.find('img').dequeue();
                $t.not('.selected').find('img').fadeTo(fadeTime, 1);
                $t.addClass('hover');

            }).on('mouseout', function (event) {

                var $t = $(this);

                event.stopPropagation(); // 阻止事件冒泡到外层ul上
                $t.find('img').is(':animated') && $t.find('img').dequeue();
                $t.not('.selected').find('img').fadeTo(fadeTime, opacity);
                $t.removeClass('hover');

            }).on('click', function (event) {

                var $t = $(this),
                    idx = $t.index();

                $t.find('img').is(':animated') && $t.find('img').dequeue();
                _t.setIndex(idx);

            });

            $ul.on('mouseout', function (event) {

                var $t = $(this),
                    index = _t.$ul.find('.selected').index();

                _t.transformImage(index);

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

                if(_t.$ul.is(':animated') && enableHoverSlide) {
                    _t.$ul.dequeue();
                }

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

            _t.$ul.is(':animated') && _t.$ul.stop();
            _t.thumbOffset = offset;
            _t.$ul.animate({'margin-left': '-' + offset + 'px'}, slideTime, easing);

        },

        transformImage: function (index) {

            var _t = this,
                fadeTime = _t.transitionSetting.fadeTime,
                opacity = _t.transitionSetting.opacity;

            _t.$img.is(':animated') && _t.$img.dequeue();
            _t.$img.fadeTo(fadeTime, opacity, function() {
                _t.$img[0].src = _t.album[index];
            }).fadeTo(fadeTime, 1);
        },

        preview: function (index) {

        },

        refactoring: function () {

        },

        destroy: function () {

        },

        switchImage: function (index) {

        }

    };

    /* ImageUtil Class Definition*/
    var ImageTool = function(img) {

    };

    ImageTool.prototype = {

        constructor: ImageTool,

        getToolbar: function () {
            return;
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
            opacity: 0.8,
            fadeTime: 100, // ms
            thumbOpacity: 0.5,
            thumbFadeTime: 200, // ms
            thumbEasing: 'linear'
        }
    };

})(jQuery);