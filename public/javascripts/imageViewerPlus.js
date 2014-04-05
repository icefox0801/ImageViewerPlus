/**
 *
 *
 **/
(function($){

    var isIE = !+[1,],
        isIELt9 = navigator.userAgent.match(/(MSIE 7\.0)|(MSIE 8\.0)/i),
        thumbMargin = 5, // 图片缩略图的间隔
        thumbBorder = 3, // 图片缩略图边框厚度
        sideMargin = 40, // 图片显示区两侧的留白
        imageViewers = [], // imageViewer对象实例数组
        optionsCache, // 全局缓存options
        bodyMarginLeft = 0, // body的margin-left
        slideTimer, // 全局计时器
        isBtnHovered = false, // 上一页、下一页按钮是否处于鼠标悬停状态
        dequeue = function ($elem) { // 立即执行当前触发的动画，以避免动画队列延迟

            if($elem.is(':animated')) $elem.dequeue();

        };
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
        // 重构方法
        this.refactor = function () {
            imageSlider.refactor.apply(imageSlider, arguments); // 重构方法
            return this;
        };
        // 销毁方法
        this.destroy = function () {
            var spliceIndex = imageViewers.length;
            
            imageSlider.destroy.call(imageSlider);
            $(elem).removeData('viewer');
            for(var idx = 0, len = imageViewers.length; idx < len; idx++) {
                if(this === imageViewers[idx]) spliceIndex = idx;
            }

            return imageViewers.splice(spliceIndex, 1);
        };
        // 添加图片
        this.addImg = function () {
            imageSlider.addImg.apply(imageSlider, arguments);
        };
        // 跳转到索引为index的图片
        this.setIndex = function (index) {
            imageSlider.setIndex.call(imageSlider, index);
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
        this.thumbItemWidth = this.thumbWidth + thumbMargin + thumbBorder * 2;
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
            _t.$elem.append(_t.createMask());
            _t.bindKeydownEvents();
            _t.$elem.show();
            _t.$wrapper.show();
            _t.setIndex(_t.currentIndex);
        },
        /**
         * 初始化对象参数
         * @param  {[type]} options 图片控件选项
         */
        initParam: function (options) {
            var _t = this;

            _t.currentIndex = options.currentIndex; // 当前显示图片的索引
            _t.maxIndex = _t.album.length - 1; // 显示图片的最大索引
            _t.thumbNumber = Math.floor(options.width / ( _t.thumbItemWidth)); // 每页的缩略图数，翻页的图片数 
            _t.thumbWidth = options.thumbWidth;
            _t.thumbItemWidth = options.thumbWidth + thumbMargin + thumbBorder * 2;
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
            var _t = this,
                options = optionsCache,
                newThumbItem;

            if(typeof src === 'string') _t.album.push(src);

            newThumbItem = _t.createThumbItem(src);
            _t.maxIndex++;
            _t.list.push(newThumbItem);
            _t.$ul.append($(newThumbItem));
            _t.$ul.width(_t.$ul.width() + _t.thumbItemWidth);
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
                $next = $('<a href="javascript:void(0);"/>'), // 下一张
                $prev = $('<a href="javascript:void(0);"/>'), // 上一张
                $img = $('<img />'),
                $content = $('<div/>').append($img);
            // 添加class和默认样式
            $container.addClass('iv-container');
            $img.addClass('iv-image');
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
         * 创建遮罩
         * @return {[type]} 遮罩层jQuery元素
         */
        createMask: function () {
            var _t = this,
                $mask = $('<div/>'); // 遮罩

            $mask.addClass('iv-mask');

            return $mask;
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
                _t.setIndex(_t.currentIndex - 1);
            }).on('mouseover', function (event) {
                $(this).addClass('hover');
            }).on('mouseout', function (event) {
                $(this).removeClass('hover');
            });
            // 下一张
            $next.on('click', function (event) {
                _t.setIndex(_t.currentIndex + 1);
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
                $naviPrev = $('<a href="javascript:void(0);"/>'), // 上一页
                $naviNext = $('<a href="javascript:void(0);"/>'), // 下一页
                $ul = $('<ul/>'),
                ulWidth = ( _t.thumbItemWidth) * album.length;
            // 添加class和默认样式
            $navi.addClass('iv-navi');
            $naviWrapper.addClass('iv-navi-wrapper');
            $naviPrev.addClass('iv-thumb-indicator prev').attr('title', '上一页');
            $naviNext.addClass('iv-thumb-indicator next').attr('title', '下一页');;
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
                list[idx] = _t.createThumbItem(album[idx]);
                frag.appendChild(list[idx]);
            });

            _t.list = list;

            return $(frag.childNodes);
        },
        /**
         * 创建单个缩略图及外层LI
         * @param  {[type]} src 图片src地址
         * @return {[type]}     HTMLLIElement
         */
        createThumbItem: function (src) {
            var _t = this,
                opacity = _t.transitionSetting.thumbOpacity,
                thumbImg = document.createElement('img'),
                thumbItem = document.createElement('li');

            thumbItem.className = 'iv-thumb-item';
            thumbImg.src = src;
            thumbImg.style.opacity = opacity;
            thumbImg.style.filter = 'alpha(opacity=' + opacity * 100 + ')'; 

            thumbItem.appendChild(thumbImg);

            return thumbItem;
        },
        /**
         * 缩略图事件绑定
         * @param  {[type]} $ul 缩略图列表jQuery元素
         */
        bindThumbEvents: function ($ul) {
            var _t = this,
                thumbWidth = _t.thumbWidth,
                fadeTime = _t.transitionSetting.thumbFadeTime,
                opacity = _t.transitionSetting.thumbOpacity,
                slideSpeed = _t.transitionSetting.slideSpeed,
                slideTime = _t.thumbWidth / slideSpeed * 1000,
                canSlide = true,
                enableInterval = true,
                slideTimer;
            // 缩略图鼠标悬停、鼠标移开事件
            // #TODO: delegate性能指标
            $ul.on('mousemove', function (event) {

                var ulElem = $ul.get(0),
                    thumbSlide = _t.transitionSetting.thumbSilde,
                    $naviWrapper = $ul.closest('.iv-navi-wrapper'),
                    offsetParent = $naviWrapper.get(0).offsetParent,
                    offsetLeft = $naviWrapper.offset().left,
                    index = _t.currentIndex,
                    XToNavi, // 鼠标相对的导航区（可视区域）的X坐标
                    XToUl, // 鼠标相对于缩略图列表UL的X坐标
                    tick = 0;

                XToNavi = event.pageX - offsetLeft - bodyMarginLeft;
                XToUl = XToNavi + _t.thumbOffset;
                index = Math.floor(XToUl / _t.thumbItemWidth);

                if(thumbSlide === 'mousemove') {

                    if(index === _t.currentIndex) return false;

                    if(enableInterval) {
                        slideTimer = setInterval(function () {

                            if(tick >= 5) {
                                clearInterval(slideTimer);
                                enableInterval = true;
                            } else {
                                tick++;
                            }
                            
                            if(canSlide === false) canSlide = true;

                        }, slideTime * 2);
                        enableInterval = false;
                    }

                    _t.setIndex(canSlide ? index : -1);
                    canSlide = canSlide && false;
                } else if (thumbSlide === 'mouseover') {

                    if(index === $ul.find('.hover').index()) return false;
                    _t.transformImage(index); // 切换预览图
                    _t.highlightThumb(index, 'hover'); // 高亮当前选中缩略图
                }

            });
            // 缩略图鼠标点击事件
            $ul.delegate('.iv-thumb-item', 'click', function (event) {
                var $t = $(this),
                    index = $t.index();

                dequeue($t.find('img'));
                dequeue(_t.$ul);
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
                enableBtnHoverSlide = _t.transitionSetting.enableBtnHoverSlide,
                enableBtnHoverSwitch = _t.transitionSetting.enableBtnHoverSwitch;
            // 翻页按钮鼠标悬停、鼠标移开、点击事件
            $navi.find('.prev,.next').on('mouseover', function (event) {
                var $t = $(this),
                    thumbWidth = _t.thumbWidth,
                    slideSpeed = _t.transitionSetting.slideSpeed,
                    slideTime = _t.thumbWidth / slideSpeed * 1000,
                    currentIndex = _t.currentIndex,
                    isForword; // 是否向前滑动
                
                $t.addClass('hover');

                if (!enableBtnHoverSlide) return false;
                
                isBtnHovered = true;
                /* 如果鼠标悬停在CLASS为prev的元素，说明是向前滑动 */
                isForword = $t[0].className.match('prev') ? false : true;
                /* 开始计时以持续滑动，每slideTime时间检测鼠标是否移开，若移开，则停止滑动 */
                slideTimer = _t.slideThumb(isForword);
            }).on('mouseout', function (event) {
                var $t = $(this);

                $t.removeClass('hover');

                if (!enableBtnHoverSlide) return false;

                dequeue(_t.$ul);
                isBtnHovered = false; // 鼠标移开时，将isHovered置为false
                clearInterval(slideTimer);
                _t.setIndex(_t.currentIndex); // 鼠标移开时，回到当前currentIndex
                _t.previewIndex(_t.currentIndex);
            }).on('click', function (event) {
                var $t = $(this),
                    isForword = $t[0].className.match('prev') ? false : true,
                    index = _t.currentIndex + (isForword ? _t.thumbNumber : (-_t.thumbNumber));

                if(enableBtnHoverSwitch) return false;
                // 向前或向后翻过thumbNumber张图片
                index = index < 0 ? 0 : (index > _t.maxIndex ? _t.maxIndex : index);
                _t.setIndex(index);
            });
        },
        /**
         * 滑动缩略图列表
         * @param  {Boolean} isForword 是否为前进方向:true为向前
         * @return {[type]}            setInterval计时器
         */
        slideThumb: function (isForword) {
            var _t = this,
                index = _t.currentIndex,
                thumbItemWidth = _t.thumbItemWidth,
                slideSpeed = _t.transitionSetting.slideSpeed,
                slideTime = _t.thumbWidth / slideSpeed * 1000,
                enableBtnHoverSlide = _t.transitionSetting.enableBtnHoverSlide,
                enableBtnHoverSwitch = _t.transitionSetting.enableBtnHoverSwitch;
            /* 开始计时以持续滑动，每slideTime时间检测鼠标是否移开，若移开，则停止滑动 */
            return setInterval(function () {
                var marginLeft = _t.thumbOffset;

                if(isBtnHovered === false) {
                    clearInterval(slideTimer);
                } else if (!_t.$ul.is(':animated')){
                    var offset = _t.thumbOffset + (isForword ? thumbItemWidth : -thumbItemWidth);

                    if(enableBtnHoverSwitch) {
                        /* 鼠标悬停时切换图片 */
                        _t.setIndex(_t.currentIndex + (isForword ? 1 : -1));
                    } else {
                        /* 鼠标悬停时预览图片，鼠标移开时回到当前选中图片 */
                        _t.previewIndex( index += (isForword ? 1 : -1));
                    }
                }

            } ,slideTime);
        },
        /**
         * 设置图片
         * @param {[type]} index 图片的索引
         */
        setIndex: function (index) {
            var _t = this;

            if(index < 0 || index > _t.maxIndex) return false;

            _t.currentIndex = index; // 设置当前索引
            _t.transformImage(index); // 切换预览图
            _t.highlightThumb(index, 'selected'); // 高亮当前选中缩略图
            _t.centerThumb(index); // 居中当前选中缩略图
        },
        /**
         * 预览图片
         * @param  {[type]} index 图片的索引
         */
        previewIndex: function (index) {
            var _t = this;

            if(index < 0 || index > _t.maxIndex) return false;

            _t.transformImage(index); // 切换预览图
            _t.highlightThumb(index, 'hover'); // 高亮当前选中缩略图
            // _t.scrollThumb(_t.thumbItemWidth, 'linear');
            _t.centerThumb(index);
        },
        /**
         * 高亮缩略图并添加相应CLASS NAME
         * @param  {[type]} index 图片的索引
         */
        highlightThumb: function (index, className) {
            var _t = this,
                $prevImg = null,
                $currImg = null,
                fadeTime = _t.transitionSetting.thumbFadeTime,
                opacity = _t.transitionSetting.thumbOpacity;

            dequeue(_t.$ul.find('img'));
            $prevImg = _t.$ul.find('.' + className).removeClass(className); // 去掉之前选中缩略图LI的selected CLASS
            $prevImg.find('img').fadeTo(fadeTime, opacity); // 缩略图褪色
            $currImg = $(_t.list[index]).addClass(className); // 当前选中缩略图添加selected CLASS
            $currImg.find('img').fadeTo(fadeTime, 1); // 高亮当前选中图片
        },
        /**
         * 将当前的缩略图居中
         * @param  {[type]} index 当前图片的索引
         */
        centerThumb: function (index) {
            var _t = this,
                thumbWidth = _t.thumbWidth,
                $naviWraper = _t.$navi.find('.iv-navi-wrapper'),
                offsetLeft,
                visibleLeft,
                marginLeft;

            offsetLeft = (_t.thumbItemWidth) * index; // 当前缩略图距离UL左端的距离
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
                opacity = _t.transitionSetting.opacity,
                width = _t.$img.closest('.iv-content').width(),
                height = _t.$img.closest('.iv-content').height(),
                imgWidth,
                imgHeight;

            dequeue(_t.$img);

            _t.$img.fadeTo(fadeTime, opacity, function() {
                _t.$img[0].src = _t.album[index];
                
                
            }).fadeTo(fadeTime, 1);

            _t.$img.on('load', function () {

                imgWidth = _t.$img.width();
                imgHeight = _t.$img.height();
                _t.$img.css({
                    left: (width - imgWidth) / 2,
                    top: (height - imgHeight) / 2
                });
            });
        },
        /**
         * 绑定按键事件
         * @return {[type]} [description]
         */
        bindKeydownEvents: function () {
            var _t = this;

            $(document).on("keydown", function (event) {

                switch(event.keyCode){
                    case 87://W
                        _t.setIndex(_t.currentIndex - 1);
                        break;
                    case 69://E
                        _t.setIndex(_t.currentIndex + 1);
                        break;
                    case 67://C
                        break;
                }

            });
        }
    };
    /* ImageUtil Class Definition*/
    var ImageTool = function(container, img, options) {

        if(!options.enableToolbar) return false;

        this.$container = $(container);
        this.$img = $(img);
        this.$toolbar = null;
        this.$dragMask = null;
        this.imgWidth = this.$img.width();
        this.imgHeight = this.$img.height();
        this.zoomImgWidth = 0;
        this.zoomImgHeight = 0;
        this.rotate = 0;
        this.isDrag = false;
        this.isMoved = false;
        this.isZoom = false;
        this.dragLeft = 0;
        this.dragTop = 0;
        this.init(options);

    };

    ImageTool.prototype = {

        constructor: ImageTool,

        init: function (options) {

            var _t = this,
                img = _t.$img.get(0);

            _t.$img.addClass('iv-image-enhanced');
            _t.$container.append(_t.createToolbar());
            _t.$dragMask = _t.createDragMask();
            _t.$dragMask.insertAfter(_t.$container);

            _t.bindKeydownEvents();
            _t.bindDragEvents();
            _t.imgReady(_t.$img);
            _t.setRotateAnim();

        },

        createDragMask: function () {

            var _t = this,
                $dragMask = $('<div/>');

            $dragMask.addClass('iv-drag-mask');
            $dragMask.hide();

            return $dragMask;
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
            // 逆时针旋转90°
            $rotateLeftBtn.on('click', function (event) {
                _t.rotateLeft();
            });
            // 顺时针旋转90°
            $rotateRightBtn.on('click', function (event) {
                _t.rotateRight();
            });
            // 放大
            $zoomInBtn.on('click', function (event) {
                _t.zoomIn();
            });
            // 缩小
            $zoomOutBtn.on('click', function (event) {
                _t.zoomOut();
            });
            // 关闭窗口
            $closeBtn.on('click', function (event) {
                _t.closeDialog();
            });
            
            $toolbarCon.append($rotateLeftBtn).append($rotateRightBtn);
            $toolbarCon.append($zoomInBtn).append($zoomOutBtn);
            $toolbarCon.append($closeBtn);
            $toolbar.append($toolbarCon);

            _t.$toolbar = $toolbar;
            return $toolbar;
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
                            if(_t.isZoom){
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
                $img = _t.$img,
                img = $img.get(0),
                imgWidth = _t.$img.width(),
                imgHeight = _t.$img.height(),
                containerHeight = $img.closest('.iv-content').height(),
                containerWidth = $img.closest('.iv-content').width();

            if(isIE){
                
                if(_t.rotate % 2 == 1 || _t.rotate % 2 == -1){
                    $img.css({
                        'top': (containerHeight - imgWidth) / 2 + 'px',
                        'left': (containerWidth - imgHeight) / 2 + 'px'
                    });
                } else {
                    $img.css({
                        'left': (containerWidth - imgHeight) / 2 + 'px',
                        'top': (containerHeight - imgWidth) / 2 + 'px'
                    });
                }

                $img.css('filter', 'progid:DXImageTransform.Microsoft.BasicImage(rotation=' + (_t.rotate < 0 ? 4 - (-_t.rotate % 4) : _t.rotate % 4) + ')');

                console.log($img.css('left') + '  ' + $img.css('top'));

            } else {
                $img.css('-webkit-transform', 'rotate(' + _t.rotate * 90 + 'deg)')
                    .css('-moz-transform', 'rotate(' + _t.rotate * 90 + 'deg)')
                    .css('-o-transform', 'rotate(' + _t.rotate * 90+'deg)')
                    .css('transform', 'rotate(' + _t.rotate * 90 + 'deg)');
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

        bindDragEvents: function () {

            var _t = this,
                $img = _t.$img,
                img = _t.$img.get(0),
                dragX,
                dragY,
                endDrag = function () {
                    _t.isMoved = false;
                    _t.isDrag = false;
                    _t.dragLeft = parseInt($img.css("left"));
                    _t.dragTop = parseInt($img.css("top"));
                    _t.$dragMask.hide();
                    $img.removeClass('iv-in-drag');
                };

            $img.on("mousedown",function(event){

                if(event.target === img){
                    dragX = event.pageX - _t.dragLeft;
                    dragY = event.pageY - _t.dragTop;
                    _t.isDrag = true;
                }

                return false;
            }).on("mousemove",function(event){

                if(!_t.isDrag) return false;

                if(event.target === img){
                    var _x = event.pageX - dragX,
                        _y = event.pageY - dragY;

                    $img.addClass('iv-in-drag');
                    _t.$dragMask.show();
                    img.style.left = _x + "px";
                    img.style.top = _y + "px";
                    _t.isMoved = true;
                }

                event.stopPropagation();
                return false;
            }).on("mouseup",function(){

                if(!_t.isDrag) return false;

                if(!_t.isMoved) _t.closeDialog();

                endDrag();
                return false;
            });

            $(document).on('mousemove', function (event) {

                if(event.target !== img) {
                    _t.isDrag = false;
                } else {
                    return false;
                }
                endDrag();
                return false;

            });

        },

        zoomIn: function () {
            var _t = this,
                img = _t.$img.get(0),
                src = img.src,
                left = parseInt(img.style.left),
                top = parseInt(img.style.top),
                _left,
                _top;

            if(_t.isZoom) return false;

            _t.imgWidth = _t.$img.width();
            _t.imgHeight = _t.$img.height();
            _t.$img.addClass('iv-zoom-in');
            _t.zoomImgWidth = _t.$img.width();
            _t.zoomImgHeight = _t.$img.height();

            _left = (_t.zoomImgWidth - _t.imgWidth) / 2;
            _top = (_t.zoomImgHeight - _t.imgHeight) / 2;

            img.style.left = left - _left + 'px';
            img.style.top = top - _top + 'px';

            _t.dragLeft = left - _left;
            _t.dragTop = top - _top;

            _t.isZoom = true;
        },

        zoomOut: function () {
            var _t = this,
                img = _t.$img.get(0),
                src = img.src,
                left = parseInt(img.style.left),
                top = parseInt(img.style.top),
                _left,
                _top;

            if(!_t.isZoom) return false;
            
            _t.zoomImgWidth = _t.$img.width();
            _t.zoomImgHeight = _t.$img.height();
            _t.$img.removeClass('iv-zoom-in');
            _t.imgWidth = _t.$img.width();
            _t.imgHeight = _t.$img.height();

            _left = (_t.zoomImgWidth - _t.imgWidth) / 2;
            _top = (_t.zoomImgHeight - _t.imgHeight) / 2;

            img.style.left = left + _left + 'px';
            img.style.top = top + _top + 'px';

            _t.dragLeft = left + _left;
            _t.dragTop = top + _top;

            _t.isZoom = false;
        },

        imgReady: function ($img) {
            var _t = this,
                img = $img.get(0),
                width = $img.closest('.iv-content').width(),
                height = $img.closest('.iv-content').height(),
                imgWidth = $img.width(),
                imgHeight = $img.height();

            $img.on('load', function () {
                _t.$img.removeClass('iv-zoom-in'); // #TODO: 是否要移除iv-zoom-in CLASS
                _t.isZoom = false;
                _t.rotate = 0;
                _t.setRotateAnim();
            });
        },

        closeDialog: function () {
            var _t = this;

            _t.$container.closest('.iv-wrapper').hide();

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
            } else {
                if(!$t.data('viewer') instanceof ImageViewer) throw new Error('重构错误!');
                /* 如果某个控件被重构，重新建立它的索引 */
                $t.data('viewer').refactor(album, options);
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

            enableBtnHoverSwitch: false, // true|false 是否在鼠标悬停时切换图片（悬停结束后切换回原图片）
            enableBtnHoverSlide: true, // true|false 是否在“前进”、“后退”按钮悬停时滚动图片
            thumbSilde: 'mousemove', // 'mouseover'|'mousemove'|'none' 
            slideSpeed: 1000, // 滚动速度：pixels/s
            opacity: 0.9,
            fadeTime: 100, // ms
            thumbOpacity: 0.5,
            thumbFadeTime: 100, // ms
            thumbEasing: 'linear'
        }
    };

})(jQuery);