# Vue-Recursion

This is a renderless component that handles the recursion logic and expects the render template as its children.

## Installation

```cmd
npm install vue-recursion
```

## Use

To use the component, import it and pass as the prop `node` the root node.

```vue

<script lang="ts" setup>
import Recursion from 'vue-recursion';
import { reactive } from 'vue';
//...

const nested_list_data = reactive({
  title : "title 1",
  href : "title-1",
  sections : [{
    title : "title 1.1",
    href : "title-1-1",
  },
  {
    title : "title 1.2",
    href : "title-1-2",
    sections : [{
      title : "title 1.2.1",
      href : "title-1-2-1",
    },{
      title : "title 1.2.2",
      href : "title-1-2-2",
    }]
  },
  {
    title : "title 1.3",
    href : "title-1-3",
  }]
});
</script>

```  

### Simple nested list example

The most basic recursion example in web are nested list. This is a way of displaying them using the Recursion Component.

```vue
<template>
  <ul class="list">
    <Recursion :node="nested_list_data" v-slot="{ data, slot, depth, index }">
      <li>
        <a :href="data.href">{{ data.title }}</a>
        <ul class="list" v-if="data.sections?.length">
          <component v-for="child, i of data.sections" :is="slot" :node="child" :index="i" :key="child.href"/>
        </ul>
      </li>
    </Recursion>
  </ul>
</template>
```

```html
<!--output-->
<ul class="list">
  <li><a href="title-1">title 1</a>
    <ul class="list">
      <li><a href="title-1-1">title 1.1</a><!--v-if--></li>
      <li><a href="title-1-2">title 1.2</a>
        <ul class="list">
          <li><a href="title-1-2-1">title 1.2.1</a><!--v-if--></li>
          <li><a href="title-1-2-2">title 1.2.2</a><!--v-if--></li>
        </ul>
      </li>
      <li><a href="title-1-3">title 1.3</a><!--v-if--></li>
    </ul>
  </li>
</ul>
```

As shown, the component receives ~~the data as a `tree structure`~~ any `Record<string, unknown>` and the rendering template as a child (this case is `<li>...</li>`), then ~~exposes the *children* recursive elements in the form of the `component` v-slot~~ you can use any node attribuite as children to iterate.

### Custom recursion wrapper

~~In the previous example, the `<component>` renders the child elements of each iteration of the recursion as `fragments`.~~
~~However, in order to allow more customization in the way a component is rendered, the `<Recursion>` component also exposes the `components` as an iterable array. This allows the component to have a `root-node` element that can later be used to be animated using the [Transition Group](https://vuejs.org/guide/built-ins/transition-group.html) built-in component~~.

In case a dedicated wrapper is desired around the next rendered iteration, the `<component :is="slot"/>` can be rendered as a nested child inside the iteration


```vue
<template>
  <ul class="list">
    <li>
      <Recursion :node="nested_list_data" v-slot="{ data, slot, depth, index }">
        <a :href="data.href">{{ data.title }}</a>
        <TransitionGroup name="list" tag="ul" class="list" v-if="data.sections?.length">
          <li v-for="child, i in data.sections" :key="c.href"> 
            <component :is="slot" :node="child" />
          </li>
        </TransitionGroup>
      </Recursion>
    </li>
  </ul>
</template>
```

### Use with custom component

Of course, the `Recursion` component allows the use of custom components as children.

```vue
<script lang="ts" setup>
//Link
const p = defineProps<{
  href : string;
  title : string;
}>();  
</script>

<template>
  <a :href="data.href">{{ data.title }}</a>
</template>
```

```vue
<template>
  <ul class="list">
    <Recursion :node="nested_list_data" v-slot="{ data, slot, depth, index }">
      <li>
        <Link :data />
        <ul class="list" v-if="data.sections?.length">
          <component v-for="child, i of data.sections" :is="slot" :node="child" :index="i" :key="child.href"/>
        </ul>
      </li>
    </Recursion>
  </ul>
</template>
```

Now, something **very** important here is the `key` property in the data objects when using non primitive values as items for the tree.

## Guide

This component removes the operations down interally in exchange of a more flexible aproach. There'd cases where the component may render childs from an attribuite named `sections`, `children`, etc. or may have a more complex schema. For this cases, the previous implementation was not usable, since i'd require an extra parsing step.

Now, the component only exposes the `v-slot` as
```ts
type t_slotprops<T> = {
  data : T,
  slot : unknown,
  depth : number,
  index : number,
  chain : number[],
};
```

| Property | Type | description |
|---|---|---|
| data | T | this is the node itself, at depth 0 (the root node) is the same value passed as `node` prop |
| slot | unknown | this is the next-recursion iteration's `render function`, pass it as the `is` prop to `<component/>` |
| depth | number | The node's depth. The root node's `depth` is 0 |
| index | number | The node's index. The root node's `index` is 0, this is handled manually by the template-defined render logic |
| chain | Array<number> | The node's absolute path. The root node's `chain` is [], this is handled manually by the component |

This component uses vue's generics to infer the node's type. It may not always work tho.

It is not required, but heavily recommended to have a `key` property of type `propertyKey` to be used as `key` prop for the iteration of node's children.

## Common mistakes

this new aproach is more flexible, which means it is easier to make mistakes; therefore, some suggestions you could use are:

- The inner slot of the `<Recursion/>` is the template used in each iteration
- You can use any property as an iterable for the next recursion level, but it is best if it is an `Array<T>` and has an _array-suggestive name_ such as _sections_, _children_, _items_.
- The outer wrapper around the `<Recursion/>` in important too. Remember that the prop passed to `<Recursion/>` is the root of the tree; however, in most cases, the root shares similar styling to the rest of the nodes which means that, if its a `<li/>`, it requires an outer `<ul/>` (`<ol/>`)

## Considerations

- ~~There's no longer a `chain` property on slot props, this property caused some rerenders that affected performance. It may be added back in the future if said performance issues get fixed~~
- the `chain` property is back; use with caution
- Exports are now `cjs` and `esm` rather than `umd`
- This package is now part of a monorepo of renderless components [zcomps-monorepo](https://github.com/SebasZwolf/zcomps-monorepo.git). However, this should not represent any change for the user
- Also, we changed `\t` into `  ` in the `README.md`. It look better, doesnt' it?