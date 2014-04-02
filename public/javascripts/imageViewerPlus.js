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
        this.$wrapper = options.wrapper === false ? $('body') : $(wrapper);
        this.$img = null;
        this.$navi = null;
        this.list = [];
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
            _t.$elem.append(_t.createNavi(_t.album, width, options.transitionSetting));
            _t.setIndex(_t.currentIndex);
            _t.$elem.show();
        },

        createWrapper: function (width, height, settings) {

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
            })
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

        createNavi: function (album, width, settings) {

            var _t = this,
                $navi = $('<div/>'),
                $naviPrev = $('<div/>'),
                $naviNext = $('<div/>'),
                $ul = $('<ul/>'),
                list = [],
                thumbImg = [],
                fadeTime = settings.thumbFadeTime,
                opacity = settings.thumbOpacity,
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
                _t.$navi.find('.selected').removeClass('selected').find('img').fadeTo(fadeTime, opacity);
                $t.addClass('selected').find('img').fadeTo(fadeTime, 1);
                _t.setIndex(idx);

            });

            $navi.append($ul);
            _t.$navi = $navi;
            _t.list = list;

            return $navi;

        },

        setIndex: function (index) {

            var _t = this;

            _t.currentIndex = index;
            _t.$img[0].src = _t.album[index];


        },

        preview: function (index) {

        },

        refactoring: function () {

        },

        destroy: function () {

        },

        switchImage: function (index) {

        },

        scrollThumb: function (offset) {

        },

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
        thumbHeight: 60,
        currentIndex: 0,
        wrapper: false, // jQuery object or false, if set to false, the wrapper is body instead
        position: 'fixed', // 'fixed'|'absolute'|'normal'
        mask: true, // true|false
        loop: true, // true|false
        transitionSetting: {
            thumbOpacity: 0.6,
            thumbFadeTime: 200 // ms
        } 
    };

})(jQuery);