---
title: "cin和getline"
publishDate: "2024-06-06 17:21:51"
type: note
draft: false
tags: ["C++", "Bug"]
excerpt: "关于 cin 和 getline 的缓冲区问题"
---

在使用 cin 后使用 getline 无法正常读入数据：

* getline()中的结束符，结束后，结束符不放入缓存区;
* cin的结束符，结束后，结束符还在缓存区；

所以在使用 cin 后若要使用 getline() 必须要把前面cin遗留的结束符处理掉。

解决方法：

1. 在使用getline（）之前，加入一行getline（）来处理cin留下的结束符
2. 在 cin 后加入 cin.ignore()
