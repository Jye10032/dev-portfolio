---
title: "map、forEach 与 flat 的边界"
publishDate: "2026-01-21"
type: note
draft: false
tags: ["题解", "JavaScript", "数组"]
excerpt: "循环数组只是起点。回调参数、稀疏数组、空数组和展开深度，决定了手写方法是否真的接近原生语义。"
readingTime: 4
---

原始 `myMap` 把元素原样放进新数组，却没有调用传入的回调。这是手写数组方法时很典型的遗漏：写出了遍历，却没有实现方法的契约。

一个最小可用版本至少需要传递值、索引和原数组：

```js
Array.prototype.myMap = function (callback, thisArg) {
  const result = new Array(this.length);
  for (let index = 0; index < this.length; index++) {
    if (index in this) {
      result[index] = callback.call(thisArg, this[index], index, this);
    }
  }
  return result;
};
```

`index in this` 用来保留稀疏数组的空位。`forEach` 也应跳过这些空位，但不需要收集返回值。

## `flat` 的两个问题

递归展开的思路是对的，但空数组直接 `return` 会得到 `undefined`，外层的扩展运算符随后就会失败。空数组应返回 `[]`。

另外，原生 `flat` 接受展开深度，而不是永远递归到底。实现时可以把 `depth` 随递归递减，只有当 `depth > 0` 且当前值仍是数组时才继续展开。

把三道题放在一起看，会发现“能跑示例”与“符合 API 语义”之间隔着一组边界测试：空输入、稀疏数组、回调上下文和可配置深度。题解应该把这些测试写在实现之前。
