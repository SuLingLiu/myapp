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

        /* $(".main-title-wrapper .title").on("click", function () {
            $(this).trigger("clickMe");
            console.log(111111);
        })
        $(".main-title-wrapper .title").on("click", function () {
            $(this).trigger("clickMe1");
            console.log(111111);
        })
       */
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
        this.domain = 'http://127.0.0.1:3000';
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

        /**
         * @description 获取导航和右侧表格内容数据
         * @param {Bolean} root 是否是根目录 (必传)
         * @param {Object} param 参数集 (选传)
         */
        _getNavAjax: function (root, param) {
            var _this = this;

            $.ajax({
                url: _this.domain + '/api/num' + '?' + (+new Date()),
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
         * @description 获取导航和右侧表格内容数据
         * @param {Object} opt 参数集 
         */
        _getAjax: function (opt) {
            var _this = this;

            $.ajax({
                url: _this.domain + opt.url + '?' + (+new Date()),
                method: opt.method || 'GET',
                dataType: 'json',
                data: opt.param || '',
                success: function (data) {

                    if (data.success) {
                        opt.callback(data);
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
            if (data.root) {
                renderNavData.content = data.content;
            } else {
                renderNavData.content = data.content.sub_org;
                renderRightContentData.content = data.content.users
            }
            // console.log(data)
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
                this.setting.callback.renderMianContent(data);
            }

        },
        /**
         * @description 事件集合
         */
        fnEvents: function () {
            this.navItemEvent();
            this.addSubGroupEvent();
            this.renameGroupEvent();
            this.renameGroupInputEvent();

        },
        /**
         * @description 左侧导航点击列表事件
         */
        navItemEvent: function () {
            var _this = this;
            $(_this.elem).on('click', '.title', function (ev, isAdd) {
                console.log('nav')
                //如果是根目录点击展开或收起下级目录
                if ($(this).parent('li').hasClass('nav-item-root')) {
                    if ($(this).hasClass('expanded')) {
                        if (!isAdd) {
                            $(this).removeClass('expanded');
                        }

                    } else {
                        $(this).addClass('expanded');
                    }
                }
                //增加当前点击状态
                $(_this.elem).find('.title').removeClass('cur-select');
                $(this).addClass('cur-select');

                //如果点击来回点击的是同一目录则不再请求ajax
                if (_this.curNavElem && _this.curNavElem[0] === $(this)[0]) {
                    return false;
                }
                _this.curNavElem = $(this);
                var param = _this._getNavPara($(this));

                _this._getNavAjax(false, param);

            })
        },
        /**
         * @description 增加子分组
         */
        addSubGroupEvent: function () {
            var _this = this;
            $(_this.elem).on('click', '.title .add', function (ev) {
                var $parentTitleElem = $(this).parents('.title');
                $parentTitleElem.trigger('click', true);

                //此处请求ajax 
                var param = _this._getNavPara($parentTitleElem);

                _this._getAjax({
                    url: '/api/add',
                    param: param,
                    callback: function (data) {
                        if (data.content) {
                            var getTpl = renderNavTpl.innerHTML;
                            laytpl(getTpl).render({
                                root: false,
                                content: [data.content]
                            }, function (html) {
                                if ($parentTitleElem.next('.nav-child').length > 0) {
                                    $parentTitleElem.next('.nav-child').append(html);
                                } else {
                                    $parentTitleElem.parent().append('<ul class="nav-child">' + html + '</ul>');
                                }
                                _this.getGroupList();
                            });
                        }
                    }
                });

                ev.preventDefault();
                ev.stopPropagation();

            })
        },
        /**
         * @description 重命名分组
         */
        renameGroupEvent: function () {
            var _this = this;
            $(_this.elem).on('click', '.title .rename', function (ev) {
                var $parentTitleElem = $(this).parents('.title');
                var $input = $parentTitleElem.find('.rename-box input');
                $parentTitleElem.find('.deal-wrapper').hide();
                $parentTitleElem.find('.rename-box').show();
                var name = $input.val();
                $input.val('').focus().val(name); //自动获取焦点并把焦点移动到最后
                ev.preventDefault();
                ev.stopPropagation();
            })
        },
        /**
         * @description 重命名分组下的input事件
         */
        renameGroupInputEvent: function () {
            var _this = this;
            $(_this.elem).on('click focus', '.title input', function (ev) {
                ev.preventDefault();
                ev.stopPropagation();
            })
            $(_this.elem).on('blur', '.title input', function (ev) {

                var name = $.trim($(this).val());
                var $parent = $(this).parent();
                var maxLen = 10;
                var groupId = $(this).attr('idmark');
                var $contentGroupElem = $('#serviceContentHook .group-title-hook');
                var contentGroupId = $contentGroupElem.attr('idmark');
                var $contentNameElem = $contentGroupElem.find('.name');
                var re = /[^a-zA-Z0-9\u4e00-\u9fa5]/g;
                $parent.hide().prev('.deal-wrapper').show();
                if (!name) {
                    _this._msg('组名不能为空');
                } else {

                    if (name.length > maxLen) {
                        _this._msg('组名不能超过10个字符');
                    } else if (re.test(name)) {
                        _this._msg('组名只能是数字字母和汉字');
                    } else {
                        //ajax校验是否重名
                        //如果成功
                        //更换左侧和右侧的名称
                        $parent.prev('.deal-wrapper').find('.name-hook').text(name);
                        if ($contentNameElem.length > 0 && contentGroupId === groupId) {
                            $contentNameElem.text(name);
                        }
                        //请求ajax重新加载移动分组数据
                    }
                }

                ev.preventDefault();
                ev.stopPropagation();
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
        },
        /**
         * @description 获取右侧移动分组的下拉列表数据以及渲染
         */
        getGroupList: function () {

        },

        /**
         * @description 获取当前选择的组
         * @return {Object} 返回当前选择的组
         */
        getSelectedNode: function () {
            return this.curNavElem;
        },
        /**
         * @description 增加根分组
         */
        addRootGroup: function () {
            var _this = this;
            _this._getAjax({
                url: '/api/add',
                callback: function (data) {
                    if (data.content) {
                        var getTpl = renderNavTpl.innerHTML;
                        laytpl(getTpl).render({
                            root: true,
                            content: [data.content]
                        }, function (html) {
                            _this.elem.append(html);
                            _this.getGroupList();
                        });
                    }
                }
            });
        },

        /**
         * @description 获取导航请求的参数
         * @param {Object} elem 对应标题元素 (必传)
         * @return {Object} 请求ajax参数
         */
        _getNavPara: function (elem) {
            var param = {
                name: elem.attr('name') || '',
                id: elem.attr('idmark') || '',
                parentId: elem.attr('parentId') || '',
                level: elem.attr('level') || '',
            }
            return param;
        },
        /**
         * @description 信息提示
         * @param {String} str 提示语 (必传)
         */
        _msg: function (str) {
            layer.msg(str, {
                time: 2000
            });
        }
    }


    function ztreeNav() {
        var setting = {
            selector: '#leftsideTreeNav',
            callback: {
                renderMianContent: renderMianContent,
                renderMoveGroup: renderMoveGroup
            }
        };

        var treeNav = new TreeNav(setting);
        /* treeNav.on('onRename', function () {
            console.log('重命名！！！')
        });
  */


        $('.root-add-hook').on('click', function () {
            treeNav.addRootGroup();
        })
        $('.group-del-hook').on('click', function () {
            alert('删除');
            return false;
            //ajax判断下面是否有人，如果有是不能删除的
            treeNav.getSelectedNode().parent().remove();
            _this.getGroupList();
        })
    }

    /**
     * @description 渲染内容区表格和标题
     * @param {Object} data 数据集 (必传)
     */
    function renderMianContent(data) {
        var content = data.content;
        //标题渲染
        $('.group-title-hook').html('<i class="name">' + content.name + '</i><span>(' + content.total + ')</span>').attr('idmark', content.id);
        //渲染表格
        var getConTpl = serviceContentTabTpl.innerHTML;
        laytpl(getConTpl).render(data.content, function (html) {
            $('#serviceContentTabHook').html(html)
            // form.render();
        })

    }

    /**
     * @description 渲染移动分组下拉列表
     * @param {Object} data 数据集 (必传)
     */
    function renderMoveGroup(data) {}

})();