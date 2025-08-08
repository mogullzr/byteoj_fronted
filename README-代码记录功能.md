# 代码记录功能使用说明

## 功能概述

代码记录功能能够记录用户在代码编辑器中的每一个操作，包括字符输入、删除、光标移动、撤销/重做等操作。数据同时保存到数据库和本地，支持ACWing挑战模式格式导出。

## 数据库表结构

```sql
create table problem_records
(
    id          bigint auto_increment comment 'ID'
        primary key,
    type        tinyint                            not null comment '操作类型',
    old_row     int                                null comment '旧行',
    old_col     int                                null comment '旧列',
    new_row     int                                null comment '新行',
    new_col     int                                null comment '新列',
    content     text                               null comment '内容',
    timestamp   bigint   default 0                 not null comment '距离开始操作的时间',
    create_time datetime default CURRENT_TIMESTAMP not null comment '创建时间',
    update_time datetime default CURRENT_TIMESTAMP not null comment '更新时间',
    is_delete   tinyint  default 0                 null comment '逻辑删除'
);
```

## 操作类型说明

| 类型值 | 操作类型 | 说明 |
|--------|----------|------|
| 0 | INSERT | 字符插入 |
| 1 | DELETE | 字符删除 |
| 2 | CURSOR_MOVE | 光标移动 |
| 3 | PASTE | 粘贴操作 |
| 4 | UNDO | 撤销操作 |
| 5 | REDO | 重做操作 |
| 6 | CLEAR | 清空编辑器 |

## 数据库记录格式示例

### 字符插入操作
```json
{
  "type": 0,
  "old_row": null,
  "old_col": null,
  "new_row": 0,
  "new_col": 5,
  "content": "h",
  "timestamp": 1500,
  "problem_id": "123",
  "user_id": "user_uuid"
}
```

### 字符删除操作
```json
{
  "type": 1,
  "old_row": 0,
  "old_col": 5,
  "new_row": 0,
  "new_col": 6,
  "content": "h",
  "timestamp": 2000,
  "problem_id": "123",
  "user_id": "user_uuid"
}
```

### 光标移动操作
```json
{
  "type": 2,
  "old_row": 0,
  "old_col": 5,
  "new_row": 1,
  "new_col": 0,
  "content": null,
  "timestamp": 2500,
  "problem_id": "123",
  "user_id": "user_uuid"
}
```

## ACWing 格式说明

本地也会生成ACWing挑战模式格式的记录数组，用于导出和兼容：

```javascript
// 字符插入: [0, row, col, character, timestamp]
[0, 0, 0, "h", 1500]

// 字符删除: [1, startRow, startCol, endRow, endCol, timestamp]  
[1, 0, 5, 0, 6, 2000]

// 光标移动: [2, fromRow, fromCol, toRow, toCol, timestamp]
[2, 0, 5, 1, 0, 2500]
```

## 使用方法

1. **自动记录**: 在代码编辑器中的所有操作都会自动记录
2. **查看记录**: 点击设置按钮 → 代码记录功能 → 预览记录
3. **导出记录**: 点击"导出记录"按钮，会将ACWing格式复制到剪贴板
4. **导入记录**: 点击"导入记录"按钮，粘贴ACWing格式数据
5. **清空记录**: 点击"清空记录"按钮清空本地记录
6. **查看格式**: 点击"数据库格式示例"查看数据库记录格式

## 技术实现

- **前端**: Vue 3 + TypeScript
- **编辑器**: Ace Editor
- **记录方式**: 字符级别记录，实时保存
- **存储**: 
  - 数据库：单条记录实时保存
  - 本地：ACWing格式数组，用于导出
- **防抖**: 光标移动使用300ms防抖
- **时间戳**: 基于操作开始时间的相对时间戳

## 后端API (需要实现)

```typescript
// 保存单条记录到数据库
ProblemAlgorithmControllerService.saveProblemRecordUsingPost({
  problem_id: string,
  user_id: string,
  type: number,
  old_row: number | null,
  old_col: number | null,
  new_row: number | null,
  new_col: number | null,
  content: string | null,
  timestamp: number
})
```

## 注意事项

1. 每个字符输入都会产生一条记录
2. 多字符粘贴会拆分为多条单字符记录
3. 记录包含完整的编程过程，可用于代码回放分析
4. 本地记录仅用于ACWing格式导出，实际存储以数据库为准
5. 光标移动使用防抖，避免过多记录

## 应用场景

- 编程过程分析
- 代码编写习惯研究  
- 在线编程竞赛记录
- 教学过程分析
- 代码审查和回放