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

        // renderContentTabView(laytpl, form, data);
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
        this.elem = $(this.setting.selector);
        this.navAsynUrl = 'http://127.0.0.1:3000/api/num';
        this.curNavElem;
        this.init();
        this.fnEvents();
    }

    TreeNav.prototype = {
        constructor: TreeNav,
        init: function () {
            this.events = { //设置自定义事件默认参数
                'onRename': [],
                'onRemove': []
            };
            this._getNavAjax(true);
        },

        _getNavAjax: function (root, param) {
            var _this = this;

            $.ajax({
                url: _this.navAsynUrl + '?' + (+new Date()),
                method: 'GET',
                dataType: 'json',
                data: param || '',
                success: function (data) {
                    var content;
                    // _this.emit('onRename', 333333);
                    // _this.setting.async.dataFilter(data);

                    if (data.success) {
                        content = data.content;
                        if (content) {
                            data.root = root;
                            _this._renderNav(data);
                        }
                    }
                },
                error: function () {
                    console.log('接口错误')
                }
            });
        },

        /**
         * @description 渲染左侧导航
         */
        _renderNav: function (data) {
            var _this = this;
            var renderNavData = {},
                renderRightContentData = {};
            renderNavData.root = data.root;
            renderNavData.rootClass = !!data.root ? 'nav-item-root' : 'nav-item-sub';
            if (data.root) {
                renderNavData.content = data.content;
            } else {
                renderNavData.content = data.content.sub_org;
                renderRightContentData.content = data.content.users
            }
            console.log(data)
            //渲染左侧导航
            if (renderNavData.content && renderNavData.content.length) {
                var getTpl = renderNavTpl.innerHTML;
                laytpl(getTpl).render(renderNavData, function (html) {
                    if (data.root) {
                        _this.elem.html(html);
                        _this.elem.find('.title').eq(0).trigger('click');
                    } else {
                        _this.curNavElem.parent().append('<ul class="nav-child">' + html + '</ul>');
                    }
                });
            }
            //渲染右侧内容区域
            if (!data.root) {
                this.setting.callback.dealNavAsyn(data);
            }

        },
        fnEvents: function () {
            var _this = this;
            $(_this.elem).on('click', '.title', function () {

                if ($(this).parent('li').hasClass('nav-item-root')) {
                    if ($(this).hasClass('expanded')) {
                        $(this).removeClass('expanded');
                    } else {
                        $(this).addClass('expanded');
                    }
                } else {
                    $(_this.elem).find('.title').removeClass('cur-select');
                    $(this).addClass('cur-select');
                }
                if (_this.curNavElem && _this.curNavElem[0] === $(this)[0]) {
                    return false;
                }
                _this.curNavElem = $(this);
                var param = {
                    name: $(this).attr('name') || '',
                    id: $(this).attr('id') || '',
                    parentId: $(this).attr('parentId') || '',
                    level: $(this).attr('level') || '',
                }

                _this._getNavAjax(false, param);

            })
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
            selector: '#leftsideTreeNav',
            callback: {
                dealNavAsyn: dealNavAsyn
            }
        };

        var treeNav = new TreeNav(setting);
        /* treeNav.on('onRename', function (data) {
            // console.log(data, 8888)
        }); */
    }

    function dealNavAsyn(data) {
        var content = data.content;
        //标题渲染
        $('.group-title-hook').html(content.name + '<span>(' + content.total + ')</span>')
        //渲染表格
        var getConTpl = serviceContentTabTpl.innerHTML;
        laytpl(getConTpl).render(data.content, function (html) {
            $('#serviceContentTabHook').html(html)
            // form.render();
        })


    }

})();