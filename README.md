# ez-wxlite

ez-wxlite是一套小程序开发模板，旨在设计一套简洁、高效、可维护的开发框架。

本套模板总体上分为两部分：

* [client](#client)：小程序源码部分；
* [server](#server)：为本地服务，不是后端服务，主要作用是mock接口以及静态文件服务。

点击这里下载模板：[ez-wxlite](https://github.com/wxlite-plus/ez-wxlite/releases)。

## client

client部分是框架的核心，设计上分为：

* [req](https://github.com/wxlite-plus/mp-req)：网络请求；
* [router](https://github.com/wxlite-plus/ez-wxlite/wiki/router)：路由；
* [config](https://github.com/wxlite-plus/ez-wxlite/wiki/config)：配置信息；
* [utils](https://github.com/wxlite-plus/ez-wxlite/wiki/utils)：工具集，用于存放一些通用的公共方法。
* [wxs](https://github.com/wxlite-plus/ez-wxlite/wiki/wxs)：工具集，wxml相关的一些公共变量及方法。

### 使用

框架核心代码都包含在`client/framework`文件夹内，在app.js中一次性引入：

```javascript
// app.js
require('./framework/index.js').patch();

App({});
```

调用patch方法会直接完成`App`、`Page`、`Component`这三个全局方法的代理，并完成相应的注入，所以上面的`App({})`其实已经是被代理之后的`App`，在这一实例中我们可以获取到注入的`options`数据，通过`this.$opts`获取到：

```javascript
App({
  onLaunch() {
    console.log(this.$opts);
  },
  onShow() {
    console.log(this.$opts);
  },
});
```

原小程序的`App`方法只能在`onLaunch`中获取到`options`，代理过后的`App`，通过将`options`挂载在实例上，我们可以在所有生命周期里访问到，方便使用，`Page`同理。

### req

req是`wx.request`的高级封装，用于发起ajax请求以及文件上传。

`wx.request`是一个底层api，使用的不便之处在于：

1. 返回结果比较底层，需要处理statusCode，而开发者往往更关注业务相关的data部分；
2. 登录机制繁琐，设计上甚至有些反人类；
3. 不具备良好的接口管理功能，可维护性差；

……

综上所述，`wx.request`需要一层高级的封装来简化操作，因此有了`req`，req代理了`wx.request`，并在这基础上做了一些设计工作，以提供良好的维护性：

* **promisify**：支持promise，替代callback的方式；
* **简化respone**：简化返回的数据信息，只保留业务数据；
* **method替代url**：使用js api的书写方式来替代直接书写url的方式；
* **接口缓存**：支持便捷的接口前端缓存；
* **自动登录**：登录态过期自动重新登录，过程对开发者透明。

详细内容请浏览[mp-req](https://github.com/wxlite-plus/mp-req)。

### router

页面的跳转存在哪些问题呢？

1. 与接口的调用一样面临url的管理问题；
2. 参数类型单一，只支持string。

第一个问题很好解决，我们就跟req一样，做一个集中管理。
第二个问题的情况是，当我们传递的参数argument不是`string`，而是`number`或者`boolean`时，也只能在下个页面得到一个`argument.toString()`值：

```javascript
// pages/index/index.js
wx.navigateTo({
  url: '/pages/a/index?a=true',
});

// pages/a/index.js
Page({
  onLoad(options) {
    console.log(options.a); // => "true"
    console.log(typeof options.a); // => "string"
    console.log(options.a === true); // => false
  },
});
```

上面这种情况想必很多人都遇到过，而且感到很抓狂，本来就想传递一个boolean，结果不管传什么都会变成string。

我们的解决方案是：利用`JSON.stringify+encodeURIComponent`和`decodeURIComponent+JSON.parse`的方式让参数保真。

顺手也替换掉那不好记的`navigate api`，于是就出现了如下方式：

```javascript
// pages/pageA/index.js
const { router } = require('../../framework/index.js');
Page({
  onReady() {
    router.push({
      name: 'home',
    });
  },
});


// pages/index/index.js
Page({
  onLoad() {
    console.log(this.$opts); // { id: '123', type: 1 }
  },
});
```

当然，上面的`name: 'home'`肯定也是事先配置好的，要不然鬼知道home到底跳转到哪里。

在`client/route/routes.js`中我们可以看到：

```javascript
module.exports = {
  // 主页
  home: {
    type: 'tab',
    path: '/pages/index/index',
  },
};
```

很明显，`home`其实就是`/pages/index/index`的一个别名，同时因为它是一个**tab**页面，所以我们也顺便指定了`type: 'tab'`，默认是`type: 'page'`。

除了支持别名之外，name也支持直接寻址，比如跳转home还可以写成这样：

```javascript
router.push({
  name: 'index',  // => /pages/index/index
});

router.push({
  name: 'userCenter',  // => /pages/user_center/index
});

router.push({
  name: 'userCenter.phone',  // => /pages/user_center/phone/index
});

router.push({
  name: 'test.debug',  // => /pages/test/debug/index
});
```

> 注意，为了方便维护，我们规定了每个页面都必须存放在一个特定的文件夹，一个文件夹的当前路径下只能存在一个index页面，比如`pages/index`下面会存放`pages/index/index.js`、`pages/index/index.wxml`、`pages/index/index.wxss`、`pages/index/index.json`，这时候你就不能继续在这个文件夹根路径存放另外一个页面，而必须是新建一个文件夹来存放，比如`pages/index/pageB/index.js`、`pages/index/pageB/index.wxml`、`pages/index/pageB/index.wxss`、`pages/index/pageB/index.json`。

router支持微信路由的所有方法，映射关系如下：

```javascript
router.push => wx.navigateTo
router.replace => wx.redirectTo
router.pop => wx.navigateBack
router.relaunch => wx.reLaunch
```

可能你会发现这里少了一个`wx.switchTab`，这不是遗漏，而是被集成到了`router.push`当中去了，因为我们认为，跳转一个页面到底是`page`的方式还是`tab`的方式这类事情，根本与业务无关，它应该被透明化。

你可能会记得上面我们的`home`在路由配置的时候就已经指定了`type: 'tab'`的属性，这样一来我们便可以尽管调用`router.push({name: 'home'})`，至于具体是`wx.navigateTo`还是`wx.switchTab`，程序会自动帮我们处理的。

这里还有一个好处就是，当一个页面需要从`tab`转变为`page`的时候，我们只需要改一下`routes`的定义就可以了，完全不需要去一个个修改业务中的代码。

## server

server为本地服务，不是后端服务，主要作用是：

* mock服务：当后端接口未就绪时，使用自定义的数据模拟接口调用；
* 静态文件服务：开发阶段使用本地静态资源替代线上的cdn资源；

### 运行

1. 命令行进入server目录，执行npm包安装：`npm install`（或者使用yarn）;
2. 执行`npm run dev`。

done！

### mock服务

mock的配置文件为`server/mock/init.js`，假设我需要一个**获取我的用户信息**的接口：

```javascript
function init(server) {
  server.get('/user/myInfo', (req, res) => {
    res.json({
      code: 0,
      data: {
        id: '123456',
        name: 'Jack'
      },
      msg: 'succ',
    });
  });
}
```

接着我就可以通过访问[http://localhost:8080/user/myInfo](http://localhost:8080/user/myInfo)得到我预设的json。

### 静态文件服务

如果我们想要随意地切换静态资源服务环境，那么我们在使用静态资源的时候就不能**hard code**，那我们怎么做呢？我们使用wxs来配置静态资源的前缀。

`client/wxs`这一目录存放的是wxs文件，其中我们预定义了**cdnPathTable.wxs**，它的含义类似于`client/config.apiUrlTable.js`，我们定义了local、dev、release三个环境，然后在wxml文件中使用：

```html
<!-- pages/index/index.wxml -->
<wxs src="../../wxs/index.wxs" modal="utils"></wxs>
<image src="{{utils.cdnPath}}/img/avt.jpg" />
```

这里的wxs和config其实没有什么区别，选择定义在wxs中是因为wxs在wxml中使用十分方便。

## 其他

为了使开发工作更简单高效，我们没有采用在小程序开发工具以外再搭建一层脚手架的做法，而是尽可能使用现有的工具和环境，借助于强大的vscode，我们还提供了：

* eslint支持；
* 借助typescript进行语法提示；

...

启用eslint功能只需要在根目录下运行`npm install`即可，typescript主要是实现小程序api的语法提示功能，当然这功能直接使用现有的vscode插件就可以实现，不过我目前没有找到比较好用的~考虑到微信的api文档更新比较频繁，插件的维护速度可能跟不上，所以简单地实现了一个本地化，在开发过程中可以手动补充，将自己常用的api定义好就足以提高效率了。

## 结语

感谢支持，欢迎提意见，如果你有其他更好的实践，也欢迎交流，可以直接通过邮箱（jack-lo@foxmail.com）联系我，谢谢！