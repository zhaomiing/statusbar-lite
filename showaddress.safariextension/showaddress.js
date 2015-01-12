/*!
* @desc safari 显示链接地址插件
* @author zhaoming.me#gmail.com
* @date 2015-01-10
*/



'use strict';

(function (win, udf) {
    var datakey = 'showaddressz',
        createEl = document.createElement.bind(document),
        createTxt = document.createTextNode.bind(document),
        getTagEl = document.getElementsByTagName.bind(document),
        getClassEl = document.getElementsByClassName.bind(document),
        getIdEl = document.getElementById.bind(document),
        styleTxt = 'position:fixed; display: inline-block; bottom: 0; left: 0; z-index: 10000;max-width: 75%; overflow: hidden; height: 16px; line-height: 16px; padding: 0 5px 0 0;border: 1px solid #ccc; border-radius: 0 2px 0 0; white-space:nowrap;font: 12px "Lucida Grande","Lucida Sans Unicode",Helvetica,Arial,Verdana,sans-serif; color: #666; background-color: #f3f2f2;',
        options = {
            timer : 300,
            txt : '此节点由safari插件自动生成'
        },instance,links;

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
            // styleEl.appendChild(createTxt('a *{pointer-events: none;}'));
            document.head.appendChild(styleEl);

            bar.setAttribute('class', datakey + ' f-dn');
            bar.appendChild(createTxt(this.options.txt)),
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
            var klass = this.barEl.className;

            if(klass.indexOf('f-dn') === -1){
                this.barEl.className += ' f-dn';
                this.setTxt(this.options.txt);
            }
        },

        setTxt : function (str) {
            var el = this.barEl;

            el.innerHTML = str;
            return this;
        }
    };

    if(window.top === window) {
        instance = new Constructor(options)._init();

        evProxy('body', 'a', 'mouseover', function () {
            var that = this,
                tagName = that.tagName.toLowerCase(),
                href, aNode;

            // 由 a 本身触发
            if(tagName === 'a'){
                href = that.href;
            }
            // 由 a 的 childNode 触发，href 需要网上回溯到a
            else{
                aNode = window.getClosestEl(that, 'a');
                href = aNode.href;
            }

            instance.setTxt(decodeURI(href)).show(); 
        });

        evProxy('body', 'a', 'mouseout', function () {
            instance.hide();
        });
    }

    /**
     * 事件代理
     * @param {string} superNode 代理元素标签名|类名|ID
     * @param {string} originNode 事件元素标签名|类名|ID
     * @param {string} type 事件类型
     * @param {function} fn 事件回调函数
     * @param {object} fn 事件回调函数参数
     * @version 1.0
     * 2015-01-11
     */
    function evProxy (superNode, originNode, type, fn, data) {
        var sp, or, spn, spt, orn, ort, _checkFn, _fixMouseOut;

        sp = _detectType(superNode);
        or = _detectType(originNode);

        if(sp === null || or === null) return;
        if(getType(type) !== 'string' || getType(fn) !== 'function') return;

        spn = sp['dom'], spt = sp['type'], orn = or['dom'], ort = or['type'];

        _checkFn = function (e) {
            e.preventDefault();

            var tar = e.target;

            if(ort === 'class') {
                if( tar.hasClass( originNode.substring(1) ) ){
                    _fixMouseOut(e, fn);
                }
            }
            else if(ort === 'id') {
                if( tar.id === originNode.substring(1) ) {
                    _fixMouseOut(e, fn);
                }
            }
            else if(ort === 'tag') {
                // type == 'mouseover' && console.log(tar.tagName.toLowerCase());
                if( tar.tagName.toLowerCase() === originNode || isDescendantOfTag(tar, 'a') ) {
                    _fixMouseOut(e, fn);
                }
            }
        };

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
                    // TODO: why try
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

        window.getClosestEl = getClosestEl;

        /**
         * mouseover 到原素childNode 上时不触发 mouseout 回调
         * @param {object} evnet
         * @param {function} fn 原始回调
         * @version 1.0
         * 2015-01-11
         */
        _fixMouseOut = function (event, fn) {
            var tar = event.target,
                reTar;

            if(event.type === 'mouseout') {
                reTar = event.relatedTarget || event.toElement;
                
                // reTar 只要不是 tar 的childNode 就触发
                // reTar 是否是 a 或者 a 的 childNode
                if ( !isDescendantOrSelf(reTar, tar) ) {
                    fn.call(tar, data);
                }
            }
            else{
                fn.call(tar, data);
            }
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

            /*console.log('mouseout进入: ',son);
            console.log('mouseout离开: ',father);
            console.log('----------');*/
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

        spn.addEventListener(type, _checkFn, false);
    }

    /**
     * 私有函数，检测evProxy参数类型
     * @pram {string} 元素标签名|类名|ID
     * @return {object} dom , type
     * @version 1.0
     * 2015-01-11
     */
    function _detectType (str) {
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
     * classlist.contains polyfill
     * @param {object} dom
     * @param {string} className
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
