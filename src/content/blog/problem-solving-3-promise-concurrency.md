---
title: "Promise.all、并行执行与并发限制"
publishDate: "2026-01-21"
type: note
draft: false
tags: ["题解", "JavaScript", "Promise", "并发控制"]
excerpt: "Promise.all 负责汇总结果，不负责限制同时运行的任务；并发控制需要接收尚未启动的任务函数，并维护运行数与等待队列。"
readingTime: 5
---

`Promise.all` 解决三个问题：保留输入顺序、等待全部成功，以及在任一任务失败时拒绝。它不会限制并发量，因为传入数组时 Promise 往往已经开始执行。

手写版本最容易漏掉空数组：没有任何回调会增加计数器，所以必须提前 `resolve([])`。判断条件应该是 `items.length === 0`，而不是把数字与 `[]` 比较。

## 为什么限流器接收函数

想控制并发，队列里必须存放尚未启动的 `() => Promise`：

```js
const launch = () => {
  while (running < limit && queue.length > 0) {
    const job = queue.shift();
    running++;

    Promise.resolve()
      .then(job.task)
      .then(job.resolve, job.reject)
      .finally(() => {
        running--;
        launch();
      });
  }
};
```

`Promise.resolve().then(job.task)` 很重要。若直接调用 `job.task().then(...)`，任务同步抛错时不会进入后面的 `finally`，`running` 无法归还，队列可能永久少一个执行槽。

另一个原始练习把回调参数也命名为 `res`，覆盖了外层结果数组，随后执行 `res[cur] = res`。这是变量遮蔽造成的直接错误。并发代码同时管理索引、结果、运行数和异常，命名必须让这些状态彼此区分。

因此可以把边界划清：`Promise.all` 是结果聚合器；任务队列才是调度器。两者可以组合，但不应该混成一个含义模糊的函数。
