import { BindingSignaler } from 'aurelia-templating-resources';
import { EventAggregator } from 'aurelia-event-aggregator';
import 'isomorphic-fetch';
import { HttpClient, json } from 'aurelia-fetch-client';
import {
    default as toastr
} from 'toastr';
import {
    default as wurl
} from 'wurl';
import utils from 'common/common-utils';
import 'common/common-plugin'
import 'common/common-constant';
import {
    default as marked
} from 'marked'; // https://github.com/chjj/marked
import {
    default as hljs
} from 'highlight';
import {
    default as autosize
} from 'autosize';
import {
    default as NProgress
}
from 'nprogress';

export class Config {

    initHttp() {
        window.json = (param) => {
            console.log(JSON.stringify(param));
            return json(param);
        };
        window.http = this.aurelia.container.root.get(HttpClient);
        http.configure(config => {
            config
            // .withBaseUrl(nsParam.baseUrl)
                .withDefaults({
                    credentials: 'same-origin',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                        'X-Requested-With': 'fetch'
                    }
                })
                .withInterceptor({
                    request(req) {
                        NProgress && NProgress.start();
                        return req;
                    },
                    requestError(req) {
                        console.log(req);
                    },
                    response(resp) {
                        NProgress && NProgress.done();
                        if (!resp.ok) {
                            resp.json().then((data) => {
                                // toastr.error('PATH: ' + data.path + '<br/>STATUS: ' + data.status + '<br/>EXCEPTION:<br/>' + data.exception + '<br/>MESSAGE:<br/>' + data.message, data.error);
                                toastr.error(data.message);
                            });

                            if (resp.status == 401) {
                                toastr.error('用户未登录!');
                                utils.redirect2Login();
                                return;
                            }
                        }

                        return resp;
                    },
                    responseError(resp) {
                        toastr.error(resp.message, '网络请求错误!');
                        console.log(resp);
                    }
                });
        });

        return this;
    }

    initToastr() {

        // toastr弹出消息提示插件全局配置设置
        toastr.options.positionClass = 'toast-bottom-center';
        toastr.options.preventDuplicates = true;

        return this;
    }

    initMarked() {

        marked.setOptions({
            breaks: true,
            highlight: function(code) {
                return hljs.highlightAuto(code).value;
            }
        });

        return this;
    }

    initAjax() {
        // ajax全局配置选项设置
        $.ajaxSetup({
            // ajax请求不缓存
            cache: false,
        });

        $(document).ajaxSend(function(event, jqxhr, settings) {

            if (settings.url.lastIndexOf('/chat/direct/latest') == -1) {
                NProgress && NProgress.start();
            }
        });

        // $(document).on('ajaxStart', function() {
        //     NProgress && NProgress.start();
        // });
        $(document).on('ajaxStop', function() {
            NProgress && NProgress.done();
        });
        // $(document).ajaxComplete(function(event, request, settings) {
        //     console.log(request);
        // });
        $(document).ajaxError(function(event, xhr, settings) {
            if (xhr && xhr.status == 401) {
                utils.redirect2Login();
            }
        });

        return this;
    }

    initGlobalVar() {
        window.toastr = toastr;
        window.wurl = wurl;
        window.utils = utils;
        window.marked = marked;
        window.autosize = autosize;
        window.bs = this.aurelia.container.root.get(BindingSignaler);
        window.ea = this.aurelia.container.root.get(EventAggregator);
        return this;
    }

    initAnimateCss() {
        $.fn.extend({
            animateCss: function(animationName) {
                var animationEnd = 'webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend';
                this.addClass('animated ' + animationName).one(animationEnd, function() {
                    $(this).removeClass('animated ' + animationName);
                });
            }
        });
        return this;
    }

    context(aurelia) {
        this.aurelia = aurelia;
        return this;
    }

}

export default new Config();
