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

  var submit = document.createElement('span');
  submit.className = 'submit';
  var cancel = document.createElement('span');
  cancel.className = 'cancel';

  var spans = {};
  spans.submit = submit;
  spans.cancel = cancel;

  LiesLayer.prototype.spans = spans;

  LiesLayer.prototype.renderSpans = function (context) {
    var type = context.type;
    var content = context.content;
    var className = context.className || [];
    spans[type].innerHTML = content;
    spans[type].className = className.join(' ');
  }

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
    footer.innerHTML = '';
    if (context && context.length) {
      for (var i = 0; i < context.length; i++) {
        footer.appendChild(context[i]);
      }
    } else if (context) {
      footer.appendChild(context);
    } else {
      footer.appendChild(submit);
      footer.appendChild(cancel);
    }
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

  var directives = {};

  var createLayer = function (payload) {
    Layer.renderHeader(payload.header);
    Layer.renderContent(payload.content);
    Layer.renderFooter(payload.footer);
    Layer.render();
  }

  var cancelLayer = function (payload) {
    Layer.delete();
  }

  directives.cancel = cancelLayer;

  var dispatcher = function (event, payload) {
    switch (event) {
      case 'create':
        createLayer(payload);
        break;
      case 'cancel':
        cancelLayer();
        break;
      case 'bind':
        payload.apply(directives);
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
      if (refFooter) {
        for (var i = 0; i < refFooter.length; i++) {
          refFooter[i].parentNode.removeChild(refFooter[i]);          
        }
      }
    }

    ref.addEventListener('click', function () {
      var event = chips[0];
      var payload = eval(chips[1] || '') || {};
      if (typeof payload == 'object') {
        var tPayload = {};
        for (var pro in payload) {
          tPayload[pro] = payload[pro];
        }
        tPayload.content = refContent || tPayload.content;
        tPayload.footer = refFooter || tPayload.footer;
        dispatcher(event, tPayload);
      } else {
        dispatcher(event, payload);        
      }
    })
  }

  for (var i = 0; i < cls.length; i++) {
    processor.click(cls[i]);
  }

  var handler = {
    submit: 'cancel',
    cancel: 'cancel',
  };

  Layer.renderSpans({
    type: 'submit',
    content: '确定',
    className: ['submit', 'primary'],
  });

  Layer.spans.submit.addEventListener('click', function () {
    dispatcher(handler.submit);
  });

  Layer.renderSpans({
    type: 'cancel',
    content: '取消',
  });

  Layer.spans.cancel.addEventListener('click', function () {
    dispatcher(handler.cancel);
  });
})();