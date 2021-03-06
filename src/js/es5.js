import '@webcomponents/webcomponentsjs';
import 'whatwg-fetch';
import './polyfills/endswith.js';
import '@cagov/accordion';
import '@cagov/step-list';
import './alerts/index.js';
import './telehealth/index.js';
import './plasma/index.js';
import './feature-detect/webp.js';
import './menu/index.js';
import './roadmap/index.js';
import './dashboard/index.js';
import applyAccordionListeners from './tracking-you/index.js';
// twitter widget doesn't support IE11 so not including here
window.onload = (event) => {
  applyAccordionListeners();
};

// This is an IE polyfill for CustomEvent.
// Thank you, MDN. https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent/CustomEvent#Polyfill
(function () {
  if (typeof window.CustomEvent === 'function') return false;
  function CustomEvent (event, params) {
    params = params || { bubbles: false, cancelable: false, detail: null };
    var evt = document.createEvent('CustomEvent');
    evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
    return evt;
  }
  window.CustomEvent = CustomEvent;
})();
