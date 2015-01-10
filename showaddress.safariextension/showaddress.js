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
        styleTxt = 'position:fixed; display: inline-block; bottom: 0; left: 0; height: 16px; line-height: 16px; padding: 0 5px 0 0;border: 1px solid #ccc; border-radius: 0 2px 0 0; font: 12px "Lucida Grande","Lucida Sans Unicode",Helvetica,Arial,Verdana,sans-serif; color: #666; background-color: #f3f2f2;',
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

            if(reg.test(klass)){
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
        links = getTagEl('a');

        for(var i = 0, l = links.length; i < l; i++) {
            buffer = links[i];

            buffer.addEventListener('mouseenter', function () {
                instance.setTxt(this.href).show();
            });

            buffer.addEventListener('mouseleave', function () {
                instance.hide()
            });
        }
    }

})(window);
