---
title: "数组与树形数据相互转换"
publishDate: "2024-05-20"
type: note
draft: false
tags: ["题解", "JavaScript", "树", "数据结构"]
excerpt: "数组转树的关键是建立 id 索引；树转数组则要先决定遍历顺序，并避免为了输出而修改原树。"
readingTime: 4
---

递归扫描数组可以完成 `arrayToTree`，但每找一层子节点都遍历全部数据，最坏会达到 `O(n²)`。更稳定的做法是先建立索引：

```js
const nodes = new Map(items.map(item => [item.id, { ...item, children: [] }]));
const roots = [];

for (const item of items) {
  const node = nodes.get(item.id);
  const parent = nodes.get(item.parent_id);
  if (parent) parent.children.push(node);
  else roots.push(node);
}
```

这将主体过程降为 `O(n)`，同时也暴露出需要显式决定的异常：父节点不存在怎么办、重复 id 如何处理、数据中出现环时是否拒绝。

## 树转数组不是唯一答案

原始实现先递归 children，再把当前节点压入结果，因此得到后序顺序；它还直接 `delete item.children`，修改了输入树。

如果用于菜单或表格，通常更需要前序顺序。可以先解构出 `children`，把其余字段写入结果，再递归子节点。这样既不修改原对象，也让父节点出现在子节点之前。

题目表面是数据格式转换，真正的契约却包括顺序、不可变性和非法关系处理。先明确这些规则，再选递归或索引实现。
