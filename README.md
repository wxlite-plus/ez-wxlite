ez-wxlite是一套小程序开发模板，旨在设计一套简洁、高效、可维护的开发框架。

本套模板总体上分为三部分：**server**、**client**、**cloud_func**，server为本地服务，不是后端服务，主要作用是mock接口以及静态文件服务；client是小程序源码部分；cloud_func则是云开发中的云函数存放目录。

## client
client部分是框架的核心，设计上分为：**req**、**router**、**config**、**utils**四个部分。

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

```javascript
// pages/index/index.js
const { config } = require('../../framework/index.js');

Page({
  onShareAppmsg() {
    return config.shareData;
  },
});
```

以上，我们将通用的分享信息存放在`config.shareData`里，这只是`config`的一个示例用法。

之前我们提到的**req**、**router**、**config**、**utils**都是集成在`client/framework/index.js`里的，不需要一个个单独引入，这么做的目的是减少模板代码，方便使用。

### req
req是`wx.request`的高级封装，用于发起ajax请求以及文件上传。

`wx.request`是一个底层api，使用的不便之处在于：
1、返回结果比较底层，需要处理statusCode，而开发者往往更关注业务相关的data部分；
2、登录机制繁琐，设计上甚至有些反人类；
3、不具备良好的接口管理功能，可维护性差；
……

综上所述，`wx.request`需要一层高级的封装来简化操作，因此有了`req`，req代理了`wx.request`，并在这基础上做了一些设计工作，以提供良好的维护性。

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

既然都已经promise了，你当然也可以方便地使用async/await。

#### 精简respone
为了更加通用，`wx.request`的返回值包含了完整的`respone`内容，但在大部分情况下，我们关注的只有`respone.data`部分，于是我们做了一层过滤，req的请求返回结果就是`respone.data`，至于异常的statusCode（指的是除了`(statusCode >= 200 && statusCode < 300) || statusCode === 304;`以外的情况），我们将它归为了`fail`的范畴，也就是promise的catch通道。

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

而`req.user.getInfo`返回的`res`则为：
```json
{
  "name": "Jack",
  "age": 18,
  "gender": 1
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

此时，err有可能是fail或者“bad statusCode”产生的，如果你想弹窗显示错误信息，你可能需要对`err`进行识别和提炼，为此我们内置了两个方法`req.err.picker`和`req.err.show`，前者用于提炼错误信息文本，请放心，`req.err.picker`囊括了常见的error，能够很好地结合框架工作，而后者更方便，直接就是将error提炼并弹窗显示：
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

#### js api替代url
直接使用`wx.request`必然要面临手写url的问题，一方面书写不方便，一方面难以维护。想象一下，一旦需要更换某个使用频率较高的接口，你可能要把每个调用的地方都修改一遍，而且由于url的拼接方式可能各不相同，使用find&replace功能可能会有纰漏。

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

然后在`client/req/index.js`中进行挂载（install）：
```javascript
const R = require('./prototype.js');
const userApi = require('./api/user.js');

R.use(userApi);

module.exports = R;
```

通过以上操作，我们将url转化为js api，这样的好处是方便调用和维护，同时，我们将接口做了一个归类，比如获取用户信息属于`user`类，将来`user`类也会继续添加其他一些接口，这样的接口更加的语义化，同时也起到命名空间的作用。

#### 接口缓存
某些接口使用频率高但是变动又少，比如“获取当前用户的个人信息”、“获取省市区数据”、“获取某个班级”，我们可以在前端做个缓存来提高性能，为此我们提供了`req.cachify`这一api。

我们假设你已经通过上面的步骤定义好了“获取当前用户的个人信息”这一接口`req.user.getMyInfo`，我们要对这一接口进行缓存，那么调用方式应该为：
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

那么，什么时候清除缓存？当我对我的个人信息进行编辑并提交成功以后，我就需要清除缓存，以便获取最新的数据，假设已经定义好的“更新我的信息接口”为`req.user.updateMyInfo`：
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

`req.clearCache`清除某个接口的缓存：接受两个参数，第一参数为`req api`名，第二参数为`id`（选填），也就是接口的唯一标识，这一般用在分页接口，默认可不填。
`req.clearAllCache`清除所有缓存：接受一个参数`req api`（选填），当传值时，清除指定api的缓存，不传则清除所有api的缓存。

#### 自动登录
req做了一个自动登录的逻辑，也就是当接口返回一个约定好的登录过期状态（默认是`res.code === 3000`，请根据实际情况自行修改）时，req会自动调用`wx.login`重新获取`js code`，再用`js code`去调用登录接口换取新的`sessionId`，最后再发起一次上次的请求。

这让开发者可以更加专注在业务开发上。


### router
页面的跳转存在哪些问题呢？
1、与接口的调用一样面临url的管理问题；
2、参数类型单一，只支持string；

第一个问题很好解决，我们就跟req一样，做一个集中管理。
第二个问题的情况是，当我们传递的参数arg不是string，而是number或者boolean时，也只能在下个页面得到一个`arg.toString()`值，这显然不够好用。

我们的解决方案是：利用`JSON.stringify+encodeURIComponent`和`decodeURIComponent+JSON.parse`的方式让参数保真。

顺手也替换掉那不好记的`navigate api`，于是就出现了如下方式：
```javascript
// pages/pageA/index.js
const { router } = require('../../framework/index.js');
Page({
  onReady() {
    router.push({
      name: 'home',
      data: {
        id: '123',
        type: 1,
      },
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

相关内容请查阅：[小程序开发](https://www.jianshu.com/nb/22265658)