/**
 *
 *
 **/
(function($){

    var isIE = !+[1,],
        thumbMargin = 5, // 图片缩略图的间隔
        sideMargin = 40, // 图片显示区两侧的留白
        dequeue = function ($elem) { // 立即执行当前触发的动画，以避免动画队列延迟

            if($elem.is(':animated')) $elem.dequeue();

        },
        imageViewers = [],
        optionsCache; // 全局缓存options
    /**
     * ImageViewer类定义，ImageViewer类封装并暴露了ImageSlider和ImageTool类的方法
     * @param {[type]} elem    imageViewer元素
     * @param {[type]} album   图片数组
     * @param {[type]} options 控件选项
     */
    var ImageViewer = function (elem, album, options) {

        var imageSlider = new ImageSlider(elem, album, options);
            wrapper = imageSlider.$container.get(0); // 外层包裹元素
            img = imageSlider.$img.get(0); // 图片
            imageTool = new ImageTool(wrapper, img, options);

        optionsCache = options;
        if(arguments.length === 0) return undefined;
        
        this.refactor = function () {
            imageSlider.refactor.apply(imageSlider, arguments); // 重构方法
            return this;
        };
        this.destroy = function () {
            var spliceIndex = imageViewers.length;

            imageSlider.destroy.call(imageSlider);
            $(elem).removeData('viewer');
            for(var idx = 0, len = imageViewers.length; idx < len; idx++) {
                if(this === imageViewers[idx]) spliceIndex = idx;
            }

            imageViewers[spliceIndex] = undefined;
            return imageViewers.splice(spliceIndex, 1);;
        };
        this.addImg = function () {
            imageSlider.addImg.apply(imageSlider, arguments);
        };
    };
    /**
     * ImageSlider类定义
     * @param {[type]} elem    imageSlider元素
     * @param {[type]} album   图片数组
     * @param {[type]} options 图片控件选项
     */
    var ImageSlider = function (elem, album, options) {
        this.album = album; // 图片数组
        this.currentIndex = options.currentIndex; // 当前显示图片的索引
        this.maxIndex = album.length - 1; // 显示图片的最大索引
        this.thumbNumber = Math.floor(options.width / ( options.thumbWidth + thumbMargin)); // 每页的缩略图数，翻页的图片数 
        this.thumbWidth = options.thumbWidth;
        this.$elem = $(elem);
        this.$wrapper = options.wrapper === false ? $('body') : $(options.wrapper); // 图片控件包裹元素
        this.$container = null;
        this.$img = null;
        this.$navi = null; // 图片控件导航元素
        this.$ul = null;
        this.thumbOffset = 0;
        this.list = [];
        this.transitionSetting = options.transitionSetting; // 动画设置参数
        this.init(options);
    };
    /* ImageSlider方法定义*/
    ImageSlider.prototype = {
        /**
         * ImageSlider构造方法
         * @type {[type]}
         */
        constructor: ImageSlider,
        /**
         * ImageSlider初始化方法
         * @param  {[type]} options 图片控件选项
         */
        init: function (options) {
            var _t = this,
                width = options.width,
                height = options.height,
                thumbWidth = options.thumbWidth;

            _t.$elem.hide();
            _t.$elem.addClass('iv-wrapper');
            _t.$elem.append(_t.createContainer(width, height));
            _t.$elem.append(_t.createNavi(_t.album, width, thumbWidth));
            _t.setIndex(_t.currentIndex);
            _t.$elem.show();
        },
        /**
         * 初始化对象参数
         * @param  {[type]} options 图片控件选项
         */
        initParam: function (options) {
            var _t = this;

            _t.currentIndex = options.currentIndex; // 当前显示图片的索引
            _t.maxIndex = _t.album.length - 1; // 显示图片的最大索引
            _t.thumbNumber = Math.floor(options.width / ( options.thumbWidth + thumbMargin)); // 每页的缩略图数，翻页的图片数 
            _t.thumbWidth = options.thumbWidth;
            _t.$wrapper = options.wrapper === false ? $('body') : $(options.wrapper); // 图片控件包裹元素
            _t.thumbOffset = 0;
            _t.transitionSetting = options.transitionSetting; // 动画设置参数
        },
        /**
         * 重构图片控件对象
         * @param  {[type]} album   图片数组
         * @param  {[type]} options 图片控件选项
         * @return {[type]}         imageSlider对象
         */
        refactor: function (album, options) {
            var _t = this,
                options = arguments[1] || optionsCache,
                width = options.width,
                height = options.height,
                thumbWidth = options.thumbWidth;
            // imageSlider对象属性设置
            _t.album = album;
            _t.initParam(options);

            _t.$elem.hide();
            _t.$ul.empty().append(_t.createThumbList(album, options));
            _t.bindThumbEvents(_t.$ul);
            _t.setIndex(options.currentIndex);
            _t.$elem.show();
            return _t;
        },

        addImg: function (src) {
            var _t = this;

            if(typeof src === 'string') _t.thumb.push(src);
        },
        /**
         * 销毁imageSlider对象
         * @return {[type]} 销毁后imageSlider对象--undefined
         */
        destroy: function () {
            this.$elem.empty();
            this.$elem.removeClass('iv-wrapper');
            this.$elem.data('viewer', undefined);
            return this;
        },
        /**
         * 创建图片预览区
         * @param  {[type]} width  图片外层DIV宽度（图片最大宽度）
         * @param  {[type]} height 图片外层DIV高度（图片最大高度）
         * @return {[type]}        图片预览区jQuery元素
         */
        createContainer: function (width, height) {
            var _t = this,
                $container = $('<div/>'),
                $next = $('<div/>').append('<span />'), // 下一张
                $prev = $('<div/>').append('<span />'), // 上一张
                $img = $('<img />'), 
                $content = $('<div/>').append($img);
            // 添加class和默认样式
            $container.addClass('iv-container');
            $next.addClass('iv-indicator next').attr('title', '下一张');
            $prev.addClass('iv-indicator prev').attr('title', '上一张');
            $container.width(width + sideMargin * 2);
            $content.addClass('iv-content');
            $content.css({
                width: width,
                height: height
            });
            $img.css({
                'max-width': width,
                'max-height': height
            });
            // DOM操作
            $container.append($content);
            $container.append($prev).append($next);
            // 事件绑定
            _t.bindPagingEvents($prev, $next);
            // imageSlider实例属性赋值
            _t.$img = $img;
            _t.$container = $container;

            return $container;
        },
        /**
         * 翻页事件绑定
         * @param  {[type]} $prev 上一张按钮
         * @param  {[type]} $next 下一张按钮
         */
        bindPagingEvents: function ($prev, $next) {
            var _t = this;
            // 上一张
            $prev.on('click', function (event) {
                _t.switchImage(_t.currentIndex - 1);
            }).on('mouseover', function (event) {
                $(this).addClass('hover');
            }).on('mouseout', function (event) {
                $(this).removeClass('hover');
            });
            // 下一张
            $next.on('click', function (event) {
                _t.switchImage(_t.currentIndex + 1);
            }).on('mouseover', function (event) {
                $(this).addClass('hover');
            }).on('mouseout', function (event) {
                $(this).removeClass('hover');
            });
        },
        /**
         * 创建图片导航区
         * @param  {[type]} album 图片导航
         * @param  {[type]} width 图片外层DIV宽度
         * @return {[type]}       图片导航区jQuery元素
         */
        createNavi: function (album, width, thumbWidth) {
            var _t = this,
                $navi = $('<div/>'),
                $naviWrapper = $('<div/>'),
                $naviPrev = $('<div/>').append('<span/>'), // 上一页
                $naviNext = $('<div/>').append('<span/>'), // 下一页
                $ul = $('<ul/>'),
                ulWidth = ( thumbWidth + thumbMargin ) * album.length;
            // 添加class和默认样式
            $navi.addClass('iv-navi');
            $naviWrapper.addClass('iv-navi-wrapper');
            $naviPrev.addClass('iv-thumb-indicator prev');
            $naviNext.addClass('iv-thumb-indicator next');
            $ul.addClass('iv-thumb-list');
            $naviWrapper.width(width);
            $navi.width(width + sideMargin * 2);
            $ul.width(ulWidth);
            // DOM操作
            $ul.append(_t.createThumbList(album));
            $navi.append($naviWrapper.append($ul));
            $navi.append($naviPrev).append($naviNext);
            // 事件绑定
            _t.bindThumbEvents($ul);
            _t.bindThumbPagingEvents($navi, thumbWidth);
            // imageSlider对象属性赋值
            _t.$navi = $navi;
            _t.$ul = $ul;

            return $navi;

        },
        /**
         * 创建缩略图列表
         * @param  {[type]} album 图片数组
         * @return {[type]}       缩略图列表jQuery元素
         */
        createThumbList: function (album) {

            var _t = this,
                list = [],
                thumbImg = [],
                frag = document.createDocumentFragment(),
                opacity = _t.transitionSetting.thumbOpacity;

            $.each(album, function (idx, item) {
                thumbImg[idx] = document.createElement('img');
                list[idx] = document.createElement('li');

                list[idx].className = 'iv-thumb-item';
                thumbImg[idx].src = album[idx];
                thumbImg[idx].style.opacity = opacity;

                list[idx].appendChild(thumbImg[idx]);
                frag.appendChild(list[idx]);
            });

            _t.list = list;

            return $(frag.children);
        },
        /**
         * 缩略图事件绑定
         * @param  {[type]} $ul 缩略图列表jQuery元素
         */
        bindThumbEvents: function ($ul) {
            var _t = this,
                thumbWidth = _t.thumbWidth,
                fadeTime = _t.transitionSetting.thumbFadeTime,
                opacity = _t.transitionSetting.thumbOpacity;
            // 缩略图鼠标悬停、鼠标移开、鼠标点击事件
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
                    index = $t.index();

                dequeue($t.find('img'));
                _t.setIndex(index);
            });
        },
        /**
         * 图片导航区翻页事件绑定
         * @param  {[type]} $navi 图片导航jQuery元素
         */
        bindThumbPagingEvents: function ($navi) {
            var _t = this,
                isHovered = false, // 鼠标是否悬停在翻页按钮上
                slideTimer, // 滑动动画计时器
                enableHoverSlide = _t.transitionSetting.enableHoverSlide;
            // 翻页按钮鼠标悬停、鼠标移开、点击事件
            $navi.find('.prev,.next').on('mouseover', function (event) {
                var $t = $(this),
                    thumbWidth = _t.thumbWidth,
                    isForword; // 是否向前滑动
                
                $t.addClass('hover');

                if (!enableHoverSlide) return false;
                    
                isHovered = true;
                /* 如果鼠标悬停在CLASS为prev的元素，说明是向前滑动 */
                isForword = $t[0].className.match('prev') ? false : true;
                /* 开始计时以持续滑动，每20ms检测鼠标是否移开，若移开，则停止滑动 */
                slideTimer = setInterval(function () {
                    var marginLeft = $t.css('margin-left');

                    if(isHovered === false) {
                        clearInterval(slideTimer);
                    } else if (!_t.$ul.is(':animated')){
                        var offset = _t.thumbOffset + (isForword ? thumbWidth : -thumbWidth);
                        _t.scrollThumb(offset, 'linear'); // 线性速度滑动
                    }
                    
                } ,20);
            }).on('mouseout', function (event) {
                var $t = $(this);

                $t.removeClass('hover');

                if (!enableHoverSlide) return false;

                dequeue(_t.$ul);
                isHovered = false; // 鼠标移开时，将isHovered置为false
                clearInterval(slideTimer);
            }).on('click', function (event) {
                var $t = $(this),
                    isForword = $t[0].className.match('prev') ? false : true,
                    index = _t.currentIndex + (isForword ? _t.thumbNumber : (-_t.thumbNumber));
                // 向前或向后翻过thumbNumber张图片
                index = index < 0 ? 0 : (index > _t.maxIndex ? _t.maxIndex : index);

                _t.setIndex(index);
            });
        },
        /**
         * 设置图片索引
         * @param {[type]} index 图片的索引
         */
        setIndex: function (index) {
            var _t = this;

            _t.currentIndex = index; // 设置当前索引
            _t.transformImage(index); // 切换预览图
            _t.highlightThumb(index); // 高亮当前选中缩略图
            _t.centerSelectedThumb(index); // 居中当前选中缩略图
        },
        /**
         * 高亮当前选中的缩略图
         * @param  {[type]} index 当前图片的索引
         */
        highlightThumb: function (index) {

            var _t = this,
                $prevSelected = null,
                $currSelected = null,
                fadeTime = _t.transitionSetting.thumbFadeTime,
                opacity = _t.transitionSetting.thumbOpacity;

            $prevSelected = _t.$navi.find('.selected').removeClass('selected'); // 去掉之前选中缩略图LI的selected CLASS
            $prevSelected.find('img').fadeTo(fadeTime, opacity); // 缩略图褪色
            $currSelected = $(_t.list[index]).addClass('selected'); // 当前选中缩略图添加selected CLASS
            $currSelected.find('img').fadeTo(fadeTime, 1); // 高亮当前选中图片
        },
        /**
         * 将当前选中的缩略图居中
         * @param  {[type]} index 当前图片的索引
         */
        centerSelectedThumb: function (index) {

            var _t = this,
                thumbWidth = _t.thumbWidth,
                $naviWraper = _t.$navi.find('.iv-navi-wrapper'),
                offsetLeft,
                visibleLeft,
                marginLeft;

            offsetLeft = (thumbWidth + thumbMargin) * index; // 当前缩略图距离UL左端的距离
            visibleLeft = ($naviWraper.width() - thumbWidth) / 2; // 当前缩略图居中时距离导航条（可视区域）左端的距离
            marginLeft = offsetLeft - visibleLeft;
            _t.scrollThumb(marginLeft);
        },
        /**
         * 滚动缩略图导航条
         * @param  {[type]} offset 滚动到的位移（缩略图列表的margin-left）
         * @param  {[type]} easing 动画类型
         */
        scrollThumb: function (offset, easing) {
            var _t = this,
                $naviWraper = _t.$navi.find('.iv-navi-wrapper'),
                slideSpeed = _t.transitionSetting.slideSpeed,
                maxMarginLeft = _t.$ul.width() - $naviWraper.width(), // 滚动距离不能超出缩略图列表长与可视区域之差
                slideTime = Math.abs(offset - _t.thumbOffset) / slideSpeed * 1000; // 滚动时间与距离成正比

            if(typeof arguments[1] === 'undefined') {
                easing = _t.transitionSetting.thumbEasing;
            }

            offset =  offset < 0 ? 0 : (offset > maxMarginLeft ? maxMarginLeft : offset); // offset不能小于0或超过最大位移
            _t.thumbOffset = offset;
            dequeue(_t.$ul);
            _t.$ul.animate({'margin-left': '-' + offset + 'px'}, slideTime, easing);
        },
        /**
         * 切换图片
         * @param  {[type]} index 图片的索引
         */
        transformImage: function (index) {
            var _t = this,
                fadeTime = _t.transitionSetting.fadeTime,
                opacity = _t.transitionSetting.opacity;

            dequeue(_t.$img);
            _t.$img.fadeTo(fadeTime, opacity, function() {
                _t.$img[0].src = _t.album[index];
            }).fadeTo(fadeTime, 1);
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

        var newImageViewers = [],
            refactorIndex; // 重构的索引

        if($.type(arguments[0]) === 'object') {
            options = album;
            album = [];
        }

        options = $.extend({}, $.fn.imageViewer.defaults, options, true);

        $(this).each(function (index, elem) {

            var $t = $(elem),
                refactorImageViewer,
                len = imageViewers.length;

            if(!$t.data('viewer')) {
                $t.data('viewer', imageViewers[len] = new ImageViewer(elem, album, options));
                newImageViewers[index] = imageViewers[len];
            } else {
                if(!$t.data('viewer') instanceof ImageViewer) throw new Error('重构错误!');
                /* 如果某个控件被重构，重新建立它的索引 */
                refactorImageViewer = $t.data('viewer').refactor(album, options);
                for(var idx = 0, len = imageViewers.length; idx < len; idx++) {
                    if(refactorImageViewer === imageViewers[idx]) refactorIndex = idx;
                }
                newImageViewers[index] = imageViewers[refactorIndex];
            }

        });

        return newImageViewers;
    };

    $.fn.imageViewer.defaults = {

        enableToolbar: false,
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