(function () {
    var $, element, laytpl, form = null; //jquery对象
    layui.use(['jquery', 'element', 'laytpl', 'form'], function () {
        $ = layui.$;
        element = layui.element;
        laytpl = layui.laytpl;
        form = layui.form;
        var data = {
            title: '支付组',
            online: 4,
            total: 5,
            group: [
                '售前一组',
                '售前二组',
                '售前三组',
                '售前四组',
                '售前五组',
            ]
        };
        //左侧导航功能
        //var treeNav = new TreeNav();
        ztreeNav();

        renderContentTabView(laytpl, form, data);
    });

    /**
     * @description 渲染内容区表格
     * @param {Object} laytpl 模板对象 (必传)
     * @param {Object} data 数据集 (必传)
     */
    function renderContentTabView(laytpl, form, data) {
        if (!laytpl && !data) {
            return false;
        }
        var getTpl = serviceContentTpl.innerHTML,
            view = document.getElementById('serviceContentHook');
        laytpl(getTpl).render(data, function (html) {
            view.innerHTML = html;
            form.render();
        })
    }


    function TreeNav(setting) {
        this.setting = setting;
        this.init();
    }

    TreeNav.prototype = {
        constructor: TreeNav,
        init: function () {
            this.events = { //设置自定义事件默认参数
                'onRename': [],
                'onRemove': []
            };
            this._getAjax();
        },

        _getAjax: function () {
            var _this = this;

            $.ajax({
                url: 'http://127.0.0.1:8080/data/manageFirst.json',
                method: 'GET',
                dataType: 'json',
                success: function (data) {
                    // console.log(data)
                    // _this.emit('onRename', 333333);
                    _this.setting.async.dataFilter(data);
                },
                error: function () {
                    console.log('接口错误')
                }
            });
        },

        /**
         * @description 处理ajax参数
         */
        _dealAjaxPara: function () {

        },

        on: function (evname, callback) {
            if (this.events[evname] && this.events[evname] instanceof Array) {
                this.events[evname].push(callback);
            }
        },
        emit: function (evname, ev) {
            console.log(this.events[evname])
            for (var i = 0; i < this.events[evname].length; i++) {
                var fn = this.events[evname][i];
                fn.call(this, ev);
            }
        }


    }


    function ztreeNav() {
        var setting = {
            async: {
                enable: true,
                url: "http://127.0.0.1:8080/data/manageFirst.json",
                autoParam: ["id", "name", "level", "parentId"],
                otherParam: {
                    "otherParam": "zTreeAsyncTest"
                },
                type: 'get',
                dataFilter: ajaxCallback
            },
            callback: {
                /*  beforeRemove: beforeRemove,
                 beforeRename: beforeRename */
            }
        };

        function ajaxCallback(data) {
            console.log(data);
        }

        var treeNav = new TreeNav(setting);
        /* treeNav.on('onRename', function (data) {
            // console.log(data, 8888)
        }); */
    }

})();