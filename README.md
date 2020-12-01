# learn-axios
任务点：
- 拦截请求和响应
- 转换请求数据和响应数据
- 取消请求
- 客户端支持防御 XSRF

### 拦截请求和响应
1. 初始化拦截器对象 InterceptorManager ，请求前和返回后的回调函数分开存储，因拦截器可以有多个，InterceptorManager 对象中用 handlers 数组存放回调函数对象
```javascript
this.handlers.push({
    fulfilled: fulfilled,
    rejected: rejected
  });
```

2. 拦截器是通过 promise 链式调用执行的，官方用了巧妙的方式把拦截器的函数存放到一维数组中，先看下数组的初始化
`var chain = [dispatchRequest, undefined];`
dispatchRequest 是用于发起请求的函数，后面的 undefined 后面再解释，因为请求拦截器需要在发请求前执行，所以把 request 的拦截器函数插入到数组的头部，因为是按use顺序保存，插入chain头部的时候顺序就倒过来了，所以最新use的拦截器最后执行。
```javascript
chain.unshift(interceptor.fulfilled, interceptor.rejected);
```
unshift 的时候同时插入成功和失败函数，所以初始化时候的第二个 undefined 就是用于失败函数的。

在处理完request拦截器后，就接着处理回调拦截器
`chain.push(interceptor.fulfilled, interceptor.rejected);`
数组尾部插入，回调拦截器的执行顺序就与use的顺序是一致的

最后 promise.then 依次执行各个函数，在构造promise的时候传入了 config ，这也是为什么request.use 必须要返回 config 的原因
```javascript
var promise = Promise.resolve(config);
while (chain.length) {
    promise = promise.then(chain.shift(), chain.shift());
}
```

### 转换请求数据和响应数据
1. 请求前数据处理
transformRequest 可以在发起请求前对请求报文和请求头做处理，官方默认了一个 transformRequest 方法，若用户没有配置这个选项则会使用默认的这个函数

transformResponse

### 关于配置对象的合并

### 取消请求

### 客户端支持防御 XSRF

### paramsSerializer 序列化的作用？ 为什么需要序列化