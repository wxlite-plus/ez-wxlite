# ez-client

ez-wxlite是一套小程序开发模板，旨在设计一套简洁、高效、可维护的开发框架。

本套模板总体上分为两部分：

* [client](#client)：小程序源码部分；
* [server](#server)：为本地服务，不是后端服务，主要作用是mock接口以及静态文件服务。

## client

client部分是框架的核心，设计上分为：

* [req](#req)：网络请求；
* [router](#router)：路由；
* [config](#config)：配置信息；
* utils：工具集，用于存放一些通用的公共方法。

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

### config

**config**为全局配置信息，在本代码中预设了以下比较常用的设置，大家可以举一反三：

* [shareData](####shareData)：通用转发配置；
* [apiUrlTable](####apiUrlTable)：接口环境配置；

#### shareData

大家一定有过跨页面共享数据的需求，比如有十几个页面都是用的同一个转发标题、转发描述，以及转发图片，那么我们就可以将通用的转发信息**shareData**都保存在一个文件里，作为配置文件让所有页面都能访问：

```javascript
// pages/index/index.js
const { config } = require('../../framework/index.js');

Page({
  onShareAppMessage() {
    return config.shareData;
  },
});
```

以上，我们将通用的分享信息存放在`config.shareData`里，这只是`config`的一个示例用法。

#### apiUrlTable

对于接口的调用，我们一般会有多套环境：local（本地）、dev（开发）、pre（预发）、release（生产）。为了方便切换，我们需要将这些环境都定义好。

这个设置主要是配合[req](###req)来使用，因为接口的调用都封装在其中。

需要切换环境的时候，只需要在`client/config/index.js`对以下片段进行修改即可：

```javascript
...
const apiUrl = apiUrlTable.dev;
...
```

另外我们也发现了，config是集成在`client/framework/index.js`里的，事实上，之前我们提到的**req**、**router**、**utils**也都是集成在`client/framework/index.js`里的，使用的时候不需要一个个单独引入，这么做的目的是减少模板代码，方便维护。

### req

req是`wx.request`的高级封装，用于发起ajax请求以及文件上传。

`wx.request`是一个底层api，使用的不便之处在于：

1. 返回结果比较底层，需要处理statusCode，而开发者往往更关注业务相关的data部分；
2. 登录机制繁琐，设计上甚至有些反人类；
3. 不具备良好的接口管理功能，可维护性差；

……

综上所述，`wx.request`需要一层高级的封装来简化操作，因此有了`req`，req代理了`wx.request`，并在这基础上做了一些设计工作，以提供良好的维护性：

* [promisify](#promisify)：支持promise，替代callback的方式；
* [简化respone](#简化respone)：简化返回的数据信息，只保留业务数据；
* [method替代url](#method替代url)：使用js api的书写方式来替代直接书写url的方式；
* [接口缓存](#接口缓存)：支持便捷的接口前端缓存；
* [自动登录](#自动登录)：登录态过期自动重新登录，过程对开发者透明。

#### promisify

涉及到ajax就避不开异步编程，谈到异步，怎么少得了**promise**，所以我们第一时间考虑将其promise化：

```javascript
// url方式
wx.request({
  url: 'https://api.jack-lo.com/ez-wxlite/user/getInfo?id=123',
  success(res) {
    console.log(res);
  },
});

// method方式
req.user.getInfo({
  id: '123',
})
  .then((res) => {
    console.log(res);
  });
```

既然都已经promise了，你当然也可以方便地使用**async/await**。

#### 简化respone

为了更加通用，`wx.request`的返回值包含了完整的`respone`内容，但在大部分情况下，开发者关注的只有`respone.data`部分，于是我们做了一层过滤，req的请求返回结果就是`respone.data`，至于异常的statusCode（指的是除了`(statusCode >= 200 && statusCode < 300) || statusCode === 304;`以外的情况），我们将它归为了`fail`的范畴，也就是promise的catch通道。

我们还是以上面的示例代码来介绍，`wx.request`返回的`res`结构为：

```json
{
  "data": {
    "name": "Jack",
    "age": 18,
    "gender": 1
  },
  "statusCode": 200,
  "header": {}
}
```

如果我们想要读取data的内容，首先要判断`statusCode`是否为“正常”的http状态码，也就是诸如200之类的，而如果是404，我们还得弹个窗报个错什么的：

```javascript
// url方式
wx.request({
  url: 'https://api.jack-lo.com/ez-wxlite/user/getInfo?id=123',
  success(res) {
    if (res.statusCode === 200) {
      // 读取res.data
    } else {
      // 处理异常
    }
  },
  fail(err) {
    // 处理异常
  },
});
```

一般来说，我们的`res.data`里面还有业务层面的错误信息，这样的话，除了处理`wx.request`fail的错误，以及`success`里异常的`statusCode`错误，我们还要再处理业务逻辑的`res.data.code`（这里假设你的数据结构是`{code: number, data: object, msg: string}`）错误。。。

真是丧心病狂。。。

而`req.user.getInfo`返回的`res`则仅为：

```json
{
  "code": 0,
  "data": {
    "name": "Jack",
    "age": 18,
    "gender": 1
  },
  "msg": "success"
}
```

只关注业务部分的json，而fail和“bad statusCode”则一概交给catch通道去处理：

```javascript
// method方式
req.user.getInfo({
  id: '123',
})
  .then((res) => {
    console.log(res);
    if (res.code === 0) {
      // 请求成功
    } else {
      // 请求失败
    }
  })
  .catch((err) => {
    console.log(err);
  });
```

此时，err有可能是fail或者“bad statusCode”产生的，而这两种情况产生的err结构并不一样，如果你想弹窗显示错误信息，你可能需要对`err`进行识别和提炼，为此我们内置了两个方法`req.err.picker`和`req.err.show`，前者用于提炼错误信息文本，请放心，`req.err.picker`囊括了常见的error，能够很好地结合框架工作，而后者更方便，直接就是将error提炼并弹窗显示：

```javascript
req.user.getInfo({
  id: '123',
})
  .then((res) => {
    console.log(res);
    if (res.code === 0) {
      // 请求成功
    } else {
      // 请求失败
      req.err.show(res.msg);
    }
  })
  .catch((err) => {
    req.err.show(err); // 弹窗显示错误信息
    console.log(req.err.picker(res)); // 打印错误信息
  });
```

#### method替代url

直接使用`wx.request`必然要面临手写url的问题，一方面书写不方便，另一方面难以维护。想象一下，一旦需要更换某个使用频率较高的接口，你可能要把每个调用的地方都修改一遍，而且由于url的拼接方式可能各不相同，使用find&replace功能可能会有纰漏。

req将接口进行统一管理，对外暴露的都是method式的api，我们举个栗子，比如**获取用户信息**：

```javascript
// url方式
wx.request({
  url: 'https://api.jack-lo.com/ez-wxlite/user/getInfo?id=123',
});

// method方式
req.user.getInfo({
  id: '123',
});
```

看到这里你可能会说，咦，url跑哪去了？当然，url需要在某处被集中定义，进入`client/req/api`目录，我们新建一个js文件`user.js`，并做如下定义：

```javascript
/**
 * apiUrl是定义在config中的常量，
 * 它是当前使用接口的前缀，
 * 用于切换不同的环境
 * 这里的示例值为 https://api.jack-lo.com/ez-wxlite
 */
const { apiUrl } = require('../../config/index.js');

module.exports = {
  install(R, req) {
    R.user = {
      // 获取用户信息
      getInfo(data) {
        const url = `${apiUrl}/user/getInfo`;
        return req({ url, data });
      },
    };
  },
};
```

然后在`client/req/index.js`中进行挂载，req使用的是类似插件的方式，插件需要实现一个`install`方法，然后req使用`use`api来进行安装：

```javascript
const R = require('./prototype.js');
const userApi = require('./api/user.js');

R.use(userApi);

module.exports = R;
```

通过以上操作，我们将url转化为js api，这样的好处是方便调用和维护，同时，我们将接口做了一个归类，比如获取用户信息属于`user`类，将来`user`类也会继续添加其他一些接口，这样的接口更加的语义化，同时也起到命名空间的作用。

#### 接口缓存

某些接口使用频率高但是变动又少，比如“获取当前用户的个人信息”、“获取省市区数据”，我们可以在前端通过缓存来提高性能，为此我们提供了如下几个api来控制接口缓存：

| api | 参数 | 返回值 | 示例 | 描述 |
| - | - | - | - | - |
| req.cachify | [string]req api | [function]cachifyFn | req.cachify('user.getMyInfo')() | 调用接口并缓存数据 |
| req.clearCache | [string]req api, [string]id(optional) | undefined | req.clearCache('user.getMyInfo') | 清除某个接口的缓存：接受两个参数，第一参数为`req api`名，第二参数为`id`（选填），也就是接口的唯一标识，这一般用在分页接口，默认可不填 |
| req.clearAllCache | [string]req api(optional) | undefined | req.clearAllCache('user.getMyInfo')() | 清除所有缓存：接受一个参数`req api`（选填），当传值时，清除指定api的缓存，不传则清除所有api的缓存 |

我们假设你已经定义好了 “**获取当前用户的个人信息**”这一接口`req.user.getMyInfo`，我们要对这一接口进行调用后缓存，那么调用方式应该为：

```javascript
req.cachify('user.getMyInfo')()
  .then((res) => {
    if (res.code === 0) {
      // res.data
    } else {
      req.err.show(res.msg);
    }
  })
  .catch((err) => {
    req.err.show(err);
  });
```

`req.cachify`接受的第一参数为一个**req api名**，并返回一个**函数**，这个函数入参同被定义的req api一致。

那么，什么时候清除缓存？当我**对我的个人信息进行编辑并提交成功**以后，我就需要清除缓存，以便获取最新的数据，假设已经定义好的“**更新我的信息接口**”为`req.user.updateMyInfo`：

```javascript
req.user.updateMyInfo()
  .then((res) => {
    if (res.code === 0) {
      req.clearCache('user.getMyInfo');
    } else {
      req.err.show(res.msg);
    }
  })
  .catch((err) => {
    req.err.show(err);
  });
```

> 注意：接口缓存是基于已定义接口的前提下，没有定义的接口是无法直接使用`req.cachify`调用的。

#### 自动登录

按照官方文档，小程序的登录流程应该是这样的：

![登录流程](https://developers.weixin.qq.com/miniprogram/dev/framework/open-ability/image/api-login.jpg?t=18122018)

简单来理解，**小程序登录其实就是一个用code换取session_key的过程**。

当session_key过期了，我重新用新code换取新的session_key，再去发请求。

那么，session_key过期我们怎么知道？有些开发者可能会用`wx.checkSession`去定时检查，但是定多长的时间呢？不知道，因为**微信不会把 session_key 的有效期告知开发者，而是根据用户使用小程序的行为对 session_key 进行续期，用户越频繁使用小程序，session_key 有效期越长**，因此，定时刷新是个不好的实践，因为你把握不了时机，会造成资源浪费并且增加不确定性。

事实上，**只有在需要跟微信（后端）接口打交道的时候，才需要有效的session_key**，那么后端肯定知道什么时候过期了，因为微信后端会告诉我们，所以我们把过期的判断交给后端，只要后端被告知过期了，接口就返回一个固定的状态，比如`code=3000`，前端收到这一状态之后，便重新走一遍登录流程，获取到新的`session_key`，再重新发起请求。

> 大多数时候我们只停留在自己的业务里，并不需要跟微信打交道，我们可以约定自己的会话有效期，并且放宽一些，比如1天，只要是不需要跟微信打交道，这个时效性就会宽松的多，性能也会得到提高。

req的自动登录就是这么实现的，约定好登录过期状态（默认是`res.code === 3000`，请根据实际情况自行修改），req会自动调用`wx.login`重新获取`js code`，再用`js code`去调用登录接口换取新的`sessionId`，最后再发起一遍上次的请求。

这让开发者可以更加专注在业务开发上，而不必关心登录过期的问题。

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

### 关于脚手架

关于小程序的开发，可能市面上有一些第三方的脚手架出现，比如mpvue和wepy等，我的观点是，由于小程序开发者工具的存在，小程序的开发已经有足够的模块化和自动化支持，能够满足开发需要，如果要在这上面再加一层编译，我觉得开销还是比较大的（而且小程序开发工具本来性能也不怎么样），我觉得并不是特别必要。

另外，小程序开发工具目前也是支持打包npm的。

### 使用vue的方式开发小程序

对于喜欢用vue的方式来开发小程序的朋友，我也表示不是特别理解，在我看来其实vue和小程序的上手门槛都不高，这样做其实徒增了一些不稳定性和不确定性。利用好现有的开发者工具，用设计来弥补其他方面的不足，也许能换来更好的开发体验，这也是我持续完善这套模板的出发点。

以上观点只是为了阐述我开发这个项目的出发点，并无其他恶意~

感谢支持，欢迎提意见，如果你有其他更好的实践，也欢迎交流，可以直接通过邮箱（jack-lo@foxmail.com）联系我，谢谢！