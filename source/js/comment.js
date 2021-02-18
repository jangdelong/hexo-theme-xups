if (!window['String']['prototype']['trim']) {
  window['String']['prototype']['trim'] = function () {
    return this.replace(/^\s+|\s+$/g, '');
  };
}

;(function (root, factory) {
  if (typeof define === 'function' && define.amd) { // amd
    define(factory);
  } else if (typeof exports === 'object') { // cmd
    module.exports = factory();
  } else {
    root.JELON = factory();
  }
}(this, function () {
  var JL = window.JELON || {};

  var constants = {
    ACCESS_TOKEN_KEY: 'xups-github-comments-token', // access_token key
    USER_INFO_KEY: 'xups-github-user-info',         // 登录用户信息 key
    PER_PAGE: 5,                                    // 每页的评论数
    API_HOST: 'https://api.github.com',
    MARKDOWN_DOC: 'https://guides.github.com/features/mastering-markdown/',
  };
  var queryUrl = function (key, url, uncode) {
    url = url || location.href;
    var reg = new RegExp('(\\?|&|#|&amp;)' + key + '=([^?&#]*)');
    var result = url.match(reg);
    if (uncode) {
      return result ? result[2] : '';
    }
    return result ? decodeURIComponent(result[2]) : '';
  };
  var $ = JL.$ || function(str) {
    return /^(\[object HTML)[a-zA-Z]*(Element\])$/.test(Object.prototype.toString.call(str)) ? str : document.getElementById(str);
  };
  var addClass = function (elem, className) {
    if (!elem) return;
    var classNames;
    var setClass;
    var i, l, cl;
    if (elem instanceof Array) {
      for (i = 0, l = elem.length; i < l; i++) {
        elem[i] = arguments.callee.call(this, elem[i], className);
      }
    } else if (typeof elem.item === 'function') {
      var result = [];
      for (i = 0, l = elem.length; i < l; i++) {
        result.push(arguments.callee.call(this, elem.item(i), className));
      }
      elem = result;
    } else {
      elem = $(elem);
      if (!elem) return;
      if (className && typeof className === 'string') {
        classNames = className.split(/\s+/);
        if (elem.nodeType === 1) {
          if (!elem.className && classNames.length === 1) {
            elem.className = className;
          } else {
            setClass = ' ' + elem.className + ' ';
            for (i = 0, cl = classNames.length; i < cl; i++) {
              if (setClass.indexOf(' ' + classNames[i] + ' ') < 0) {
                setClass += classNames[i] + ' ';
              }
            }
            elem.className = setClass.trim();
          }
        }
      }
    }
    return elem;
  };
  var removeClass = function (elem, className) {
    if (!elem) return;
    var classNames, i, l, c, cl;
    if (elem instanceof Array) {
      for (i = 0, l = elem.length; i < l; i++) {
        elem[i] = arguments.callee.call(this, elem[i], className);
      }
    } else if (typeof elem.item === 'function') {
      var result = [];
      for (i = 0, l = elem.length; i < l; i++) {
        result.push(arguments.callee.call(this, elem.item(i), className));
      }
      elem = result;
    } else {
      elem = $(elem);
      if (!elem) return;
      if ((className && typeof className === 'string') || className === undefined) {
        classNames = (className || '').split(/\s+/);
        if (elem.nodeType === 1 && elem.className) {
          if (className) {
            className = (' ' + elem.className + ' ').replace(/[\n\t\r]/g, ' ');
            for (c = 0, cl = classNames.length; c < cl; c++) {
              className = className.replace(' ' + classNames[c] + ' ', ' ');
            }
            elem.className = className.trim();
          } else {
            elem.className = '';
          }
        }
      }
    }
    return elem;
  };
  /**
   * 格式化日期文本，如 yyyy-MM-dd hh:mm:ss
   */
  var formatDate = function (format, date) {
    if (!date) return '';
    if (typeof date == 'number') date = new Date(date * 1000);
    var o = {
      'M+': date.getMonth() + 1,
      'd+': date.getDate(),
      'h+': date.getHours(),
      'm+': date.getMinutes(),
      's+': date.getSeconds(),
      'q+': Math.floor((date.getMonth() + 3) / 3),
      'S': date.getMilliseconds(),
      'w': '日一二三四五六'.charAt(date.getDay())
    };
    format = format.replace(/y{4}/, date.getFullYear()).replace(/y{2}/, date.getFullYear().toString().substring(2));
    for (var k in o) {
      var reg = new RegExp(k);
      format = format.replace(reg, match);
    }
    function match(m) {
      return m.length == 1 ? o[k] : ('00' + o[k]).substr(('' + o[k]).length);
    }
    return format;
  };

  /**
   * 封装ajax函数
   * @param {String}   opt.method        连接的方式，包括POST和GET两种方式
   * @param {String}   opt.url           发送请求的url
   * @param {Boolean}  opt.async         是否为异步请求，true为异步的，false为同步的
   * @param {Object}   opt.data          发送的参数，格式为对象类型
   * @param {Function} opt.success       发送并接收成功调用的回调函数
   * @param {Function} opt.fail          失败回调
   */
  var ajax = function (opt) {
    opt = opt || {};
    opt.method = opt.method.toUpperCase() || 'POST';
    opt.url = opt.url || '';
    opt.async = opt.async || true;
    opt.data = opt.data || null;
    opt.headers = opt.headers || {};
    opt.success = opt.success || function () {};
    var xhr = null;
    if (window.XMLHttpRequest) {
      xhr = new XMLHttpRequest();
    } else {
      xhr = new ActiveXObject('Microsoft.XMLHTTP');
    }
    var params = [];
    var token = window.localStorage.getItem(constants.ACCESS_TOKEN_KEY);
    for (var key in opt.data) {
      params.push(key + '=' + opt.data[key]);
    }
    var postData = params.join('&');
    function setRequestHeader() {
      for (var h in opt.headers) {
        xhr.setRequestHeader(h, opt.headers[h]);
      }
    }
    if (opt.method.toUpperCase() === 'POST') {
      xhr.open(opt.method, opt.url, opt.async);
      setRequestHeader();
      if (window.JSON) {
        postData = JSON.stringify(opt.data);
        xhr.setRequestHeader('Content-Type', 'application/json;charset=utf-8');
      } else {
        xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded;charset=utf-8');
      }
      if (opt.headers && opt.headers['Accept']) {
        xhr.setRequestHeader('Accept', opt.headers['Accept']);
      } else {
        xhr.setRequestHeader('Accept', 'application/vnd.github.squirrel-girl-preview, application/vnd.github.html+json');
      }
      // 登录校验
      if (token) {
        xhr.setRequestHeader('Authorization', 'token ' + token);
      }
      xhr.send(postData);
    } else if (opt.method.toUpperCase() === 'GET') {
      xhr.open(opt.method, opt.url + '?' + postData, opt.async);
      setRequestHeader()
      xhr.setRequestHeader('Accept', 'application/vnd.github.squirrel-girl-preview, application/vnd.github.html+json');
      // 登录校验
      if (token) {
        xhr.setRequestHeader('Authorization', 'token ' + token);
      }
      xhr.send(null);
    }

    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4) {
        if (xhr.status >= 200 && xhr.status < 300) {
          opt.success && opt.success(xhr.responseText);
        } else {
          opt.fail && opt.fail(xhr.status)
        }
      }
    };
    xhr.onerror = function () {
      opt.fail && opt.fail({ message: '请求错误！' });
    };
  };
  JL.issueComments = 0;
  JL.issueNumber = 0;
  JL.Utils = {
    ajax: ajax,
    queryUrl: queryUrl,
    addClass: addClass,
    removeClass: removeClass,
    formatDate: formatDate
  };
  JL.Renders = {
    box: {
      tpl: [
        '<section class="box" id="JELON__commentBox">',
          '<div class="com-avatar"><img id="JELON__loginAvatar" src="/img/unsigned_avatar.jpg" alt="avatar"></div>',
          '<div class="com-text">',
            '<div class="main">',
              '<textarea class="text-area-edited show" id="JELON__editBox" placeholder="欢迎评论！"></textarea>',
              '<div class="text-area-preview" id="JELON__previewBox"></div>',
            '</div>',
            '<div class="switch">',
              '<div class="switch-item on" id="JELON__editSwitcher" onclick="JELON.Actions.editPreviewSwitch(\'edit\')">编辑</div>',
              '<div class="switch-item" id="JELON__previewSwitcher" onclick="JELON.Actions.editPreviewSwitch(\'preview\')">预览</div>',
            '</div>',
            '<div class="button" onclick="JELON.Actions.postComment()">提交</div>',
          '</div>',
        '</section>'
      ].join(''),
      update: function () {
        var userInfo = localStorage.getItem(constants.USER_INFO_KEY);
        if (userInfo) {
          userInfo = JSON.parse(userInfo);
        } else {
          userInfo = {};
        }
        // 默认头像路径 /img/jelon.jpg
        $('JELON__loginAvatar').src = userInfo.avatar_url || '/img/unsigned_avatar.jpg';
      }
    },
    list: {
      tpl: [
        '<section class="list-wrap" id="JELON__commentList">',
          '<div class="text-center">正在加载评论</div>',
        '</section>'
      ].join(''),
      /**
       * 评论列表模块视图更新
       * @param  {Number}    page      评论列表当前页码
       * @param  {Number}    comments  当前文章下所有评论总数
       * @param  {Number}    list      当前列表下评论列表数据
       * @param  {Function}  callback  回调
       * @return void(0)
       */
      update: function (page, comments, list, callback) {
        var perNavPageMaxSize = 5;
        var html = '';
        var htmlList = [];
        var pageList = [];
        var allPages = Math.ceil(comments / constants.PER_PAGE);
        if (comments === 0) {
          html = '<div class="text-center">暂无评论</div>';
        } else {
          var item = '';
          var pageItem = '';
          for (var i = 0, len = list.length; i < len; i++) {
            item = [
              '<li class="item">',
                '<div class="user-avatar">',
                  '<a target="_blank" href="' + list[i].user.html_url + '">',
                    '<img src="' + list[i].user.avatar_url + '" alt="user-avatar">',
                  '</a>',
                '</div>',
                '<div class="user-comment">',
                  '<div class="user-comment-header" id="JELON__comment_' + list[i].id + '_reactions">',
                    '<span class="post-name">' + list[i].user.login +  '</span>',
                    '<span class="post-time">' + formatDate('yyyy-MM-dd hh:mm', new Date(list[i].created_at)) + '</span>',
                    '<span class="like" onclick="JELON.Actions.like(' + list[i].id + ')">点赞</span>',
                    '<span class="like-num">' + list[i].reactions.heart + '</span>',
                    '<span class="reply" onclick="JELON.Actions.reply(\'' + list[i].user.login + '\', \'' + (list[i].body_html || list[i].body).replace(/<[^>]+>|\s|[\r\n]/g, ' ') + '\')">回复</span>',
                  '</div>',
                  '<div class="user-comment-body">' + (list[i].body_html || list[i].body) + '</div>',
                '</div>',
              '</li>'
            ].join('');
            htmlList.push(item);
          }
          if (allPages === 1) {
            pageItem = '<a href="javascript: void(0);" class="item current">' + page + '</a>';
            pageList.push(pageItem);
          } else if (allPages <= perNavPageMaxSize) {
            for (var i = 1; i <= allPages; i++) {
              if (i === page) {
                pageItem = '<a href="javascript: void(0);" class="item current">' + page + '</a>';
              } else {
                pageItem = '<a href="javascript: JELON.Actions.pageJump(' + i + ');" class="item">' + i + '</a>';
              }
              pageList.push(pageItem);
            }
            if (page !== 1) {
              pageList.unshift('<a href="javascript: JELON.Actions.pageJump(' + (page - 1) + ');" class="item">上页</a>');
            }
            if (page !== allPages) {
              pageList.push('<a href="javascript: JELON.Actions.pageJump(' + (page + 1) + ');" class="item">下页</a>');
            }
          } else if (allPages > perNavPageMaxSize) {
            if (page <= perNavPageMaxSize) {
              for (var i = 1; i <= perNavPageMaxSize; i++) {
                if (i === page) {
                  pageItem = '<a href="javascript: void(0);" class="item current">' + page + '</a>';
                } else {
                  pageItem = '<a href="javascript: JELON.Actions.pageJump(' + i + ');" class="item">' + i + '</a>';
                }
                pageList.push(pageItem);
              }
              if (page !== 1) {
                pageList.unshift('<a href="javascript: JELON.Actions.pageJump(' + (page - 1) + ');" class="item">上页</a>');
              }
              pageList.push('<span class="more">...</span>');
              pageList.push('<a href="javascript: JELON.Actions.pageJump(' + (page + 1) + ');" class="item">下页</a>');
              pageList.push('<a href="javascript: JELON.Actions.pageJump(' + allPages + ');" class="item">末页</a>');
            } else if (page > perNavPageMaxSize && page <= allPages - perNavPageMaxSize) {
              var mod = page % perNavPageMaxSize;
              var start = mod === 0 ? page : Math.floor(page / perNavPageMaxSize) * perNavPageMaxSize + 1;
              var end = mod === 0 ? page + perNavPageMaxSize : Math.ceil(page / perNavPageMaxSize) * perNavPageMaxSize;
              pageList.push('<a href="javascript: JELON.Actions.pageJump(1);" class="item">首页</a>');
              pageList.push('<a href="javascript: JELON.Actions.pageJump(' + (page - 1) + ');" class="item">上页</a>');
              for (var i = start; i <= end; i++) {
                if (i === page) {
                  pageItem = '<a href="javascript: void(0);" class="item current">' + page + '</a>';
                } else {
                  pageItem = '<a href="javascript: JELON.Actions.pageJump(' + i + ');" class="item">' + i + '</a>';
                }
                pageList.push(pageItem);
              }

              pageList.push('<span class="more">...</span>');
              pageList.push('<a href="javascript: JELON.Actions.pageJump(' + (page + 1) + ');" class="item">下页</a>');
              pageList.push('<a href="javascript: JELON.Actions.pageJump(' + allPages + ');" class="item">末页</a>');
            } else if (page > perNavPageMaxSize && page > allPages - perNavPageMaxSize) {
              var start = allPages - perNavPageMaxSize + 1;
              var end = allPages;
              pageList.push('<a href="javascript: JELON.Actions.pageJump(1);" class="item">首页</a>');
              pageList.push('<a href="javascript: JELON.Actions.pageJump(' + (page - 1) + ');" class="item">上页</a>');
              for (var i = start; i <= end; i++) {
                if (i === page) {
                  pageItem = '<a href="javascript: void(0);" class="item current">' + page + '</a>';
                } else {
                  pageItem = '<a href="javascript: JELON.Actions.pageJump(' + i + ');" class="item">' + i + '</a>';
                }
                pageList.push(pageItem);
              }
              if (page !== allPages) {
                pageList.push('<a href="javascript: JELON.Actions.pageJump(' + (page + 1) + ');" class="item">下页</a>');
              }
            }
          }
          html = [
            '<header class="list-header">总共 <span class="comments-num" id="JELON__commentsNum">' + JL.issueComments + '</span> 条评论</header>',
            '<ul class="list">',
              htmlList.join(''),
            '</ul>',
            '<div class="page-nav">',
              pageList.join(''),
            '</div>'
          ].join('');
        }
        $('JELON__commentList').innerHTML = html;
        if (localStorage.getItem(constants.USER_INFO_KEY)) {
          callback && callback();
        }
      },
      reactionUpdate: function (commentId, reactions) {
        var userInfo = localStorage.getItem(constants.USER_INFO_KEY);
        if (userInfo) {
          userInfo = JSON.parse(userInfo);
        } else {
          return;
        }
        var userId = userInfo.id;
        for (var i = 0, len = reactions.length; i < len; i++) {
          if (userId === reactions[i].user.id) {
            console.log(userId, reactions[i].user.id);
            addClass($('JELON__comment_' + commentId + '_reactions').getElementsByClassName('like')[0], 'liked');
            $('JELON__comment_' + commentId + '_reactions').getElementsByClassName('like')[0].innerHTML = '已赞';
            break;
          }
        }
      },
      addOne: function (data) {
        var oLi = document.createElement('li');
        oLi.className = 'item';
        var item = [
          '<div class="user-avatar">',
            '<a target="_blank" href="' + data.user.html_url + '">',
              '<img src="' + data.user.avatar_url + '" alt="user-avatar">',
            '</a>',
          '</div>',
          '<div class="user-comment">',
            '<div class="user-comment-header" id="JELON__comment_' + data.id + '_reactions">',
              '<span class="post-name">' + data.user.login +  '</span>',
              '<span class="post-time">' + formatDate('yyyy-MM-dd hh:mm', new Date(data.created_at)) + '</span>',
              '<span class="like" onclick="JELON.Actions.like(' + data.reactions.heart + ')">点赞</span>',
              '<span class="like-num">' + data.reactions.heart + '</span>',
              '<span class="reply" onclick="JELON.Actions.reply(\'' + data.user.login + '\', \'' + (data.body_html || data.body).replace(/<[^>]+>|\s|[\r\n]/g, ' ') + '\')">回复</span>',
            '</div>',
            '<div class="user-comment-body">' + (data.body_html || data.body) + '</div>',
          '</div>'
        ].join('');
        oLi.innerHTML = item;
        var oUl = $('JELON__commentList').getElementsByTagName('ul')[0];
        if (oUl) {
          oUl.insertBefore(oLi, oUl.firstChild);
          $('JELON__commentsNum').innerHTML = JL.issueComments + 1;
        } else {
          $('JELON__commentList').innerHTML = [
            '<header class="list-header">总共 <span class="comments-num" id="JELON__commentsNum">' + (JL.issueComments + 1) + '</span> 条评论</header>',
            '<ul class="list">',
              '<li class="item">',
                item,
              '</li>',
            '</ul>'
          ].join('');
        }
      }
    },
    signBar: {
      tpl: [
        '<div class="sign-bar" id="JELON__commentSignBar">',
        '</div>'
      ].join(''),
      update: function () {
        var token = localStorage.getItem(constants.ACCESS_TOKEN_KEY);
        var userInfo = localStorage.getItem(constants.USER_INFO_KEY);
        var html = '';
        if (token && userInfo) {
          userInfo = JSON.parse(userInfo);
          html = [
            '<span class="sign-txt" title="' + userInfo.login + '">GitHub 已登录!</span>',
            '<span class="sign-link" onclick="JELON.Actions.signOut()">退出</span>'
          ].join('');
        } else {
          html = [
            '<span class="sign-txt">GitHub 未登录?</span>',
            '<a href="https://github.com/login/oauth/authorize?scope=public_repo&redirect_uri=',
              location.href.indexOf('?') !== -1 ? encodeURIComponent(location.href.substring(0, location.href.indexOf('?'))) : encodeURIComponent(location.href),
              '&client_id=' + JL.options.clientId + '&client_secret=' + JL.options.clientSecret + '" class="sign-link">',
              '登录',
            '</a>'
          ].join('');
        }
        $('JELON__commentSignBar').innerHTML = html;
      }
    },
    tips: {
      tpl: [
        '<section class="tips clearfix" id="JELON__comment_tips">',
          '注：评论支持 ',
          '<a href="',
            constants.MARKDOWN_DOC,
            '" target="_blank">',
            'markdown',
          '</a>',
          ' 语法！',
        '</section>',
      ].join(''),
      update: function () {
        var userInfo = localStorage.getItem(constants.USER_INFO_KEY);
        var handler = '';
        var mdTips = [
          '注：评论支持 ',
          '<a href="',
            constants.MARKDOWN_DOC,
            '" target="_blank">',
            'markdown',
          '</a>',
          ' 语法！',
        ].join('');
        // 如果文章还没关联 issue 并且登录账号是自己时
        if (userInfo && JSON.parse(userInfo).login === JL.options.owner && JL.issueNumber === 0) {
          handler = '<a href="javascript: JELON.Actions.createIssue();" class="init" title="文章关联 issue">初始化评论</a>';
        }
        $('JELON__comment_tips').innerHTML = handler + mdTips;
      }
    },
    flashTitle: function (title) {
      var counter = 0;
      document.title = title + '...';
      var timer = setInterval(function () {
        counter++;
        if (counter % 3 === 0) {
          document.title = title + '...';
        } else if (counter % 3 === 1) {
          document.title = title + '..';
        } else if (counter % 3 === 2) {
          document.title = title + '.';
        }
        if (counter === 0) {
          clearInterval(timer);
        }
      }, 100);
    },
    loading: {
      create: function (oParent) {
        oParent = oParent || document.body;
        var oLoading = document.createElement('div');
        oLoading.className = 'loading-mask';
        oLoading.id = 'JELON__loadingMask';
        oLoading.innerHTML = '<div class="loading-icon"><img src="/img/loading.gif" width="50" height="50" alt="加载中" ></div>';
        oParent.appendChild(oLoading);
      },
      remove: function () {
        var oLoading = $('JELON__loadingMask');
        oLoading.parentNode.removeChild(oLoading);
      }
    }
  };
  JL.Actions = {
    init: function () {
      var code = queryUrl('code');
      JL.Renders.signBar.update();
      JL.Renders.box.update();
      // if code，继续GitHub 授权
      if (code) {
        JL.Renders.loading.create();
        JL.Renders.flashTitle('登录中');
        JL.Requests.getAccessToken({
          client_id: JL.options.clientId,
          client_secret: JL.options.clientSecret,
          code: code
        }, function (res) {
          if (res.access_token || res.data) {
            if (res.data) {
              res.access_token = res.data.access_token;
            }
            localStorage.setItem(constants.ACCESS_TOKEN_KEY, res.access_token);       // 保存 access_token 至 localStorage
            JL.Requests.getUserInfo({ access_token: res.access_token }, function (res) {
              if (res.login) {
                localStorage.setItem(constants.USER_INFO_KEY, JSON.stringify(res));     // 保存用户信息到 localStorage
                location.href = location.href.substring(0, location.href.indexOf('?'));
                JL.Renders.loading.remove();
              }
            });
          } else {
            // 登录失败
            location.href = location.href.substring(0, location.href.indexOf('?'));
            JL.Renders.loading.remove();
          }
        });
      } else {
        JL.Requests.getIssueNumberByLabel(JL.options.label, function (res) {
          if (res.length > 0) {
            var number = res[0].number;
            var comments = res[0].comments; // 该 issue 下所有评论数
            JL.issueNumber = number;
            JL.issueComments = comments;
            JL.Requests.getCommentListByIssueNumber(number, {
              page: 1,
              per_page: constants.PER_PAGE
            }, function (list) {
              JL.Renders.list.update(1, comments, list, function () {
                for (var i = 0, len = list.length; i < len; i++) {
                  (function (commentId) {
                    JL.Requests.getReactionsByCommentId(commentId, { content: 'heart' }, function (reactions) {
                      JL.Renders.list.reactionUpdate(commentId, reactions);
                    });
                  }(list[i].id));
                }
              });
            });
          } else {
            // 授权码失效
            if (typeof res !== 'object') {
              localStorage.removeItem(constants.ACCESS_TOKEN_KEY);
              localStorage.removeItem(constants.USER_INFO_KEY);
              JL.Renders.signBar.update();
              JL.Renders.box.update();
              console.warn('登录失败，请稍后刷新再试');
            } else {
              JL.Renders.list.update(1, 0, []);
              JL.Renders.tips.update();
            }
          }
        });
      }
    },
    signOut: function () {
      localStorage.removeItem(constants.ACCESS_TOKEN_KEY);
      localStorage.removeItem(constants.USER_INFO_KEY);
      JL.Renders.signBar.update();
      JL.Renders.box.update();
    },
    pageJump: function (page) {
      JL.Requests.getCommentListByIssueNumber(JL.issueNumber, {
        page: Number(page),
        per_page: constants.PER_PAGE
      }, function (list) {
        JL.Renders.list.update(page, JL.issueComments, list, function () {
          for (var i = 0, len = list.length; i < len; i++) {
            (function (commentId) {
              JL.Requests.getReactionsByCommentId(commentId, {
                content: 'heart'
              }, function (reactions) {
                JL.Renders.list.reactionUpdate(commentId, reactions);
              });
            }(list[i].id));
          }
        });
      });
    },
    editPreviewSwitch: function (flag) {
      if (flag === 'edit') {
        removeClass('JELON__previewSwitcher', 'on');
        addClass('JELON__editSwitcher', 'on');
        removeClass('JELON__previewBox', 'show');
        addClass('JELON__editBox', 'show');
      } else {
        removeClass('JELON__editSwitcher', 'on');
        addClass('JELON__previewSwitcher', 'on');
        removeClass('JELON__editBox', 'show');
        addClass('JELON__previewBox', 'show');
        var text = $('JELON__editBox').value.trim();
        if (text) {
          JL.Requests.markdown({
            text: text,
            mode: 'markdown',
          }, function (res) {
            $('JELON__previewBox').innerHTML = res;
          });
        } else {
          $('JELON__previewBox').innerHTML = '';
        }
      }
    },
    postComment: function () {
      var accessToken = localStorage.getItem(constants.ACCESS_TOKEN_KEY);
      var userInfo = localStorage.getItem(constants.USER_INFO_KEY);
      if (!accessToken || !userInfo) {
        alert('请先登录哦..!^_^');
        return;
      }
      var body = $('JELON__editBox').value.trim();
      if (body) {
        JL.Renders.loading.create();
        if (JL.issueNumber !== 0) {
          JL.Requests.createComment(JL.issueNumber, {
            body: body
          }, function (res) {
            if (res.id) {
              JL.Renders.list.addOne(res);
              JL.issueComments++;
              $('JELON__editBox').value = '';
              $('JELON__previewBox').innerHTML = '';
            }
            JL.Renders.loading.remove();
          });
        } else {
          // 如果还没有创建 issue，先创建 issue
          JL.Requests.createIssue({
            title: document.title,
            body: location.href,
            labels: [ (JL.options.label || location.href) ]
          }, function (res) {
            if (res.number) {
              JL.issueNumber = res.number
              JL.Requests.createComment(JL.issueNumber, {
                body: body
              }, function (json) {
                if (res.id) {
                  JL.Renders.list.addOne(json);
                  JL.issueComments++;
                  $('JELON__editBox').value = '';
                  $('JELON__previewBox').innerHTML = '';
                }
                JL.Renders.loading.remove();
              });
            }
          });
        }
      }
    },
    like: function (commentId) {
      var oLiked = $('JELON__comment_' + commentId + '_reactions').getElementsByClassName('liked');
      var oLike = $('JELON__comment_' + commentId + '_reactions').getElementsByClassName('like')[0];
      var oNum = $('JELON__comment_' + commentId + '_reactions').getElementsByClassName('like-num')[0];
      var accessToken = localStorage.getItem(constants.ACCESS_TOKEN_KEY);
      var userInfo = localStorage.getItem(constants.USER_INFO_KEY);
      if (oLiked.length) {
        return false;
      } else {
        if (accessToken && userInfo) {
          JL.Requests.createReaction(commentId, { content: 'heart' }, function (res) {
            if (res.content === 'heart') {
              addClass(oLike, 'liked');
              oLike.innerHTML = '已赞';
              oNum.innerHTML = Number(oNum.innerHTML) + 1;
            }
          });
        }
      }
    },
    createIssue: function () {
      JL.Renders.loading.create();
      JL.Requests.createIssue({
        title: document.title,
        body: location.href,
        labels: [ (JL.options.label || location.href) ]
      }, function (json) {
        if (json.number) {
          JL.issueNumber = json.number;
          JL.Renders.tips.update();
        }
        JL.Renders.loading.remove();
      });
    },
    reply: function (people, content) {
      var accessToken = localStorage.getItem(constants.ACCESS_TOKEN_KEY);
      var userInfo = localStorage.getItem(constants.USER_INFO_KEY);
      if (!accessToken || !userInfo) {
        return;
      }
      JL.Actions.editPreviewSwitch('edit');
      $('JELON__editBox').value = '';
      $('JELON__editBox').focus();
      $('JELON__editBox').value = [
        '@' + people + '\n',
        '> ' + content + '\n',
        '\n'
      ].join('');
      $('JELON__previewBox').innerHTML = '';
    }
  };
  JL.Requests = {
    getIssueNumberByLabel: function (label, callback) {
      ajax({
        url: constants.API_HOST + '/repos/' + JL.options.owner + '/' + JL.options.repo + '/issues',
        method: 'GET',
        data: {
          labels: [ label ],
          rnd: Math.random()
        },
        success: function (res) {
          if (typeof res === 'string') {
            if (window.JSON) {
              res = JSON.parse(res);
            } else {
              res = eval('(' + res + ')');
            }
          }
          callback && callback(res);
        },
        fail: function (err) {
          callback && callback(err);
        }
      });
    },
    createIssue: function (data, callback) {
      ajax({
        url: constants.API_HOST + '/repos/' + JL.options.owner + '/' + JL.options.repo + '/issues',
        method: 'POST',
        data: data,
        success: function (res) {
          if (typeof res === 'string') {
            if (window.JSON) {
              res = JSON.parse(res);
            } else {
              res = eval('(' + res + ')');
            }
          }
          callback && callback(res);
        },
        fail: function (err) {
          callback && callback(err);
        }
      });
    },
    getCommentListByIssueNumber: function (number, data, callback) {
      ajax({
        url: constants.API_HOST + '/repos/' + JL.options.owner + '/' + JL.options.repo + '/issues/' + number + '/comments',
        method: 'GET',
        data: data,
        success: function (res) {
          if (typeof res === 'string') {
            if (window.JSON) {
              res = JSON.parse(res);
            } else {
              res = eval('(' + res + ')');
            }
          }
          callback && callback(res);
        },
        fail: function (err) {
          callback && callback(err);
        }
      });
    },
    getReactionsByCommentId: function (id, data, callback) {
      if (typeof data === 'object' && !data.rnd) {
        data.rnd = Math.random();
      }
      ajax({
        url: constants.API_HOST + '/repos/' + JL.options.owner + '/' + JL.options.repo + '/issues/comments/' + id + '/reactions',
        method: 'GET',
        data: data,
        success: function (res) {
          if (typeof res === 'string') {
            if (window.JSON) {
              res = JSON.parse(res);
            } else {
              res = eval('(' + res + ')');
            }
          }
          callback && callback(res);
        },
        fail: function (err) {
          callback && callback(err);
        }
      });
    },
    editIssue: function (number, data, callback) {
      ajax({
        url: constants.API_HOST + '/repos/' +  JL.options.owner + '/' + JL.options.owner + '/issues/' + number,
        method: 'POST',
        data: data,
        success: function (res) {
          if (typeof res === 'string') {
            if (window.JSON) {
              res = JSON.parse(res);
            } else {
              res = eval('(' + res + ')');
            }
          }
          callback && callback(res);
        },
        fail: function (err) {
          callback && callback(err);
        }
      });
    },
    markdown: function (data, callback) {
      ajax({
        url: constants.API_HOST + '/markdown',
        headers: {
          Accept: 'application/vnd.github.v3+json',
        },
        method: 'POST',
        data: data,
        success: function (res) {
          callback && callback(res);
        },
        fail: function (err) {
          callback && callback(err);
        }
      });
    },
    getAccessToken: function (data, callback) {
      ajax({
        // url: 'https://gh-oauth.imsun.net/',
        url: 'https://cors-anywhere.herokuapp.com/https://github.com/login/oauth/access_token',
        method: 'POST',
        headers: {
          'Accept': 'application/json'
        },
        data: data,
        success: function (res) {
          if (typeof res === 'string') {
            if (window.JSON) {
              res = JSON.parse(res);
            } else {
              res = eval('(' + res + ')');
            }
          }
          callback && callback(res);
        },
        fail: function (err) {
          callback && callback(err);
        }
      });
    },
    getUserInfo: function (data, callback) {
      ajax({
        url: constants.API_HOST + '/user',
        method: 'GET',
        data: data,
        success: function (res) {
          if (typeof res === 'string') {
            if (window.JSON) {
              res = JSON.parse(res);
            } else {
              res = eval('(' + res + ')');
            }
          }
          callback && callback(res);
        },
        fail: function (err) {
          callback && callback(err);
        }
      });
    },
    createComment: function (number, data, callback) {
      ajax({
        url: constants.API_HOST + '/repos/' + JL.options.owner + '/' + JL.options.repo + '/issues/' + number + '/comments',
        method: 'POST',
        data: data,
        success: function (res) {
          if (typeof res === 'string') {
            if (window.JSON) {
              res = JSON.parse(res);
            } else {
              res = eval('(' + res + ')');
            }
          }
          callback && callback(res);
        },
        fail: function (err) {
          callback && callback(err);
        }
      });
    },
    createReaction: function (commentId, data, callback) {
      ajax({
        url: constants.API_HOST + '/repos/' + JL.options.owner + '/' + JL.options.repo + '/issues/comments/' + commentId + '/reactions',
        method: 'POST',
        data: data,
        success: function (res) {
          if (typeof res === 'string') {
            if (window.JSON) {
              res = JSON.parse(res);
            } else {
              res = eval('(' + res + ')');
            }
          }
          callback && callback(res);
        },
        fail: function (err) {
          callback && callback(err);
        }
      });
    }
  };
  JL.Comment = function (options) {
    JL.options = options || {};
    var $container = $('comments');
    if (options.container) {
      if (typeof options.container === 'object') {
        $container = options.container;
      } else if (typeof options.container === 'string') {
        if (/^#/.test(options.container)) {
          $container = $(options.container.replace(/^#/, ''));
        } else {
          $container = $(options.container);
        }
      } else {
        $container = $('comments');
      }
    }
    $container.innerHTML = [
      this.Renders.signBar.tpl,
      this.Renders.box.tpl,
      this.Renders.tips.tpl,
      this.Renders.list.tpl
    ].join('');
    JL.Actions.init();
  };

  return JL;
}));
