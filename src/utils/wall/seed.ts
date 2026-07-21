/**
 * 首次访问时的示例墙。
 * 只在 loadWall() 返回 null 时由调用方生成并落盘一次。
 */

import type { WallState } from './types';

export function buildSeedWall(): WallState {
    const now = Date.now();
    return {
        version: 1,
        selectedId: null,
        notes: [
            {
                id: 'seed-1',
                content: '欢迎来到便利贴墙 👋\n双击我可以编辑文字。',
                color: 'yellow',
                style: 'plain',
                size: 'md',
                x: 60,
                y: 80,
                zIndex: 1,
                icon: '👋',
                createdAt: now,
                updatedAt: now
            },
            {
                id: 'seed-2',
                content: '拖动我,换个位置。\n刷新页面后我还会在这里。',
                color: 'mint',
                style: 'plain',
                size: 'md',
                x: 320,
                y: 140,
                zIndex: 2,
                icon: null,
                createdAt: now,
                updatedAt: now
            },
            {
                id: 'seed-3',
                content: '选中我,\n右侧可以换颜色、样式和大小。',
                color: 'blue',
                style: 'plain',
                size: 'sm',
                x: 200,
                y: 300,
                zIndex: 3,
                icon: null,
                createdAt: now,
                updatedAt: now
            },
            {
                id: 'seed-4',
                content: '点左上角 + 新建,\n把灵感随手记下来。',
                color: 'coral',
                style: 'plain',
                size: 'lg',
                x: 480,
                y: 320,
                zIndex: 4,
                icon: '💡',
                createdAt: now,
                updatedAt: now
            }
        ]
    };
}
