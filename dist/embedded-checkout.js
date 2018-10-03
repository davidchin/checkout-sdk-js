module.exports=function(t){var e={};function n(r){if(e[r])return e[r].exports;var o=e[r]={i:r,l:!1,exports:{}};return t[r].call(o.exports,o,o.exports,n),o.l=!0,o.exports}return n.m=t,n.c=e,n.d=function(t,e,r){n.o(t,e)||Object.defineProperty(t,e,{enumerable:!0,get:r})},n.r=function(t){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(t,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(t,"__esModule",{value:!0})},n.t=function(t,e){if(1&e&&(t=n(t)),8&e)return t;if(4&e&&"object"==typeof t&&t&&t.__esModule)return t;var r=Object.create(null);if(n.r(r),Object.defineProperty(r,"default",{enumerable:!0,value:t}),2&e&&"string"!=typeof t)for(var o in t)n.d(r,o,function(e){return t[e]}.bind(null,o));return r},n.n=function(t){var e=t&&t.__esModule?function(){return t.default}:function(){return t};return n.d(e,"a",e),e},n.o=function(t,e){return Object.prototype.hasOwnProperty.call(t,e)},n.p="",n(n.s=74)}({0:function(t,e){t.exports=require("tslib")},108:function(t,e){t.exports=require("iframe-resizer")},115:function(t,e,n){"use strict";n.d(e,"a",function(){return o});var r=n(0);function o(t,e,n){return e&&n?i(t,e,n):function(t){var e=function(t){function e(){return null!==t&&t.apply(this,arguments)||this}return r.__extends(e,t),e}(t);return Object.getOwnPropertyNames(t.prototype).forEach(function(n){var r=Object.getOwnPropertyDescriptor(t.prototype,n);r&&"constructor"!==n&&Object.defineProperty(e.prototype,n,i(t.prototype,n,r))}),e}(t)}function i(t,e,n){if("function"!=typeof n.value)return n;var o=n.value;return{get:function(){var t=o.bind(this);return Object.defineProperty(this,e,r.__assign({},n,{value:t})),t},set:function(t){o=t}}}},122:function(t,e,n){"use strict";var r=n(0),o=function(t){function e(e){var n=t.call(this,e||"Invalid arguments have been provided.")||this;return n.type="invalid_argument",n}return r.__extends(e,t),e}(n(3).a);e.a=o},25:function(t,e,n){"use strict";var r;n.d(e,"a",function(){return r}),function(t){t.CheckoutComplete="CHECKOUT_COMPLETE",t.CheckoutError="CHECKOUT_ERROR",t.CheckoutLoaded="CHECKOUT_LOADED",t.FrameError="FRAME_ERROR",t.FrameLoaded="FRAME_LOADED"}(r||(r={}))},3:function(t,e,n){"use strict";var r=n(0);var o=function(t){function e(e){var n=this.constructor,r=t.call(this,e||"An unexpected error has occurred.")||this;return r.type="standard",function(t,e){Object.setPrototypeOf?Object.setPrototypeOf(t,e):t.__proto__=e}(r,n.prototype),"function"==typeof Error.captureStackTrace?Error.captureStackTrace(r,n):r.stack=new Error(r.message).stack,r}return r.__extends(e,t),e}(Error);e.a=o},74:function(t,e,n){"use strict";n.r(e);var r=n(25),o=function(){function t(t,e,n){this._iframeCreator=t,this._messageListener=e,this._options=n,this._isAttached=!1,this._options.onComplete&&this.on(r.a.CheckoutComplete,this._options.onComplete),this._options.onError&&this.on(r.a.CheckoutError,this._options.onError),this._options.onLoad&&this.on(r.a.CheckoutLoaded,this._options.onLoad),this._options.onFrameLoad&&this.on(r.a.FrameLoaded,this._options.onFrameLoad)}return t.prototype.attach=function(){var t=this;return this._isAttached?Promise.resolve(this):(this._isAttached=!0,this._messageListener.listen(),this._iframeCreator.createFrame(this._options.url,this._options.containerId).then(function(e){return t._iframe=e,t}).catch(function(e){throw t._isAttached=!1,t._messageListener.trigger({type:r.a.FrameError,payload:e}),e}))},t.prototype.detach=function(){this._isAttached&&(this._isAttached=!1,this._messageListener.stopListen(),this._iframe&&this._iframe.parentNode&&(this._iframe.parentNode.removeChild(this._iframe),this._iframe.iFrameResizer.close()))},t.prototype.on=function(t,e){this._messageListener.addListener(t,e)},t.prototype.off=function(t,e){this._messageListener.removeListener(t,e)},t}(),i=n(0),s=n(115);function a(t,e){return t.type===e}var u=function(){function t(t){this._origin=t,this._isListening=!1,this._listeners={}}return t.prototype.listen=function(){this._isListening||(this._isListening=!0,window.addEventListener("message",this._handleMessage))},t.prototype.stopListen=function(){this._isListening&&(this._isListening=!1,window.removeEventListener("message",this._handleMessage))},t.prototype.addListener=function(t,e){this._listeners[t]||(this._listeners[t]=[]),this._listeners[t].push(e)},t.prototype.removeListener=function(t,e){var n=this._listeners[t]&&this._listeners[t].indexOf(e);n>=0&&this._listeners[t].splice(n,1)},t.prototype.trigger=function(t){var e=this._listeners[t.type];e&&e.forEach(function(e){e(t)})},t.prototype._handleMessage=function(t){t.origin===this._origin&&function(t){return Object.keys(r.a).map(function(t){return r.a[t]}).indexOf(t&&t.type)>=0}(t.data)&&this.trigger(t.data)},i.__decorate([s.a],t.prototype,"_handleMessage",null),t}(),c=n(122);function h(t){if(!/^(https?:)?\/\//.test(t))throw new c.a("The provided URL must be absolute.");var e=document.createElement("a");return e.href=t,e.protocol+"//"+e.hostname+(e.port?":"+e.port:"")}var f=n(108),d=function(t){function e(e){var n=t.call(this,e||"Unable to embed the checkout form.")||this;return n.type="not_embeddable",n}return i.__extends(e,t),e}(n(3).a),p=function(){function t(t){this._options=t}return t.prototype.createFrame=function(t,e){var n=document.getElementById(e),r=(this._options||{}).timeout,o=void 0===r?5e3:r;if(!n)throw new d("Unable to embed the iframe because the container element could not be found.");var i=document.createElement("iframe");return i.src=t,i.style.border="none",i.style.display="none",i.style.width="100%",n.appendChild(i),this._toResizableFrame(i,o).catch(function(t){throw n.removeChild(i),t})},t.prototype._toResizableFrame=function(t,e){return new Promise(function(n,o){var i=window.setTimeout(function(){o(new d("Unable to embed the iframe because the content could not be loaded."))},e),s=function(e){if(e.origin===h(t.src)&&(a(e.data,r.a.FrameError)&&(u(),o(new d(e.data.payload.message))),a(e.data,r.a.FrameLoaded))){t.style.display="";var i=Object(f.iframeResizer)({scrolling:!1,sizeWidth:!1,heightCalculationMethod:"lowestElement"},t);u(),n(i[i.length-1])}},u=function(){window.removeEventListener("message",s),window.clearTimeout(i)};window.addEventListener("message",s)})},t}();function l(t){return new o(new p,new u(h(t.url)),t).attach()}n.d(e,"embedCheckout",function(){return l})}});
//# sourceMappingURL=embedded-checkout.js.map