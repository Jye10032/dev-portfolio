---
title: "用一次渲染理解 React Hooks"
publishDate: "2026-01-21"
type: note
draft: false
tags: ["题解", "React", "Hooks"]
excerpt: "Hooks 的区别不在 API 名称，而在一次渲染中哪些值会被保留、哪些变化会触发下一次渲染，以及副作用何时清理。"
readingTime: 4
---

把常用 Hooks 放进同一个组件，最容易看到它们各自管理的东西：

- `useState` 保存会驱动重新渲染的状态；
- `useRef` 保存跨渲染持续存在、但修改后不触发渲染的值；
- `useEffect` 在提交后同步外部系统，并用返回函数清理；
- `useMemo` 缓存计算结果；
- `useCallback` 缓存函数引用；
- `useContext` 从上层 Provider 读取共享值。

## 两个容易误解的示例

用 `renderCount.current++` 统计渲染次数只能做观察，不能作为业务逻辑。在 Strict Mode 的开发环境中，React 可能故意重复执行渲染以暴露副作用，计数不会等同于用户看到的提交次数。

`useCallback` 也不会凭空减少子组件渲染。只有子组件通过 `memo` 等方式比较 props，并且函数引用确实是导致重复渲染的因素时，稳定引用才可能带来收益。

判断是否使用某个 Hook，可以先问三个问题：这个值是否影响界面？修改它是否应该触发渲染？它是否需要与组件外部保持同步？比背诵 API 更可靠。
