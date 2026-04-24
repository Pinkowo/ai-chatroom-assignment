# 可重複使用元件表

> 所有元件定義在 `design/design.pen` → Component Kit frame (`Muh61`)
> 在 Pencil 使用 `{ type: "ref", ref: "<node-id>" }` 建立實例

---

## Btn/Primary

| 屬性 | 值 |
|------|----|
| Node ID | `mmvpj` |
| 尺寸 | fit-content × fit-content |
| Padding | 12px 上下 / 20px 左右 |
| Border Radius | 8px |
| Background | `$teal-500` (#3A7679) |
| Label color | #ffffff |
| Font size | 14px (sm) |
| Font weight | 500 |

**適用場景：** 主要操作、送出表單、確認動作

---

## Btn/Secondary

| 屬性 | 值 |
|------|----|
| Node ID | `4KbqA` |
| 尺寸 | fit-content × fit-content |
| Padding | 12px 上下 / 20px 左右 |
| Border Radius | 8px |
| Background | #ffffff |
| Border | 1.5px `$teal-400` (#4A979B) |
| Label color | `$teal-600` (#2E5E60) |
| Font size | 14px (sm) |
| Font weight | 500 |

**適用場景：** 次要操作、取消、返回

---

## Btn/Ghost

| 屬性 | 值 |
|------|----|
| Node ID | `zGfP4` |
| 尺寸 | fit-content × fit-content |
| Padding | 12px 上下 / 20px 左右 |
| Background | 無 |
| Border | 無 |
| Label color | `$teal-600` (#2E5E60) |
| Font size | 14px (sm) |
| Font weight | 500 |

**適用場景：** 低優先度操作、連結式按鈕

---

## Btn/Danger

| 屬性 | 值 |
|------|----|
| Node ID | `CmGK0` |
| 尺寸 | fit-content × fit-content |
| Padding | 12px 上下 / 20px 左右 |
| Border Radius | 8px |
| Background | `$red-500` (#C71A1A) |
| Label color | #ffffff |
| Font size | 14px (sm) |
| Font weight | 500 |

**適用場景：** 刪除、危險操作警示

---

## Btn/Icon

| 屬性 | 值 |
|------|----|
| Node ID | `3hM76` |
| 尺寸 | 40 × 40px |
| Border Radius | 8px |
| Background | `$teal-500` (#3A7679) |
| Icon | `paper-plane` — Font Awesome 6 Duotone (solid style) |
| Icon color | #ffffff |
| Icon size | 18px |

**適用場景：** 訊息送出按鈕、工具列 icon 操作

**Override 範例：**
```js
I(parent, {
  type: "ref",
  ref: "3hM76",
  descendants: {
    "za1b5/CvN8v": { content: "magnifying-glass#" }
  }
})
```

---

## Input/Default

| 屬性 | 值 |
|------|----|
| Node ID | `1p4g8` |
| 寬度 | 280px (可 override 為 fill_container) |
| Padding | 12px 上下 / 16px 左右 |
| Border Radius | 8px |
| Background | #ffffff |
| Border | 1px `$gray-300` (#C6CDD0) |
| Placeholder color | `$gray-400` (#ABB5BA) |
| Font size | 14px (sm) |

**Override 範例：**
```js
I(parent, {
  type: "ref",
  ref: "1p4g8",
  width: "fill_container",
  descendants: { "JP62F": { content: "搜尋..." } }
})
```

---

## Badge/Default

| 屬性 | 值 |
|------|----|
| Node ID | `7pwq0` |
| Padding | 4px 上下 / 10px 左右 |
| Border Radius | 99px (pill) |
| Background | `$teal-50` (#CBE5E6) |
| Label color | `$teal-700` (#264D4F) |
| Font size | 12px (xs) |
| Font weight | 500 |

**Override 範例：**
```js
I(parent, {
  type: "ref",
  ref: "7pwq0",
  descendants: { "7Jpo1": { content: "New", fill: "$green-700" } },
  fill: "$green-50"
})
```

---

## Avatar/Default

| 屬性 | 值 |
|------|----|
| Node ID | `Aef8m` |
| 尺寸 | 36 × 36px |
| Border Radius | 99px (circle) |
| Background | `$teal-100` (#A9D4D6) |
| Label color | `$teal-700` (#264D4F) |
| Font size | 14px (sm) |
| Font weight | 600 |

**適用場景：** 使用者頭像縮寫、對話列表頭像

---

## ChatBubble/User

| 屬性 | 值 |
|------|----|
| Node ID | `6SaRO` |
| Padding | 12px 上下 / 16px 左右 |
| Border Radius | 16 16 4 16px（右下角尖） |
| Background | `$teal-500` (#3A7679) |
| Text color | #ffffff |
| Font size | 14px (sm) |
| Text width | 220px (fixed-width) |

**適用場景：** 使用者傳送的訊息泡泡（右對齊）

---

## ChatBubble/AI

| 屬性 | 值 |
|------|----|
| Node ID | `kdprP` |
| Padding | 12px 上下 / 16px 左右 |
| Border Radius | 16 16 16 4px（左下角尖） |
| Background | `$gray-50` (#EBEEEF) |
| Border | 1px `$gray-200` (#D5DADC) |
| Text color | `$gray-900` (#2E3538) |
| Font size | 14px (sm) |
| Text width | 220px (fixed-width) |

**適用場景：** AI 回覆的訊息泡泡（左對齊）
