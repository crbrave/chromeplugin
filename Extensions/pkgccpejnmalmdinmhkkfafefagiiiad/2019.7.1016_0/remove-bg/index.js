let TRstaticjsmsg_type=function(e){return"object"==typeof e&&(e.exports={STABLE_EXTENSION_ID:"pkgccpejnmalmdinmhkkfafefagiiiad",DOWNLOAD_FROM_GITHUB:"https://github.com/zxlie/FeHelper/tree/master/apps/static/screenshot/crx",CODE_STANDARDS:"code_standards",FCP_HELPER_INIT:"fcp_helper_init",FCP_HELPER_DETECT:"fcp_helper_detect",GET_CSS:"get-css",GET_JS:"get-js",GET_HTML:"get-html",GET_COOKIE:"get-cookie",REMOVE_COOKIE:"remove-cookie",SET_COOKIE:"set-cookie",CSS_READY:"css-ready",JS_READY:"js-ready",HTML_READY:"html-ready",ALL_READY:"all-ready",GET_OPTIONS:"get_options",SET_OPTIONS:"set_options",MENU_SAVED:"menu_saved",START_OPTION:"start-option",OPT_START_FCP:"opt-item-fcp",CALC_PAGE_LOAD_TIME:"calc-page-load-time",GET_PAGE_WPO_INFO:"get_page_wpo_info",SHOW_PAGE_LOAD_TIME:"wpo",TAB_CREATED_OR_UPDATED:"tab_created_or_updated",REGEXP_TOOL:"regexp",EN_DECODE:"en-decode",JSON_FORMAT:"json-format",QR_CODE:"qr-code",CODE_BEAUTIFY:"code-beautify",JS_CSS_PAGE_BEAUTIFY:"JS_CSS_PAGE_BEAUTIFY",JS_CSS_PAGE_BEAUTIFY_REQUEST:"JS_CSS_PAGE_BEAUTIFY_REQUEST",CODE_COMPRESS:"code-compress",TIME_STAMP:"timestamp",IMAGE_BASE64:"image-base64",RANDOM_PASSWORD:"password",QR_DECODE:"qr-decode",JSON_COMPARE:"json-diff",JSON_PAGE_FORMAT:"JSON_PAGE_FORMAT",JSON_PAGE_FORMAT_REQUEST:"JSON_PAGE_FORMAT_REQUEST",COLOR_PICKER:"color-picker:newImage",SHOW_COLOR_PICKER:"show_color_picker",AJAX_DEBUGGER:"ajax-debugger",AJAX_DEBUGGER_CONSOLE:"ajax-debugger-console",AJAX_DEBUGGER_SWITCH:"ajax-debugger-switch",HTML_TO_MARKDOWN:"html2markdown",PAGE_CAPTURE:"page-capture",PAGE_CAPTURE_SCROLL:"page_capture_scroll",PAGE_CAPTURE_CAPTURE:"page_capture_capture",STICKY_NOTES:"sticky-notes",DEV_TOOLS:"dev-tools",OPEN_OPTIONS_PAGE:"open-options-page",GRID_RULER:"grid-ruler",MULTI_TOOLKIT:"toolkit",PAGE_MODIFIER:"page-modifier",GET_PAGE_MODIFIER_CONFIG:"get_page_modifier_config",SAVE_PAGE_MODIFIER_CONFIG:"save_page_modifier_config",PAGE_MODIFIER_KEY:"PAGE-MODIFIER-LOCAL-STORAGE-KEY",REMOVE_PERSON_IMG_BG:"remove-person-img-bg",REMOVE_BG:"remove-bg"}),e.exports}({exports:{}});new Vue({el:"#pageContainer",data:{iframeHtml:'<iframe src="https://www.remove.bg/" frameborder="0" width="100%" height="100%"></iframe>',enter:!1},methods:{permission:function(e){chrome.permissions.request({permissions:["webRequest","webRequestBlocking"]},_=>{_?e&&e():alert("必须接受授权，才能正常使用！")})},loadTools:function(){this.enter||this.permission(()=>{let e=TRstaticjsmsg_type;chrome.runtime.sendMessage({type:e.REMOVE_PERSON_IMG_BG},()=>{this.enter=!0,this.$refs.btnEnter.innerHTML="正在进入，请稍后......",this.$refs.boxIframe.innerHTML=this.iframeHtml;let e=1,_=window.setInterval(()=>{(e-=.02)<=0?(window.clearInterval(_),this.$refs.overlay.remove()):this.$refs.overlay.style.opacity=e},30)})})}}});