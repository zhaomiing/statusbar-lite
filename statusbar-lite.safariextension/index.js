/*!
* @desc safari 显示链接地址插件
* @author zhaoming.me#gmail.com
* @date 2015-01-10
*/



'use strict';

(function (win, undefined) {
    var datakey = 'safaristatusbarlite',
        createEl = document.createElement.bind(document),
        createTxt = document.createTextNode.bind(document),
        getTagEl = document.getElementsByTagName.bind(document),
        getClassEl = document.getElementsByClassName.bind(document),
        getIdEl = document.getElementById.bind(document),
        styleTxt = 'position:fixed; display: inline-block; bottom: 0; left: 0; z-index: 10000;max-width: 75%; overflow: hidden; text-overflow: ellipsis; height: 16px; line-height: 16px; padding: 0 5px 0 0;border: 1px solid #ccc; border-radius: 0 2px 0 0; white-space:nowrap;font: 12px "Lucida Grande","Lucida Sans Unicode",Helvetica,Arial,Verdana,sans-serif; color: #666; background-color: #f3f2f2;',
        options = {
            timer : 200,
            txt : '此节点由safari插件自动生成'
        },
        instance,
        saTid, //Show Animate TimeId 延时
        haTid, //Hide Animate TimeId 延时
        sTid,  //Show TimeId 延时
        hTid;  //Hide TimeId 延时


    function Constructor (options) {
        this.options = options;
    }

    Constructor.prototype = {
        constructor : Constructor,

        _init : function () {
            var bar = createEl('span'),
                styleEl = createEl('style'),
                cssTxt = createTxt('.' + datakey + '{' + styleTxt + '}');

            styleEl.setAttribute('type', 'text/css');
            styleEl.appendChild(cssTxt);
            styleEl.appendChild(createTxt('.f-dn{display:none;}'));
            document.head.appendChild(styleEl);

            bar.setAttribute('class', datakey + ' f-dn');
            bar.appendChild(createTxt(this.options.txt));
            document.body.appendChild(bar);

            this.barEl = bar;
            return this;
        },

        show : function () {
            var klass = this.barEl.className,
                reg = /\sf\-dn/ig;

            if( hasClass(this.barEl, 'f-dn') ){
                this.barEl.className = klass.replace(reg, '');
            }
        },

        hide : function () {
            var that = this,
                klass = this.barEl.className,
                el = this.barEl;

            el.style.opacity = 0;
            if(klass.indexOf('f-dn') === -1){
                that.barEl.className += ' f-dn';
                that.setTxt(that.options.txt);
            }
        },

        setTxt : function (str) {
            var el = this.barEl;

            el.innerHTML = str;
            return this;
        },

        /**
         * fade 淡入淡出
         * @param {string} type in|out淡入还是淡出
         * @param {function} fn 动画完成后的回调
         * @version 1.0
         * 2015-01-11
         */
        fade : function (type, fn) {
            var that = this,
                el = that.barEl,
                orOpacity = +( win.getComputedStyle(el, null).opacity ),
                isFadeout = type === 'out',
                isDone,
                _doLoop = function () {
                    var
                    // 检测动画完成？
                    _checkDone = function (curOpacity) {
                        var ret;

                        if(isFadeout) ret = curOpacity < 0;
                        else ret = curOpacity > 1;

                        return ret;
                    };

                    orOpacity = isFadeout ? (orOpacity - 0.1) : (orOpacity + 0.1);

                    if( !isDone ) {
                        // 淡出
                        if(isFadeout) {
                            haTid = setTimeout(function () {
                                that._setOpacity(orOpacity);
                                _doLoop();
                            }, that.options.timer / 10);
                        }
                        // 淡入
                        else{
                            saTid = setTimeout(function () {
                                that._setOpacity(orOpacity);
                                _doLoop();
                            }, that.options.timer / 10);
                        }
                        
                    }
                    else{
                        if(isFadeout) clearTimeout(haTid),that.hide();
                        else clearTimeout(saTid),that.barEl.style.opacity = 1;

                        fn && fn.call(that);
                    }

                    isDone = _checkDone((+el.style.opacity || orOpacity));
                };

            !isFadeout && that.show();
            _doLoop();
        },

        // 设置透明
        _setOpacity : function (num) {
            var el = this.barEl;

            el.style.opacity = num;
        }
    };

    if(win.top === win) {
        instance = new Constructor(options)._init();

        proxyEvent('body', 'a', 'mouseover', function () {
            var that = this,
                tagName = that.tagName.toLowerCase(),
                href, aNode;

            // 由 a 本身触发
            if(tagName === 'a'){
                href = that.href;
            }
            // 由 a 的 childNode 触发，href 需要网上回溯到a
            else{
                aNode = getClosestEl(that, 'a');
                href = aNode.href;
            }

            // 考虑没有href属性的情况
            if(!/^\s*$/ig.test(href)){
                // 跳过上轮动画
                haTid && clearTimeout(haTid), instance.hide();

                hTid && clearTimeout(hTid);
                sTid = setTimeout(function () {
                    instance.setTxt(decodeURI(href)).fade('in', undefined);
                }, 200);
            }

        }, undefined);

        proxyEvent('body', 'a', 'mouseout', function () {
            var tid;
            // 考虑没有href属性的情况
            if(!/^\s*$/ig.test(this.href)){
                // 跳过上轮动画
                saTid && clearTimeout(saTid), instance.show();
                
                sTid && clearTimeout(sTid);
                hTid = setTimeout(function () {
                    instance.fade('out', undefined);
                }, 200);
            }
        }, undefined);
    }

    ////////////////////////////////////////////////////////////////////////////
    //////////////////////////////[ utils ]/////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////

    /**
     * 事件代理
     * @param {string} superNode 代理元素标签名|类名|ID
     * @param {string} originNode 事件元素标签名|类名|ID
     * @param {string} type 事件类型
     * @param {function} fn 事件回调函数
     * @param {object} data 事件回调函数参数
     * @version 1.0
     * 2015-01-11
     */
    function proxyEvent (superNode, originNode, type, fn, data) {
        var sp, or, spn, spt, orn, ort, _checkFn, _detectType;

        //私有函数，检测evProxy参数类型, str: 元素标签名|类名|ID
        _detectType = function (str) {
            var ret = {},
                type;

            type = getType(str);

            if(type !== 'string') {
                ret = null;
            }
            else{
                switch (str[0]){
                    // 类名
                    case '.':
                        ret['dom'] = getClassEl(str.substring(1))[0];
                        ret['type'] = 'class';
                        break;
                    // Id
                    case '#':
                        ret['dom'] = getIdEl(str.substring(1));
                        ret['type'] = 'id';
                        break;
                    // 标签名
                    default :
                        ret['dom'] = getTagEl(str)[0];
                        ret['type'] = 'tag';
                        break;
                }
            }

            return ret;
        };

        // 根据事件是否由特定原始元素触发，从而判断是否执行回调
        _checkFn = function (e) {
            e.preventDefault();

            var tar = e.target;

            if(ort === 'class') {
                if( hasClass(tar, originNode.substring(1) ) ){
                    fixMouseOut(e, fn, data);
                }
            }
            else if(ort === 'id') {
                if( tar.id === originNode.substring(1) ) {
                    fixMouseOut(e, fn, data);
                }
            }
            else if(ort === 'tag') {
                if( tar.tagName.toLowerCase() === originNode || isDescendantOfTag(tar, 'a') ) {
                    fixMouseOut(e, fn, data);
                }
            }
        };

        sp = _detectType(superNode);
        or = _detectType(originNode);

        if(sp === null || or === null) return;
        if(getType(type) !== 'string' || getType(fn) !== 'function') return;

        spn = sp['dom'], spt = sp['type'], orn = or['dom'], ort = or['type'];

        spn.addEventListener(type, _checkFn, false);
    }

    /**
     * mouseover 到原素childNode 上时不触发 mouseout 回调
     * @param {object} event
     * @param {function} fn 原始回调
     * @param {object} data fn参数
     * @version 1.0
     * 2015-01-11
     */
     function fixMouseOut (event, fn, data) {
        var tar = event.target,
            reTar;

        if(event.type === 'mouseout') {
            reTar = event.relatedTarget || event.toElement;

            // reTar 只要不是 tar 的childNode 就触发
            // reTar 是否是 a 或者 a 的 childNode
            // 判断 reTar 是否存在，当鼠标从a元素移动到窗口外是 reTar === null
            if ( reTar !== null && !isDescendantOrSelf(reTar, tar) ) {
                fn.call(tar, data);
            }
        }
        else{
            fn.call(tar, data);
        }
    }

    /**
     * 某元素的上级有没有某个标签
     * @param {object} son dom
     * @param {string} tagStr 标签名
     * @return {boolean}
     * @version 1.0
     * 2015-01-11
     */
    function isDescendantOfTag(son, tagStr){
        var ret = false;

        if(son.tagName.toLowerCase() === tagStr) {
            ret = true;
        }
        else{
            while(son.parentNode && son.parentNode !== window) {
                try{
                    if(son.parentNode.tagName.toLowerCase() === tagStr) {
                        ret = true;
                        break;
                    }
                }catch(err){}

                son = son.parentNode;
            }
        }

        return ret;
    }

    /**
     * son 是否是 father 的下级节点 或者 son本身
     * @param {object} son dom
     * @param {object} father dom
     * @return {boolean}
     * @version 1.0
     * 2015-01-11
     */
    function isDescendantOrSelf(son, father) {
        var ret = false;

        if(son === father) {
            ret = true;
        }
        else{
            while(son.parentNode && son.parentNode !== window) {
                if(son.parentNode === father) {
                    ret = true;
                    break;
                }

                son = son.parentNode;
            }
        }

        return ret;
    }

    /**
     * jquery.fn.closest ployfill
     * @param {object} son dom
     * @param {string} parentTag 上级节点标签名
     * @return {object} ret dom
     * @version 1.0
     * 2015-01-11
     */
    function getClosestEl (son, parentTag) {
        var ret;

        if(son.tagName.toLowerCase() === parentTag) {
            ret = son;
        }
        else{
            while(son.parentNode && son.parentNode !== window) {
                if(son.parentNode.tagName.toLowerCase() === parentTag) {
                    ret = son.parentNode;
                    break;
                }

                son = son.parentNode;
            }
        }

        return ret;
    }

    /**
     * 检测对象类型
     * @param {object} obj
     * @return {string} 类型
     * @version 1.0
     * 2015-01-11
     */
    function getType (obj) {
        return Object.prototype.toString.call(obj).replace(/^\[object\s(.*)]$/,'$1').toLowerCase();
    }

    /**
     * 元素是否有某个类
     * @param {object} el dom
     * @param {string} klass className
     * @return {boolean}
     * @version 1.0
     * 2015-01-11
     */
    function hasClass(el, klass) {
        var className = el.className,
            reg, ret;

        klass = klass.replace('-', '\\-');
        // TODO: 正则考虑不全面
        // reg = /\sf\-dn/ig;
        reg = new RegExp('\\s' + klass, 'ig');
        ret = reg.test(className);
        return ret;
    }

})(window);
