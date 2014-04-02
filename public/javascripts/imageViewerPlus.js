/**
 *
 *
 **/
(function($){
    /* ImageViewer Class Definition*/
    var ImageViewer = function (elem, album, options) {

        this.currentIndex = options.currentIndex;
        this.maxIndex = album.length;
        this.album = album;
        this.$elem = $(elem);
        this.$wrapper = options.wrapper === false ? $('body') : $(options.wrapper);
        this.$img = null;
        this.$navi = null;
        this.$ul = null;
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
            // $img[0].src = _t.album[_t.currentIndex];

            $wrapper.append($prev).append($next).append($content);

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
            $naviPrev[0].className = 'iv-thumb-indicator prev';
            $naviNext[0].className = 'iv-thumb-indicator next';
            $ul[0].className = 'iv-thumb-list';
            $navi.width(width);
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

            // 事件绑定
            $ul.find('.iv-thumb-item').on('mouseover', function (event) {

                var $t = $(this);

                $t.find('img').is(':animated') && $t.find('img').dequeue();
                $t.not('.selected').find('img').fadeTo(fadeTime, 1);
                $t.addClass('hover');

            }).on('mouseout', function (event) {

                var $t = $(this);

                $t.find('img').is(':animated') && $t.find('img').dequeue();
                $t.not('.selected').find('img').fadeTo(fadeTime, opacity);
                $t.removeClass('hover');

            }).on('click', function (event) {

                var $t = $(this),
                    idx = $t.index();

                $t.find('img').is(':animated') && $t.find('img').dequeue();
                _t.setIndex(idx);

            });

            $navi.append($ul);
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
                offsetLeft,
                offsetRight,
                scrollLeft,
                scrollRight,
                marginLeft,
                maxMarginLeft;

            offsetLeft = (100 + 5) * index; // #FIXME: magic number
            scrollLeft = (_t.$navi.width() - 100) / 2;
            maxMarginLeft = _t.$ul.width() - _t.$navi.width();
            marginLeft = offsetLeft - scrollLeft;
            marginLeft =  marginLeft < 0 ? 0 : (marginLeft > maxMarginLeft ? maxMarginLeft : marginLeft);

            _t.$ul.is(':animated') && _t.$ul.stop();
            _t.$ul.animate({'margin-left': '-' + marginLeft + 'px'}, 500);
        },

        scrollThumb: function (offset) {

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

        width: 600,
        height: 500,
        thumbHeight: 80,
        thumbWidth: 100,
        currentIndex: 0,
        wrapper: false, // jQuery object or false, if set to false, the wrapper is body instead
        position: 'fixed', // 'fixed'|'absolute'|'normal'
        mask: true, // true|false
        loop: true, // true|false
        transitionSetting: {
            opacity: 0.8,
            fadeTime: 100, // ms
            thumbOpacity: 0.6,
            thumbFadeTime: 200 // ms
        } 
    };

})(jQuery);