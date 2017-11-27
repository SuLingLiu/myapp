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
        dealMainContentFn.init();



        // renderContentTabView(laytpl, form, data);

        /*        $(".main-title-wrapper .title").on("click", function() {
                    console.log(888)
                    $(this).trigger("clickMe");
                })
                $(".service-manage-container").on("clickMe", function() {
                    console.log(111111);
                })*/

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
        this.curNavElem;
        this.init();
        this.fnEvents();
    }

    TreeNav.prototype = {
        constructor: TreeNav,
        init: function () {
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
                url: util.domain + '/api/num' + '?' + (+new Date()),
                method: 'GET',
                dataType: 'json',
                data: param || '',
                success: function (data) {
                    var content;

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

                util.getAjax({
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
                    util.msg('组名不能为空');
                } else {

                    if (name.length > maxLen) {
                        util.msg('组名不能超过10个字符');
                    } else if (re.test(name)) {
                        util.msg('组名只能是数字字母和汉字');
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
            util.getAjax({
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


    var dealMainContentFn = {
        init: function () {
            this._events();
        },

        _events: function () {
            this._multSelEventFn();
            this._allSelEventFn();
            this._editMemberEventFn();
            this._addMemberEventFn();
            this._dealStatusEventFn();
            this._dealForbiddenEventFn();
            this._dealDelEventFn();
        },
        /**
         * @description 包含多选事件
         */
        _multSelEventFn: function () {
            var _this = this;
            $('#serviceContentTabHook').on('click', 'input.mult-select-hook', function (ev) {

                _this._dealSelBtnStyle($(this));
                _this._dealTrBg($(this));
                $('#serviceContentTabHook input.select-all-hook').prop('checked', _this._isCheckAll());
                _this._dealSelBtnStyle($('#serviceContentTabHook input.select-all-hook'));
            })

        },
        /**
         * @description 包含全选事件
         */
        _allSelEventFn: function () {
            var _this = this;
            $('#serviceContentTabHook').on('click', 'input.select-all-hook', function (ev) {
                _this._dealSelBtnStyle($(this));
                _this._dealMultCheck($(this).prop('checked'));
            })
        },
        /**
         * @description 包含右侧编辑事件
         */
        _editMemberEventFn: function () {
            var _this = this;
            $('#serviceContentTabHook').on('click', '.edit-hook', function (ev) {
                $tr = $(this).parents('tr');
                _this._dealMemberPopup($tr, {});

            })
        },
        /**
         * @description 包含新增成员事件
         */
        _addMemberEventFn: function () {
            var _this = this;
            $('#serviceContentHook').on('click', '.addGroup', function (ev) {
                $tr = $(this).parents('tr');
                _this._dealMemberPopup();
            })
        },
        /**
         * @description 处理包含在线或离线事件
         */
        _dealStatusEventFn: function () {
            var _this = this;
            $('#serviceContentTabHook').on('click', '.status-hook', function (ev) {
                if ($(this).hasClass('online')) {
                    $(this).removeClass('online').addClass('offline');
                } else {
                    $(this).removeClass('offline').addClass('online');
                }

                //请求ajax
                // util.getAjax();

            })
        },
        /**
         * @description 包含禁用事件函数
         */
        _dealForbiddenEventFn: function () {
            var _this = this;
            $('#serviceContentTabHook').on('click', '.forbidden-hook', function (ev) {
                /* if ($(this).hasClass('online')) {
                    $(this).removeClass('online').addClass('offline');
                } else {
                    $(this).removeClass('offline').addClass('online');
                } */

                //请求ajax
                // util.getAjax();

            })
        },
        /**
         * @description 包含删除事件函数
         */
        _dealDelEventFn: function () {
            var _this = this;
            $('#serviceContentTabHook').on('click', '.del-hook', function (ev) {
                $(this).parents('tr').remove();
                //需要重新计算人数
                //请求ajax
                // util.getAjax();

            })
        },
        /**
         * @description 全选带动多选，处理多选是否全部选中或全部不选择
         * @param {Boolean} 选中传true，否则传false(必传)
         */
        _dealMultCheck: function (check) {
            var _this = this;
            $('#serviceContentTabHook input.mult-select-hook').prop('checked', check).each(function () {
                _this._dealSelBtnStyle($(this));
                _this._dealTrBg($(this));
            });
        },

        /**
         * @description 选择按钮样式操作
         * @param {Object} elem 选择的元素(必传)
         */
        _dealSelBtnStyle: function (elem) {
            var checkVal = elem.prop('checked');
            var $iconElem = elem.next('.icon');
            if (checkVal) {
                $iconElem.removeClass('unChecked20').addClass('checked20');
            } else {
                $iconElem.removeClass('checked20').addClass('unChecked20');
            }
        },
        /**
         * @description 多选带动全选，返回全选是否选中
         * @return {Boolean} 选中返回true，否则返回false(必传)
         */
        _isCheckAll: function () {
            var $multElem = $('#serviceContentTabHook input.mult-select-hook');
            for (var i = 0; i < $multElem.length; i++) {
                if (!$multElem.eq(i).prop('checked')) {
                    return false;
                }
            }
            return true;
        },
        /**
         * @description 处理多选按钮背景色
         * @param {Object} elem 选择的元素(必传)
         */
        _dealTrBg: function (elem) {
            var checkedVal = elem.prop('checked');
            $tr = elem.parents('tr');
            if (checkedVal) {
                $tr.addClass('bg');
            } else {
                $tr.removeClass('bg');
            }
        },
        /**
         * @description 处理成员弹窗
         * @param {Object} elem 编辑的时候需要传，新增的时候不需要传
         * @param {Object} data 编辑需要传的数据，新增的时候可以不用传
         */
        _dealMemberPopup: function (elem, data) {
            var _this = this;
            data = data || {};
            var getConTpl = popupTpl.innerHTML;

            laytpl(getConTpl).render(data, function (html) {
                layer.open({
                    type: 1,
                    skin: 'member-popup-wrapper',
                    title: '编辑',
                    content: html,
                    closeBtn: 1,
                    resize: false,
                    scrollbar: false,
                    success: function () {
                        form.render(null, 'popupFilter');

                        form.verify({
                            account: function (value) {
                                return util.verifyName($.trim(value), '登陆账号');
                            },
                            password: [
                                /^[a-zA-Z0-9]{1}$/, '密码必须是6位数字或字母或组合'
                            ],
                            name: function (value) {
                                return util.verifyName($.trim(value), '姓名');
                            },
                            nickname: function (value) {
                                return util.verifyName($.trim(value), '昵称');
                            }
                        });
                        form.on('submit(submitBtn)', function (data) {
                            console.log(data.field)
                            layer.closeAll();

                            //处理编辑或新增成员
                            return false;
                        });

                        $('.member-popup-wrapper .cancelBtn').on('click', function (ev) {
                            layer.closeAll();
                            ev.preventDefault();
                            ev.stopPropagation();
                        })


                    }
                });
            })
        }




    }

    var util = {
        domain: 'http://127.0.0.1:3000',
        /**
         * @description 信息提示
         * @param {String} str 提示语 (必传)
         */
        msg: function (str) {
            layer.msg(str, {
                time: 2000
            });
        },
        /**
         * @description 名称校验
         * @param {String} name 名称
         */
        verifyName: function (val, name) {
            name = neme || '';
            var re = /[^a-zA-Z0-9\u4e00-\u9fa5]/g;
            if (re.test(val)) {
                return name + '输入的字符有误';
                return false;
            } else if (val.length < 4) {
                return name + '不能少于4个字符';
            } else if (val.length > 20) {
                return name + '不能大于20个字符';
            }
            return '';
        },
        /**
         * @description 获取导航和右侧表格内容数据
         * @param {Object} opt 参数集 
         */
        getAjax: function (opt) {
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
        }
    }

})();