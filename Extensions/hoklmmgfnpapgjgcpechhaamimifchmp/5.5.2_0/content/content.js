!function(t){var e={};function n(r){if(e[r])return e[r].exports;var o=e[r]={i:r,l:!1,exports:{}};return t[r].call(o.exports,o,o.exports,n),o.l=!0,o.exports}n.m=t,n.c=e,n.d=function(t,e,r){n.o(t,e)||Object.defineProperty(t,e,{enumerable:!0,get:r})},n.r=function(t){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(t,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(t,"__esModule",{value:!0})},n.t=function(t,e){if(1&e&&(t=n(t)),8&e)return t;if(4&e&&"object"==typeof t&&t&&t.__esModule)return t;var r=Object.create(null);if(n.r(r),Object.defineProperty(r,"default",{enumerable:!0,value:t}),2&e&&"string"!=typeof t)for(var o in t)n.d(r,o,function(e){return t[e]}.bind(null,o));return r},n.n=function(t){var e=t&&t.__esModule?function(){return t.default}:function(){return t};return n.d(e,"a",e),e},n.o=function(t,e){return Object.prototype.hasOwnProperty.call(t,e)},n.p="",n(n.s=57)}({0:function(t,e,n){"use strict";n.d(e,"e",function(){return u}),n.d(e,"o",function(){return s}),n.d(e,"j",function(){return E}),n.d(e,"w",function(){return O}),n.d(e,"f",function(){return d}),n.d(e,"p",function(){return I}),n.d(e,"u",function(){return _}),n.d(e,"a",function(){return m}),n.d(e,"s",function(){return l}),n.d(e,"b",function(){return f}),n.d(e,"C",function(){return A}),n.d(e,"x",function(){return R}),n.d(e,"n",function(){return w}),n.d(e,"g",function(){return N}),n.d(e,"m",function(){return C}),n.d(e,"z",function(){return g}),n.d(e,"B",function(){return v}),n.d(e,"y",function(){return h}),n.d(e,"i",function(){return p}),n.d(e,"A",function(){return T}),n.d(e,"r",function(){return L}),n.d(e,"t",function(){return S}),n.d(e,"l",function(){return y}),n.d(e,"k",function(){return P}),n.d(e,"d",function(){return b}),n.d(e,"c",function(){return D}),n.d(e,"q",function(){return G}),n.d(e,"h",function(){return M}),n.d(e,"v",function(){return x});var r,o,i=n(4),a=n.n(i),c=n(15),u={IFRAME_HEIGHT:"98%",IFRAME_WIDTH:"470px",OUTER_IFRAME_ID:"similarweb-outer-content",INNER_IFRAME_ID:"similarweb-inner-content",IFRAME_CONTENT_ID:"iframe-content",MAX_Z_INDEX:"2147483647",BODY_INTERVAL:100,SLIDE_IN_CLASS:"slideIn",SLIDE_OUT_CLASS:"slideOut",IFRAME_INIT_EVENT:"SW_iframeInitEvent",START_IFRAME_INIT:"SW_startIframeInit",CONTENT_REACT_READY:"SW_contentReactReady",TRIGGER_DISPATCH_FOR_SELF:"SW_triggerDispatchForSelf",EVENTS:{SIMILARWEB_TOGGLE_PANEL:"similarweb-toggle-panel",CLEAR_HOST_KEY:"similarweb-clear-host",OPEN_OPTIONS_PAGE:"similarweb-open-options-page"},SOURCES:{SIMILARWEB_TOGGLE_PANEL:"SIMILARWEB_TOGGLE_PANEL",SIMILARWEB_CLICK_OUTSIDE:"SIMILARWEB_CLICK_OUTSIDE"}},s={TOGGLE_POPUP:"togglePopup",GA_EVENT:"gaEvent",FETCH_DATA:"fetchData",OPEN_URL_IN_NEW_TAB:"openUrlInNewTab",UPDATE_KEY:"updateKey",UPDATE_ALL_PAGES:"updateAllPages",UPDATE_STORE:"updateStore",CLEAR_KEY:"clearKey",GET_DOMINANT_COLOR_OF_IMAGE_URL:"getDominantColorOfImageUrl",OPEN_OPTIONS_PAGE:"openOptionsPage",IS_INSTALLED:"isInstalled"},E={CATEGORIES:{MAIN_KPIS:"Main KPIs",WELCOME_PAGE:"Welcome Page",API:"API",PANEL:"Panel",POPUP:"Popup",SW_HOST_CHOOSING:"SW Host Choosing",HEADER:"Header",SHARE_MODAL:"Share Modal",RATE_MODAL:"Rate Modal"},ACTIONS:{INSTALL:"Install",UPDATE:"Update",EXTENSION_ICON_CLICK:"Extension Icon Click",WELCOME_LOADED:"Page Loaded",PAST_TIME_ON_PAGE:"Past Time On Page",TIME_TO_FETCH:"Time To Fetch",REQUEST:"Request",RESPONSE:"Response",POPUP_SHOWN:"Popup Shown",POPUP_CLOSED:"Popup Closed",ERROR_VIEW_SHOWN:"Error View Shown",GLOBAL_RANK_BUCKET:"Global Rank Bucket",MONTHLY_VISITS_BUCKET:"Monthly Visits Bucket",SHOW_PANEL:"Show Panel",HIDE_PANEL:"Hide Panel",OVERLAY_SHOWN:"Overlay Shown",OVERLAY_CLOSED:"Overlay Closed",OPTION_SELECTED:"Option Selected",LEARN_MORE:"Learn More",MENU_CLICKED:"Menu Clicked",MENU_ITEM_CLICKED:"Menu Item Clicked",SHARE_BUTTON_CLICKED:"Share Button Clicked",RATE_BUTTON_CLICKED:"Rate Button Clicked",DATA_VIEW_SHOWN:"Data View Shown",CLICK_ON_CONTENT:"Click On Content",CLICK_GO_TO_TRAFFIC_AND_ENGAGEMENT:"Click Go To Traffic And Engagement",CLICK_SEE_MORE_COUNTRIES:"Click See More Countries",CLICK_GO_TO_SIMILARWEB:"Click Go To SimilarWeb",NO_DATA_VIEW_SHOWN:"No Data View Shown",MORE_INSIGHTS_CLICK:"More Insights Click",CLICK_ON_WORLDWIDE:"Click On Worldwide",CLICK_ON_COUNTRY:"Click On Country",CLICK_ON_CATEGORY:"Click On Category",TIME_TO_CLICK:"Time to click since page load",TIME_TO_LOAD_PANEL:"Time to load panel since click on browserAction",TIME_TO_SHOW_DATA_IN_PANEL:"Time to show data in panel since click on browserAction",CLICK_ON_ZOOM_BUTTON:"Click On Map Zoom Buttons"},LABELS:{MILLISECONDS:"Milliseconds",SUCCESS:"Success",FAIL:"Fail",DATA_VIEW:"Data",ERROR_VIEW:"Error",OPEN:"Open",CLOSE:"Close",FEEDBACK:"Feedback",RATE:"Rate",SHARE:"Share",EMAIL:"Email",FACEBOOK:"Facebook",TWITTER:"Twitter",COPY_LINK:"Copy Link",OVERVIEW:"overview",TRAFFIC_AND_ENGAGEMENT:"traffic_and_engagement",GEOGRAPHY:"geography",TRAFFIC_SOURCES:"traffic_sources"},CUSTOM_DIMENSIONS:{TRUE:"TRUE",FALSE:"FALSE"}},_={WELCOME_URL:"".concat(Object(c.isJestWorker)()?"chrome-extension://hoklmmgfnpapgjgcpechhaamimifchmp/welcome/welcome.html":chrome.runtime.getURL("welcome/welcome.html")),UNINSTALL_URL:"https://www.similarweb.com/extension-uninstall"},m={PATH:"https://api.similarweb.com/v1/SimilarWebAddon/",ENDPOINT:"/all"},l="popup/popup.html",f=["chrome://","chrome-extension://","https://chrome.google.com/webstore/","about:","https://addons.mozilla.org","moz-extension://"],O={GA:{OVERRIDE_SAMPLING:"overrideSampling",INSTALLED_AT:"installedAt",AGE:"age",LAST_AGE:"lastAge",D1:"D1",D7:"D7",D14:"D14",D28:"D28",D90:"D90",USER_TYPE:"userType"},IS_PRO:"isPro",SHOW_SW_PLATFORM_PICK_OVERLAY:"showSWPlatformPickOverlay",OPEN_IN_BG:"openInBg",SEARCH_ENGINE:"searchEngine",SEARCH_ENGINE_BASE_URL:"searchEngineBaseUrl",IS_OPTED_IN:"autoIcon"},d=(r={},a()(r,O.IS_OPTED_IN,!0),a()(r,O.SHOW_SW_PLATFORM_PICK_OVERLAY,"1"),a()(r,O.OPEN_IN_BG,"0"),a()(r,O.SEARCH_ENGINE_BASE_URL,"https://www.google.com/search?q="),a()(r,O.SEARCH_ENGINE,"google"),r),I={SHOW_INFO:"showInfo",SE:"se",SE_BASE_URL:"SEBaseUrl"},A={LOADING:"LoadingView",DATA:"DataView",ERROR:"ErrorView",NO_DATA:"NoDataView"},h={FIREFOX:"https://addons.mozilla.org/firefox/addon/similarweb-sites-recommendatio",CHROME:"https://chrome.google.com/webstore/detail/similarweb-traffic-rank-w/hoklmmgfnpapgjgcpechhaamimifchmp"},p=["https://docs.google.com/forms/d/e/1FAIpQLSfNQzbQREyApqSfR4jH-2um5-J8___zyGr93C215j65w0JbWg/viewform","https://docs.google.com/forms/d/e/1FAIpQLSdZCc2csocWoFeDmdKOQao-VV5jVIyEvVXBzBXIgZkOzxiyxQ/viewform"],T={Referrals:"#fc9f52",Direct:"#375675","Paid Referrals":"#308d9d",Mail:"#58c3b9",Social:"#e95f5f",Search:"#3dc4dc"},L={THRESHOLDS:{IN_OR_OUT_LABEL:8,MINIMUM_VALUE_FOR_LABEL:2},STYLES:{INSIDE_LABEL_COLOR:"#ffffff",OUTSIDE_LABEL_COLOR:"rgba(42, 62, 82, 0.8)",DISTANCE_OUTSIDE:30,DISTANCE_INSIDE:-30}},S={GlobalRank:"globalrank",CountryRank:"countryrank",CategoryRank:"categoryrank"},R={isPro:O.IS_PRO,isBackgroundLinks:O.OPEN_IN_BG},w={TEST:"test",MORE_INSIGHTS:"more insights",TRAFFIC_AND_ENGAGEMENT:"traffic and engagement",SEE_MORE_COUNTRIES:"see more countries",GO_TO_SIMILARWEB:"go to similarweb",OVERVIEW_WORLDWIDE:"overview worldwide",OVERVIEW_COUNTRY:"overview country",OVERVIEW_CATEGORY:"overview category"},N=(o={},a()(o,w.TEST,{GA:{CATEGORY:E.CATEGORIES.PANEL,ACTION:"test"},LITE:"https://www.LITE.com",PRO:"https://www.PRO.com"}),a()(o,w.MORE_INSIGHTS,{GA:{CATEGORY:E.CATEGORIES.HEADER,ACTION:E.ACTIONS.MORE_INSIGHTS_CLICK},LITE:"https://www.similarweb.com/website/$DOMAIN$?utm_source=addon&utm_medium=$browser&utm_content=header&utm_campaign=cta-button&from_ext=1",PRO:"https://pro.similarweb.com/?utm_source=addon&utm_medium=$browser&utm_content=header&utm_campaign=cta-button&from_ext=1#/website/worldwide-overview/$DOMAIN$/*/999/3m"}),a()(o,w.TRAFFIC_AND_ENGAGEMENT,{GA:{CATEGORY:E.CATEGORIES.PANEL,ACTION:E.ACTIONS.CLICK_GO_TO_TRAFFIC_AND_ENGAGEMENT},LITE:"https://www.similarweb.com/website/$DOMAIN$?utm_source=addon&utm_medium=$browser&utm_content=header&utm_campaign=cta-button&from_ext=1",PRO:"https://pro.similarweb.com/?utm_source=addon&utm_medium=$browser&utm_content=overview&utm_campaign=see-more-traffic-engagement&from_ext=1#/website/audience-overview/$DOMAIN$/*/999/3m/"}),a()(o,w.SEE_MORE_COUNTRIES,{GA:{CATEGORY:E.CATEGORIES.PANEL,ACTION:E.ACTIONS.CLICK_SEE_MORE_COUNTRIES},LITE:"https://www.similarweb.com/website/$DOMAIN$?utm_source=addon&utm_medium=$browser&utm_content=header&utm_campaign=cta-button&from_ext=1#geo",PRO:"https://pro.similarweb.com/?utm_source=addon&utm_medium=$browser&utm_content=geography&utm_campaign=see-more-countries&from_ext=1#/website/audience-geography/$DOMAIN$/*/999/3m"}),a()(o,w.GO_TO_SIMILARWEB,{GA:{CATEGORY:E.CATEGORIES.PANEL,ACTION:E.ACTIONS.CLICK_GO_TO_SIMILARWEB},LITE:"https://www.similarweb.com/website/$DOMAIN$?utm_source=addon&utm_medium=$browser&utm_content=footer&utm_campaign=cta-button",PRO:"https://pro.similarweb.com/?utm_source=addon&utm_medium=$browser&utm_content=footer&utm_campaign=cta-button&from_ext=1#/website/worldwide-overview/$DOMAIN$/*/999/3m"}),a()(o,w.OVERVIEW_WORLDWIDE,{GA:{CATEGORY:E.CATEGORIES.PANEL,ACTION:E.ACTIONS.CLICK_ON_WORLDWIDE},LITE:"https://www.similarweb.com/top-websites/?utm_source=addon&utm_medium=$browser&utm_content=overview&utm_campaign=global-rank",PRO:"https://pro.similarweb.com/?utm_source=addon&utm_medium=$browser&utm_content=overview&utm_campaign=global-rank&from_ext=1#/industry/topsites/All/999/3m"}),a()(o,w.OVERVIEW_COUNTRY,{GA:{CATEGORY:E.CATEGORIES.PANEL,ACTION:E.ACTIONS.CLICK_ON_COUNTRY},LITE:"https://www.similarweb.com/top-websites/$COUNTRY_NAME$?utm_source=addon&utm_medium=$browser&utm_content=overview&utm_campaign=country-rank",PRO:"https://pro.similarweb.com/?utm_source=addon&utm_medium=$browser&utm_content=overview&utm_campaign=country-rank&from_ext=1#/industry/topsites/All/$COUNTRY_CODE$/3m"}),a()(o,w.OVERVIEW_CATEGORY,{GA:{CATEGORY:E.CATEGORIES.PANEL,ACTION:E.ACTIONS.CLICK_ON_CATEGORY},LITE:"https://www.similarweb.com/top-websites/category/$CATEGORY_NAME$?utm_source=addon&utm_medium=$browser&utm_content=overview&utm_campaign=category-rank",PRO:"https://pro.similarweb.com/?utm_source=addon&utm_medium=$browser&utm_content=overview&utm_campaign=category-rank&from_ext=1#/industry/overview/$CATEGORY_NAME$/999/3m"}),o),C="https://www.similarweb.com/pro?utm_campaign=addon&utm_keyword=get-more&utm_matchtype=chrome",g={PRO:"PRO",LITE:"LITE"},v={NEW:"New",OLD:"Old"},y={FAVICON_DOMINANT:{MAX_COLOR_VALUE:220}},P="https://www.google.com/s2/favicons",b={VISITS:"visits",GEO:"geo",MMX:"mmx"},D={FIREFOX:"firefox",CHROME:"chrome"},G={MAC:"mac",WINDOWS:"windows",LINUX:"linux"},M={SIMILARSITES:"necpbmbhhdiplmfhmjicabdeighkndkn"},x={FACEBOOK:"ExtFB",TWITTER:"ExtTwitter",MAIL:"ExtEmail",COPY:"ExtCopy"}},15:function(t,e){e.isDevEnv=function(){return!1},e.isJestWorker=function(){return void 0!==Object({NODE_ENV:"production"}).JEST_WORKER_ID}},18:function(t,e,n){"use strict";n.d(e,"a",function(){return o}),n.d(e,"b",function(){return i});var r=n(0),o=function(){return void 0!==window.InstallTrigger?r.c.FIREFOX:r.c.CHROME},i=function(){return o()===r.c.FIREFOX?r.y.FIREFOX:r.y.CHROME}},20:function(t,e,n){var r=function(){return this||"object"==typeof self&&self}()||Function("return this")(),o=r.regeneratorRuntime&&Object.getOwnPropertyNames(r).indexOf("regeneratorRuntime")>=0,i=o&&r.regeneratorRuntime;if(r.regeneratorRuntime=void 0,t.exports=n(21),o)r.regeneratorRuntime=i;else try{delete r.regeneratorRuntime}catch(t){r.regeneratorRuntime=void 0}},21:function(t,e){!function(e){"use strict";var n,r=Object.prototype,o=r.hasOwnProperty,i="function"==typeof Symbol?Symbol:{},a=i.iterator||"@@iterator",c=i.asyncIterator||"@@asyncIterator",u=i.toStringTag||"@@toStringTag",s="object"==typeof t,E=e.regeneratorRuntime;if(E)s&&(t.exports=E);else{(E=e.regeneratorRuntime=s?t.exports:{}).wrap=p;var _="suspendedStart",m="suspendedYield",l="executing",f="completed",O={},d={};d[a]=function(){return this};var I=Object.getPrototypeOf,A=I&&I(I(P([])));A&&A!==r&&o.call(A,a)&&(d=A);var h=R.prototype=L.prototype=Object.create(d);S.prototype=h.constructor=R,R.constructor=S,R[u]=S.displayName="GeneratorFunction",E.isGeneratorFunction=function(t){var e="function"==typeof t&&t.constructor;return!!e&&(e===S||"GeneratorFunction"===(e.displayName||e.name))},E.mark=function(t){return Object.setPrototypeOf?Object.setPrototypeOf(t,R):(t.__proto__=R,u in t||(t[u]="GeneratorFunction")),t.prototype=Object.create(h),t},E.awrap=function(t){return{__await:t}},w(N.prototype),N.prototype[c]=function(){return this},E.AsyncIterator=N,E.async=function(t,e,n,r){var o=new N(p(t,e,n,r));return E.isGeneratorFunction(e)?o:o.next().then(function(t){return t.done?t.value:o.next()})},w(h),h[u]="Generator",h[a]=function(){return this},h.toString=function(){return"[object Generator]"},E.keys=function(t){var e=[];for(var n in t)e.push(n);return e.reverse(),function n(){for(;e.length;){var r=e.pop();if(r in t)return n.value=r,n.done=!1,n}return n.done=!0,n}},E.values=P,y.prototype={constructor:y,reset:function(t){if(this.prev=0,this.next=0,this.sent=this._sent=n,this.done=!1,this.delegate=null,this.method="next",this.arg=n,this.tryEntries.forEach(v),!t)for(var e in this)"t"===e.charAt(0)&&o.call(this,e)&&!isNaN(+e.slice(1))&&(this[e]=n)},stop:function(){this.done=!0;var t=this.tryEntries[0].completion;if("throw"===t.type)throw t.arg;return this.rval},dispatchException:function(t){if(this.done)throw t;var e=this;function r(r,o){return c.type="throw",c.arg=t,e.next=r,o&&(e.method="next",e.arg=n),!!o}for(var i=this.tryEntries.length-1;i>=0;--i){var a=this.tryEntries[i],c=a.completion;if("root"===a.tryLoc)return r("end");if(a.tryLoc<=this.prev){var u=o.call(a,"catchLoc"),s=o.call(a,"finallyLoc");if(u&&s){if(this.prev<a.catchLoc)return r(a.catchLoc,!0);if(this.prev<a.finallyLoc)return r(a.finallyLoc)}else if(u){if(this.prev<a.catchLoc)return r(a.catchLoc,!0)}else{if(!s)throw new Error("try statement without catch or finally");if(this.prev<a.finallyLoc)return r(a.finallyLoc)}}}},abrupt:function(t,e){for(var n=this.tryEntries.length-1;n>=0;--n){var r=this.tryEntries[n];if(r.tryLoc<=this.prev&&o.call(r,"finallyLoc")&&this.prev<r.finallyLoc){var i=r;break}}i&&("break"===t||"continue"===t)&&i.tryLoc<=e&&e<=i.finallyLoc&&(i=null);var a=i?i.completion:{};return a.type=t,a.arg=e,i?(this.method="next",this.next=i.finallyLoc,O):this.complete(a)},complete:function(t,e){if("throw"===t.type)throw t.arg;return"break"===t.type||"continue"===t.type?this.next=t.arg:"return"===t.type?(this.rval=this.arg=t.arg,this.method="return",this.next="end"):"normal"===t.type&&e&&(this.next=e),O},finish:function(t){for(var e=this.tryEntries.length-1;e>=0;--e){var n=this.tryEntries[e];if(n.finallyLoc===t)return this.complete(n.completion,n.afterLoc),v(n),O}},catch:function(t){for(var e=this.tryEntries.length-1;e>=0;--e){var n=this.tryEntries[e];if(n.tryLoc===t){var r=n.completion;if("throw"===r.type){var o=r.arg;v(n)}return o}}throw new Error("illegal catch attempt")},delegateYield:function(t,e,r){return this.delegate={iterator:P(t),resultName:e,nextLoc:r},"next"===this.method&&(this.arg=n),O}}}function p(t,e,n,r){var o=e&&e.prototype instanceof L?e:L,i=Object.create(o.prototype),a=new y(r||[]);return i._invoke=function(t,e,n){var r=_;return function(o,i){if(r===l)throw new Error("Generator is already running");if(r===f){if("throw"===o)throw i;return b()}for(n.method=o,n.arg=i;;){var a=n.delegate;if(a){var c=C(a,n);if(c){if(c===O)continue;return c}}if("next"===n.method)n.sent=n._sent=n.arg;else if("throw"===n.method){if(r===_)throw r=f,n.arg;n.dispatchException(n.arg)}else"return"===n.method&&n.abrupt("return",n.arg);r=l;var u=T(t,e,n);if("normal"===u.type){if(r=n.done?f:m,u.arg===O)continue;return{value:u.arg,done:n.done}}"throw"===u.type&&(r=f,n.method="throw",n.arg=u.arg)}}}(t,n,a),i}function T(t,e,n){try{return{type:"normal",arg:t.call(e,n)}}catch(t){return{type:"throw",arg:t}}}function L(){}function S(){}function R(){}function w(t){["next","throw","return"].forEach(function(e){t[e]=function(t){return this._invoke(e,t)}})}function N(t){var e;this._invoke=function(n,r){function i(){return new Promise(function(e,i){!function e(n,r,i,a){var c=T(t[n],t,r);if("throw"!==c.type){var u=c.arg,s=u.value;return s&&"object"==typeof s&&o.call(s,"__await")?Promise.resolve(s.__await).then(function(t){e("next",t,i,a)},function(t){e("throw",t,i,a)}):Promise.resolve(s).then(function(t){u.value=t,i(u)},function(t){return e("throw",t,i,a)})}a(c.arg)}(n,r,e,i)})}return e=e?e.then(i,i):i()}}function C(t,e){var r=t.iterator[e.method];if(r===n){if(e.delegate=null,"throw"===e.method){if(t.iterator.return&&(e.method="return",e.arg=n,C(t,e),"throw"===e.method))return O;e.method="throw",e.arg=new TypeError("The iterator does not provide a 'throw' method")}return O}var o=T(r,t.iterator,e.arg);if("throw"===o.type)return e.method="throw",e.arg=o.arg,e.delegate=null,O;var i=o.arg;return i?i.done?(e[t.resultName]=i.value,e.next=t.nextLoc,"return"!==e.method&&(e.method="next",e.arg=n),e.delegate=null,O):i:(e.method="throw",e.arg=new TypeError("iterator result is not an object"),e.delegate=null,O)}function g(t){var e={tryLoc:t[0]};1 in t&&(e.catchLoc=t[1]),2 in t&&(e.finallyLoc=t[2],e.afterLoc=t[3]),this.tryEntries.push(e)}function v(t){var e=t.completion||{};e.type="normal",delete e.arg,t.completion=e}function y(t){this.tryEntries=[{tryLoc:"root"}],t.forEach(g,this),this.reset(!0)}function P(t){if(t){var e=t[a];if(e)return e.call(t);if("function"==typeof t.next)return t;if(!isNaN(t.length)){var r=-1,i=function e(){for(;++r<t.length;)if(o.call(t,r))return e.value=t[r],e.done=!1,e;return e.value=n,e.done=!0,e};return i.next=i}}return{next:b}}function b(){return{value:n,done:!0}}}(function(){return this||"object"==typeof self&&self}()||Function("return this")())},4:function(t,e){t.exports=function(t,e,n){return e in t?Object.defineProperty(t,e,{value:n,enumerable:!0,configurable:!0,writable:!0}):t[e]=n,t}},5:function(t,e,n){t.exports=n(20)},57:function(t,e,n){"use strict";n.r(e);var r,o=n(5),i=n.n(o),a=n(8),c=n.n(a),u=n(0),s=n(18),E=null,_=!1,m=(new Date).getTime(),l="ltr"===chrome.i18n.getMessage("@@bidi_dir")?"LTR":"RTL",f=function(){var t=c()(i.a.mark(function t(e){return i.a.wrap(function(t){for(;;)switch(t.prev=t.next){case 0:return t.abrupt("return",new Promise(function(t){document.body.querySelectorAll("#".concat(u.e.OUTER_IFRAME_ID)).forEach(function(t){t.parentElement.removeChild(t)}),e.onload=c()(i.a.mark(function n(){return i.a.wrap(function(n){for(;;)switch(n.prev=n.next){case 0:return n.next=2,O(e);case 2:t();case 3:case"end":return n.stop()}},n,this)})),document.body.appendChild(e)}));case 1:case"end":return t.stop()}},t,this)}));return function(e){return t.apply(this,arguments)}}(),O=function(t){return new Promise(function(e){var n=Object(s.a)(),o=chrome.runtime.getURL("/panel/panel.html?domain=".concat(location.hostname,"&clickOnBrowserActionStartTime=").concat(r));if("firefox"===n)t.src=o,t.onload=e;else{var i=document.createElement("style");i.innerText="body{margin:0;padding:0;}iframe{width:100%;height:100%;border:none;overflow:hidden;}",t.contentDocument.head.appendChild(i);var a=document.createElement("iframe");a.id=u.e.INNER_IFRAME_ID,a.src=o,t.contentDocument.body.appendChild(a),a.onload=e}})},d=function(t,e){t.classList.remove("".concat(u.e.SLIDE_IN_CLASS,"-").concat(l)),t.classList.add("".concat(u.e.SLIDE_OUT_CLASS,"-").concat(l)),chrome.runtime.sendMessage({action:u.o.GA_EVENT,gaCategory:u.j.CATEGORIES.PANEL,gaAction:u.j.ACTIONS.HIDE_PANEL,gaLabel:e,gaCustomDimensions:{dimension3:location.hostname}})},I=function(){var t=document.getElementById(u.e.OUTER_IFRAME_ID);t.classList.contains("".concat(u.e.SLIDE_IN_CLASS,"-").concat(l))?d(t,u.e.SOURCES.SIMILARWEB_TOGGLE_PANEL):function(t,e){t.classList.remove("".concat(u.e.SLIDE_OUT_CLASS,"-").concat(l)),t.classList.add("".concat(u.e.SLIDE_IN_CLASS,"-").concat(l)),chrome.runtime.sendMessage({action:u.o.GA_EVENT,gaCategory:u.j.CATEGORIES.PANEL,gaAction:u.j.ACTIONS.SHOW_PANEL,gaLabel:e,gaCustomDimensions:{dimension3:location.hostname}})}(t,u.e.SOURCES.SIMILARWEB_TOGGLE_PANEL)},A=function(){var t=c()(i.a.mark(function t(){return i.a.wrap(function(t){for(;;)switch(t.prev=t.next){case 0:if(_){t.next=6;break}return _=!0,r=(new Date).getTime(),chrome.runtime.sendMessage({action:u.o.GA_EVENT,gaCategory:u.j.CATEGORIES.PANEL,gaAction:u.j.ACTIONS.TIME_TO_CLICK,gaValue:r-m,gaCustomDimensions:{dimension3:location.hostname}}),t.next=6,new Promise(function(){var t=c()(i.a.mark(function t(e){var n;return i.a.wrap(function(t){for(;;)switch(t.prev=t.next){case 0:(n=document.createElement("iframe")).id=u.e.OUTER_IFRAME_ID,n.className="SW-".concat(l),n.style.zIndex=u.e.MAX_Z_INDEX,E=setInterval(c()(i.a.mark(function t(){return i.a.wrap(function(t){for(;;)switch(t.prev=t.next){case 0:if(!document.body){t.next=5;break}return clearInterval(E),t.next=4,f(n);case 4:e();case 5:case"end":return t.stop()}},t,this)})),u.e.BODY_INTERVAL);case 5:case"end":return t.stop()}},t,this)}));return function(e){return t.apply(this,arguments)}}());case 6:I();case 7:case"end":return t.stop()}},t,this)}));return function(){return t.apply(this,arguments)}}();document.addEventListener(u.e.EVENTS.SIMILARWEB_TOGGLE_PANEL,A),document.addEventListener(u.e.EVENTS.CLEAR_HOST_KEY,function(){chrome.runtime.sendMessage({action:u.o.CLEAR_KEY,key:u.w.IS_PRO})}),document.addEventListener(u.e.EVENTS.OPEN_OPTIONS_PAGE,function(){chrome.runtime.sendMessage({action:u.o.OPEN_OPTIONS_PAGE})}),document.addEventListener("click",function(){var t=document.getElementById(u.e.OUTER_IFRAME_ID);t&&t.classList.contains("".concat(u.e.SLIDE_IN_CLASS,"-").concat(l))&&d(t,u.e.SOURCES.SIMILARWEB_CLICK_OUTSIDE)}),chrome.runtime.onMessage.addListener(function(t){switch(t.action){case u.o.TOGGLE_POPUP:A()}return!0})},8:function(t,e){function n(t,e,n,r,o,i,a){try{var c=t[i](a),u=c.value}catch(t){return void n(t)}c.done?e(u):Promise.resolve(u).then(r,o)}t.exports=function(t){return function(){var e=this,r=arguments;return new Promise(function(o,i){var a=t.apply(e,r);function c(t){n(a,o,i,c,u,"next",t)}function u(t){n(a,o,i,c,u,"throw",t)}c(void 0)})}}}});