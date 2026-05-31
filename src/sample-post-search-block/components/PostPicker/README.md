# PostPicker Components

A set of components for selecting WordPress posts within the block editor. Provides a searchable, filterable modal with support for taxonomy filtering, pagination, and a configurable selection limit.

---

## `PostPickerModal`

The core modal UI. Renders a browse panel with search, taxonomy filters, and paginated results. Selection is staged — changes are only committed when the user clicks the confirm button, and closing the modal discards pending changes.

### Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `title` | `string` | — | Modal heading text. |
| `postType` | `string` | `'post'` | The post type to query. |
| `taxonomies` | `string[]` | `[]` | Taxonomy slugs to show as filters (e.g. `['category', 'post_tag']`). |
| `values` | `number[]` | `[]` | Currently selected post IDs. |
| `maxItems` | `number` | `Infinity` | Maximum number of posts that can be selected. |
| `onChange` | `(ids: number[]) => void` | — | Called with the confirmed selection when the user clicks the confirm button. |
| `setModalOpen` | `(open: boolean) => void` | — | Called with `false` to close the modal. |

### Example

```jsx
<PostPickerModal
    title="Select a Post"
    postType="post"
    taxonomies={ [ 'category', 'post_tag' ] }
    values={ selectedIds }
    maxItems={ 3 }
    onChange={ ( ids ) => setAttributes( { postIds: ids } ) }
    setModalOpen={ setModalOpen }
/>
```

---

## `PostPickerButton`

A primary button that opens `PostPickerModal` when clicked. Use this for sidebar or inline placement.

### Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `title` | `string` | `'Select post'` | Button label and modal heading. |
| `postType` | `string` | — | The post type to query. |
| `taxonomies` | `string[]` | — | Taxonomy slugs to show as filters. |
| `values` | `number[]` | — | Currently selected post IDs. |
| `maxItems` | `number` | `Infinity` | Maximum number of posts that can be selected. |
| `onChange` | `(ids: number[]) => void` | — | Called with the confirmed selection. |

### Example

```jsx
<PostPickerButton
    title="Select Posts"
    postType="post"
    taxonomies={ [ 'category' ] }
    values={ postIds }
    maxItems={ 1 }
    onChange={ ( ids ) => setAttributes( { postIds: ids } ) }
/>
```

---

## `PostPickerToolbarButton`

A toolbar button variant of the post picker. Renders a `ToolbarButton` intended for use inside a `ToolbarGroup` within `BlockControls`.

### Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `title` | `string` | `'Select post'` | Button label and modal heading. |
| `icon` | `string` | `'edit'` | Dashicon slug for the toolbar button icon. |
| `postType` | `string` | — | The post type to query. |
| `taxonomies` | `string[]` | — | Taxonomy slugs to show as filters. |
| `values` | `number[]` | — | Currently selected post IDs. |
| `maxItems` | `number` | `Infinity` | Maximum number of posts that can be selected. |
| `onChange` | `(ids: number[]) => void` | — | Called with the confirmed selection. |

### Example

```jsx
<BlockControls>
    <ToolbarGroup>
        <PostPickerToolbarButton
            title="Select Posts"
            postType="post"
            taxonomies={ [ 'category', 'post_tag' ] }
            values={ postIds }
            maxItems={ 3 }
            onChange={ ( ids ) => setAttributes( { postIds: ids } ) }
        />
    </ToolbarGroup>
</BlockControls>
```
