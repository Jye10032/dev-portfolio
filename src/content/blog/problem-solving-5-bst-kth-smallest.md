---
title: "二叉搜索树第 k 小的节点"
publishDate: "2026-01-21"
type: note
draft: false
tags: ["题解", "算法", "二叉搜索树"]
excerpt: "二叉搜索树的中序遍历天然有序；访问到第 k 个节点即可提前停止，不必先生成完整数组。"
readingTime: 3
---

二叉搜索树满足“左子树 < 当前节点 < 右子树”。因此中序遍历得到的访问顺序就是升序，第 `k` 次访问的节点正是答案。

```js
function kthSmallest(root, k) {
  let visited = 0;
  let answer;

  function inorder(node) {
    if (!node || answer !== undefined) return;
    inorder(node.left);
    if (++visited === k) {
      answer = node.val;
      return;
    }
    inorder(node.right);
  }

  inorder(root);
  return answer;
}
```

原始实现用 `result !== null` 提前结束递归，思路是正确的。修正版改用 `undefined` 区分“尚未找到”，避免节点值本身可能为 `null` 时产生歧义。

最坏情况下仍需访问 `O(n)` 个节点，递归栈为 `O(h)`；如果树高可能很大，可以改用显式栈迭代。若树支持频繁查询，则可以在节点上维护子树大小，把单次查询进一步降到与树高相关。
