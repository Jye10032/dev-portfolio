---
title: "call、apply 与 bind 的实现边界"
publishDate: "2026-01-21"
type: note
draft: false
tags: ["题解", "JavaScript", "this"]
excerpt: "把函数临时挂到对象上只能解释基本原理；要接近原生行为，还要处理 falsy 值、异常清理、基本类型和构造调用。"
readingTime: 4
---

手写 `call` 和 `apply` 最常见的思路，是用 `Symbol` 把函数临时挂到目标对象上，调用后再删除：

```js
const key = Symbol();
target[key] = fn;
const result = target[key](...args);
delete target[key];
```

这个写法能说明 `this` 绑定的直觉，但原始练习里还有几个边界。

## `obj || window` 不等于默认 this

`0`、空字符串和 `false` 都是合法的 `thisArg`，却会被 `obj || window` 错误替换。更准确的判断应只针对 `null` 和 `undefined`，并通过 `Object(obj)` 包装基本类型。

临时属性也需要放进 `try...finally`。否则原函数一旦抛错，属性不会被删除。冻结对象、不可扩展对象同样无法使用“挂属性”方案，这也是它更适合解释原理，而不是充当生产级 polyfill 的原因。

## `bind` 不只是参数拼接

基础版本可以合并预置参数和调用参数，但原生 `bind` 还支持构造调用：

```js
const Bound = Constructor.bind(context, firstArg);
const instance = new Bound(secondArg);
```

此时显式绑定的 `context` 应被忽略，新对象要继承原函数的 `prototype`。因此判断 `this instanceof bound`、维护原型链和返回构造函数显式返回的对象，才是这道题真正困难的部分。

这类手写题的价值不是替代原生 API，而是用测试反推语言契约：普通调用、异常、基本类型和 `new`，每一种调用方式都在约束实现。
