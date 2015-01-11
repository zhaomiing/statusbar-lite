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
        styleTxt = 'position:fixed; display: inline-block; bottom: 0; left: 0; z-index: 10000;height: 16px; line-height: 16px; padding: 0 5px 0 0;border: 1px solid #ccc; border-radius: 0 2px 0 0; font: 12px "Lucida Grande","Lucida Sans Unicode",Helvetica,Arial,Verdana,sans-serif; color: #666; background-color: #f3f2f2;',
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
        var buffer;

        instance = new Constructor(options)._init();
        /*links = getTagEl('a');

        // TODO: 事件全局代理，解决动态加载内容中失效问题
        for(var i = 0, l = links.length; i < l; i++) {
            buffer = links[i];

            buffer.addEventListener('mouseenter', function () {
                instance.setTxt(decodeURI(this.href)).show();
            });

            buffer.addEventListener('mouseleave', function () {
                instance.hide();
            });
        }*/
        evProxy('body', 'a', 'mouseover', function () {
            instance.setTxt(decodeURI(this.href)).show();
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
        var sp, or, spn, spt, orn, ort, checkFn;

        sp = _detectType(superNode);
        or = _detectType(originNode);

        if(sp === null || or === null) return;
        if(getType(type) !== 'string' || getType(fn) !== 'function') return;

        spn = sp['dom'], spt = sp['type'], orn = or['dom'], ort = or['type'];

        checkFn = function (e) {
            e.preventDefault();

            var tar = e.target;

            if(ort === 'class') {
                if( tar.hasClass( originNode.substring(1) ) ){
                    fn.call(tar, data);
                }
            }
            else if(ort === 'id') {
                if( tar.id === originNode.substring(1) ) {
                    fn.call(tar, data);
                }
            }
            else if(ort === 'tag') {
                if( tar.tagName.toLowerCase() === originNode ) {
                    fn.call(tar, data);
                }
            }
        };

        spn.addEventListener(type, checkFn, false);
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
