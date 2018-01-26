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

    // var submit = document.createElement('span');
    // submit.className = 'submit';
    // var cancel = document.createElement('span');
    // cancel.className = 'cancel';

    // var spans = {};
    // spans.submit = submit;
    // spans.cancel = cancel;
    //
    // LiesLayer.prototype.spans = spans;
    //
    // LiesLayer.prototype.renderSpans = function (context) {
    //   var type = context.type || '';
    //   var content = context.content;
    //   var className = context.className || [];
    //   spans[type].innerHTML = content;
    //   spans[type].className = className.join(' ');
    // }

    LiesLayer.prototype.renderHeader = function (context) {
        header.innerHTML = context || '';
    }

    LiesLayer.prototype.renderContent = function (context) {
        if (context && context.nodeType) {
            content.parentNode.replaceChild(context, content);
            content = context;
        } else {
            content.innerHTML = context || '';
        }
    }

    LiesLayer.prototype.renderFooter = function (context) {
        console.log(context);
        var _this = this;
        footer.innerHTML = '';
        var context = context || [{ content: '确定', className: 'primary' }];
        // ie8不支持map
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
            // span.addEventListener('click', eval(value.click || LiesLayer.prototype.delete));
            // 这里主要是为了绑定this环境，不然的话，自定义的函数没法关闭弹窗
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
        var body = document.getElementsByTagName('body')[0];

        toast.innerText = context['content'];
        toast.className = 'toast';
        body.appendChild(toast);
        LiesLayer.prototype.toastPosition(toast);

        var time = parseInt(context["time"]);
        setTimeout(function () {
            body.removeChild(toast);
        },time)

    }



    LiesLayer.prototype.toastPosition = function (toast) {
        var innerWidth = parseInt(document.body.clientWidth);
        var innerHeight = parseInt(document.documentElement.clientHeight );
        var toastWidth = parseInt(toast.offsetWidth);
        var toastHeight = parseInt(toast.offsetHeight);
        console.log(innerWidth, innerHeight, toastWidth, toastHeight);

        toast.style.top = (innerHeight - toastHeight) / 2 + "px";
        toast.style.left = (innerWidth - toastWidth) / 2 + "px";
        toast.style["z-index"] = "100000";
    }





    LiesLayer.prototype.render = function () {
        document.body.appendChild(container);
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






            if (event === 'toast') {
                var tPayload = {};
                for (var key in payload) {
                    tPayload[key] = payload[key];
                }
                dispatcher(event, tPayload);
            }







            else if (typeof payload == 'object') {
                var tPayload = {};
                for (var pro in payload) {
                  if((payload[pro] instanceof Array) === true) {
                      tPayload[pro] = [];
                      for (var i = 0; i < payload[pro].length; i++) {
                          tPayload[pro][i] = {};
                          for (var key in payload[pro][i]) {
                              tPayload[pro][i][key] = payload[pro][i][key];
                          }
                      }
                  } else {
                      tPayload[pro] = payload[pro];
                  }
                }

                tPayload.content = refContent || tPayload.content;
                tPayload.footer = refFooter || tPayload.footer;
                console.log(tPayload.footer);
                dispatcher(event, tPayload);
            } else if (event) {
                dispatcher(event, payload);
            }
        })
    }

    for (var i = 0; i < cls.length; i++) {
        processor.click(cls[i]);
    }
})();