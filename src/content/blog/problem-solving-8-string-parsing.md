---
title: "版本号、URL 与数字格式化"
publishDate: "2024-05-16"
type: note
draft: false
tags: ["题解", "JavaScript", "字符串"]
excerpt: "三个字符串处理练习的共同点，是先定义输入契约：缺失段、编码字符、负数和小数都不能靠示例之外的运气。"
readingTime: 4
---

比较点分版本号时，可以补齐较短数组再逐段比较，但要明确是否只支持纯数字版本。若需要处理 `1.0.0-beta`，就应该采用语义化版本规则，而不是继续增加 `parseInt` 特判。

解析 URL 查询参数时，手动 `split('?')` 和 `split('&')` 会遗漏编码、重复参数、空值和 hash。浏览器与现代 Node.js 已提供结构化 API：

```js
const url = new URL(input);
const value = url.searchParams.get('name');
const allValues = url.searchParams.getAll('tag');
```

千分位格式化的循环正则可以处理常见正数、小数和负数，但展示层更适合使用 `Intl.NumberFormat`，因为分隔符、小数位和地区规则本来就是本地化问题。

```js
new Intl.NumberFormat('zh-CN').format(123121245.45);
```

手写解析仍然有训练价值，但生产代码应优先选择已经编码了边界规则的标准库。知道什么时候停止手写，也是题解的一部分。
