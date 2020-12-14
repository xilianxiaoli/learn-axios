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
dispatchRequest 函数是核心处理函数
1. 请求前数据处理
transformRequest 可以在发起请求前对请求报文和请求头做处理，官方默认了一个 transformRequest 方法，若用户没有配置这个选项则会使用默认的函数，axios会默认设置 Content-Type 就是在这里处理
```javascript
if (utils.isURLSearchParams(data)) {
      setContentTypeIfUnset(headers, 'application/x-www-form-urlencoded;charset=utf-8');
      return data.toString();
    }
    if (utils.isObject(data)) {
      setContentTypeIfUnset(headers, 'application/json;charset=utf-8');
      return JSON.stringify(data);
    }
```
2. 请求后的数据处理
transformResponse 自定义函数，对返回的报文做处理，跟 transformRequest 一样，也有个默认的函数，axios会默认帮我们把返回的json字符串转换成对象，这一操作就是在默认的这个函数中处理的，若用户自定义的transformResponse，那么就不调用默认的处理函数

3. 因为是通过 promise.then 的链式调用的，所以若想每个拦截器的 reject 函数都能被执行，就需要在reject函数中 Promise.reject(error) 或者 抛出异常

### 关于配置对象的合并

### 取消请求
根据规范 http 请求一旦发起就不能被取消，`https://github.com/tc39/proposal-cancelable-promises` 详见这个被废弃的规范，既然标准不支持，那么 axios 便基于这一规范实现了 CancelToken
CancelToken 的逻辑
1. 第一步构造 cancelToken对象  和 cancel函数，在请求的 config 中配置上 cancelToken对象，cancel 是一个函数们可以接收取消时候的文字描述，
```javascript
executor(function cancel(message) {
    if (token.reason) {
      // Cancellation has already been requested
      return;
    }

    token.reason = new Cancel(message);
    resolvePromise(token.reason);
  });
```

1. cancel 函数理论上可以在任意地方执行，不过想要拦截请求一般是放在request 拦截器中，请求前的拦截器的实现里不会对cancel做判断，而是在 dispatchRequest 里发起网络请求前做判断 
```javascript
function throwIfCancellationRequested(config) {
  if (config.cancelToken) {
    config.cancelToken.throwIfRequested();
  }
}
CancelToken.prototype.throwIfRequested = function throwIfRequested() {
  if (this.reason) {
    throw this.reason;
  }
};
```
可知，cancel 的时候生成了 cancel 对象，在检查的时候先判断参数中是否配置了cancelToken，在判断是否生成了 cancel 对象，若都符合，则抛出异常，这样一来后续的请求将不会发送，response 的成功回调也不会执行。


### 客户端支持防御 XSRF
https://tech.meituan.com/2018/10/11/fe-security-csrf.html
双重cookie验证，在原先登录凭证 cookie 的前提下，新增一个由接口或页面写入到 cookie 的值，在发起请求的时候，在从 cookie 中获取到这个值写入到请求头上。
axios 的 xsrf 配置就是用于简化获取cookie中的值和写入header中的这两步操作。
代码实现上比较简单
```javascript
// Add xsrf header
var xsrfValue = (config.withCredentials || isURLSameOrigin(fullPath)) && config.xsrfCookieName ?
  cookies.read(config.xsrfCookieName) :
  undefined;

if (xsrfValue) {
  requestHeaders[config.xsrfHeaderName] = xsrfValue;
}
```
tips： axios 封装的 cookies 可以借鉴用于项目中

### paramsSerializer 序列化的作用？ 为什么需要序列化

## todo
application/x-www-form-urlencoded  输出的数据格式是什么样的？


## 有意思的工具类
1. utils.forEach