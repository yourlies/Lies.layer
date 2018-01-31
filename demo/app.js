(function () {
    'use strict';
    self.LiesLayer = function () {};

    var container = document.createElement('div');
    container.className = 'layer container';
    var header = document.createElement('div');
    header.className = 'header';
    var content = document.createElement('div');
    content.className = 'content';
    var footer = document.createElement('div');
    footer.className = 'footer';
    container.appendChild(header);
    container.appendChild(content);
    container.appendChild(footer);

    LiesLayer.prototype.renderHeader = function (context) {
        header.innerHTML = context || '';
    }

    LiesLayer.prototype.renderContent = function (context) {
        if (context && context.nodeType) {
            console.log(context);
            context.nodeType
            content.parentNode.replaceChild(context, content);
            content = context;
        } else {
            content.innerHTML = context || '';
        }
    }

    LiesLayer.prototype.renderFooter = function (context) {
        var _this = this;
        footer.innerHTML = '';
        var context = context || [{ content: '确定', className: 'primary' }];
        for (var i = 0; i < context.length; i++) {
            var dev = context[i];
            var btn;
            if (!dev.nodeType) {
                btn = document.createElement('span');
                btn.innerHTML = dev.content || '';
                btn.className = dev.className || '';
            } else {
                btn = dev;
            }
            var clickHandler;
            if (dev.event) {
                clickHandler = eval(dev.event).bind(_this);
                btn.addEventListener('click', clickHandler)
            } else {
                if (!dev.nodeType) {
                    btn.addEventListener('click', function () {
                        clickHandler.apply({ cancelLayer: _this.delete });
                    });
                }
            }
            footer.appendChild(btn);
        }
    }



        LiesLayer.prototype.renderToast = function (context) {
        console.log(context);
        var toast = document.createElement('div');

        toast.innerText = context['content'];
        toast.className = 'toast';
        document.body.appendChild(toast);
        LiesLayer.prototype.positionCenter(toast);

        var time = parseInt(context["time"]);
        setTimeout(function () {
            document.body.removeChild(toast);
        }, time)

    }



    LiesLayer.prototype.positionCenter = function (ele) {
        var innerWidth = parseInt(document.body.clientWidth);
        var innerHeight = parseInt(document.documentElement.clientHeight);
        var eleWidth = parseInt(ele.offsetWidth);
        var eleHeight = parseInt(ele.offsetHeight);

        ele.style.top = (innerHeight - eleHeight) / 2 + "px";
        ele.style.left = (innerWidth - eleWidth) / 2 + "px";
        ele.style["z-index"] = "10001";
    }

    LiesLayer.prototype.render = function () {
        document.body.appendChild(container);
        LiesLayer.prototype.positionCenter(container);
    }

    LiesLayer.prototype.delete = function () {
        if (document.body.contains(container)) {
            document.body.removeChild(container);
        }
    }
})();


(function () {
    var Layer = new LiesLayer;
    var cls = document.querySelectorAll('[--click]');

    var createLayer = function (payload) {
        Layer.renderHeader(payload.header);
        Layer.renderContent(payload.content);
        Layer.renderFooter(payload.footer);
        Layer.render();
    }

    var cancelLayer = function (payload) {
        Layer.delete();
    }

    var dispatcher = function (event, payload) {
        switch (event) {
            case 'create':
                createLayer(payload);
                break;
            case 'cancel':
                cancelLayer();
                break;
            case 'bind':
                payload.apply({ cancelLayer: Layer.delete });
                break;
            case 'toast':
                Layer.renderToast(payload);
                break;
            default:
                console.error('Undefined event');
                break;
        }
    }

    // 因为用var变量没有作用区块，会导致最后变量全部成了最后的值
    var Tool = {};
    var _deepExtend = function (object, container) {
        for (var pro in object) {
            // 闭包函数可以保存作用区块使得函数内部的，key，value是不会改变的
            (function (key, value) {
                if (value instanceof Array === true) {
                    container[key] = [];
                    _deepExtend(value, container[key]);
                } else if (typeof value == 'object') {
                    container[key] = {};
                    _deepExtend(value, container[key]);
                } else {
                    container[key] = value;
                }
            })(pro, object[pro]);
        }
    }
    Tool.deepExtend = function (object) {
        var container = [];
        _deepExtend(object, container);
        return container;
    }

    var processor = {};
    processor.click = function (ref) {
        var key = ref.getAttribute('--click');
        ref.removeAttribute('--click');
        var chips = key.split('|');

        var refId = ref.getAttribute('--id');
        var refContent = '';
        var refFooter = '';
        if (refId) {
            refContent = document.querySelector('[--' + refId + '=content]');
            if (refContent) {
                refContent.parentNode.removeChild(refContent);
            }

            refFooter = document.querySelectorAll('[--' + refId + '=footer]');
            for (var i = 0; i < refFooter.length; i++) {
                var btn = refFooter[i];
                btn.parentNode.removeChild(btn);
                if (!btn.getAttribute('--click')) {
                    btn.addEventListener('click', function () {
                        Layer.delete();
                    })
                }
            }
        }

        ref.addEventListener('click', function () {
            var event = chips[0];
            var payload = eval(chips[1] || '') || {};

            if (typeof payload == 'object') {
                var extendPayload = Tool.deepExtend(payload);
                switch (event){
                    case 'create': {
                        extendPayload.content = refContent || extendPayload.content;
                        extendPayload.footer = refFooter || extendPayload.footer;
                        break;
                    }
                    defualt: {
                        break;
                    }
                }
                dispatcher(event, extendPayload);

            } else {
                dispatcher(event, payload);
            }
        })
    }

    for (var i = 0; i < cls.length; i++) {
        processor.click(cls[i]);
    }
})();