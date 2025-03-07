# Vue-Renderless-Modal

This is a renderless component that handles the modal logic in a `Promise` friendly way.

## Installation

```cmd
npm install vue-rless-modal
```

## Use

To use the component, import it and pass as the modal template as the **default slot**.

### Trigger the component programatically

You can use the _exposed_ method `show()` to trigger the interaction. This method returns a `Promise` that resolves to which ever value is resolved from the interaction.

```vue

<script lang="ts" setup>
  import { ref } from 'vue';
  import RenderlessModal, { type slot_props } from '../src/RenderlessModal.vue';

  const $modal = ref<InstanceType<typeof RenderlessModal>>(null!);

  function handleClick() {
    const n : number = Math.ceil(Math.random() * 10);
    
    $modal.value.show<number,number>(n)
      .then(
        e => console.log(`${e ?? n} was the number!`),
        () => console.log(`${n} wasn't the number!`)
      );
  }
</script>

<template>
  <RenderlessModal ref="$modal" v-slot="{ data, resolve, reject } : slot_props<number>">
    <fieldset>
      <legend>is {{ data }} your number?</legend>
      <button @click="resolve(data - 1)">-1</button>
      <button @click="resolve()">yes</button>
      <button @click="resolve(data + 1)">+1</button>
      <button @click="reject">no!</button>
    </fieldset>
  </RenderlessModal>

  <div>
    <button @click="handleClick">ask it!</button>
  </div>
</template>

```

### Trigger the component within the template

you can also access the `show()` hook within the **control slot** scoped slot props

```vue
<template>
  <RenderlessModal>
    <template v-slot="{ data, resolve, reject } : slot_props<number>">
      <dialog :ref="e => (e as HTMLDialogElement)?.showModal()" @close="reject">
        <form method="dialog" @submit.prevent="resolve">

          <p>selecciona tu numero ({{ data - 2 }} - {{data + 2}})</p>

          <div>
            <input name="val" :value="data" type="number" :max="data + 2" :min="data - 2" />
          </div>

          <p>si no lo hay, cancela</p>

          <div>
            <button type="submit">ok</button>
            <button type="reset">reset</button>
            <button type="button" @click="reject">cancel</button>
          </div>
        </form>
      </dialog>
    </template>

    <template #control="{ show }">
      <button @click="show">send it!</button>
    </template>

  </RenderlessModal>
</template>
```
This example, however, is bad because the result of the interaction is lost, so here's a more advance example that handles the `show` method's return value.

```vue

<template>
  <RenderlessModal>
    <template v-slot="{ data, resolve, reject } : slot_props<number>">
      <dialog :ref="e => (e as HTMLDialogElement)?.showModal()" @close="reject">
        <form method="dialog" @submit.prevent="resolve">

          <p>select your number ({{ data - 2 }} - {{data + 2}})</p>

          <div>
            <input name="val" :value="data" type="number" :max="data + 2" :min="data - 2" />
          </div>

          <p>if you can't, cancel</p>

          <div>
            <button type="submit">ok</button>
            <button type="reset">reset</button>
            <button type="button" @click="reject">cancel</button>
          </div>
        </form>
      </dialog>
    </template>

    <template #control="{ show }">
      <button @click="handleShow({ show })">send it!</button>
    </template>

  </RenderlessModal>
</template>
<script setup lang="ts">
  function handleShow({ show } : Pick<t_RenderlessModal, 'show'>) {
    show<Event>(Math.ceil(Math.random() * 10))
      .then(e => {
          const $data = new FormData(e.target as HTMLFormElement);
          console.log(`${$data.get("val")} is the number!`);
        },
        () => console.log(`no number!`)
      );
  }
</script>
```

You may see that this example uses `<dialog/>` component. This is because this component is completly renderless. If you like your content display above the rest of the content, you should manage it yourself. However, you can perfectly copy this example adjust to your needs.

## Guide
 
This component exposes the show method to pop the dialog into existance and returns a `Promise` that resolves to whatever the modal resolves (or rejects).

This component is not opinionated, which mean that the `Element` displayed is responsibility of the dev. Usually, a modal is displayed using the `<dialog/>` element, but using it would mean that this component is not really _renderless_. Also, there may be cases when you don't want to display a dialog, you'd rather display a confirmation box in place or use a different element.

Now, the component exposes the `v-slot` of the **default slot** as
```ts
type slot_props<D = any> = {
  resolve(e? : any) : void;
  reject() : void;

  data : D;
};
```

| Property | Type | description |
|---|---|---|
| resolve | (e?: any) => void | this is the hook that the **default slot** consume to _resolve_ the interaction |
| reject | () => void | this is the hook that the **default slot** consume to _reject_ the interaction |
| data | Data | this are the props that will be pased to the **default** slot (more of this later) |


the component's **control slot** exposes the `v-slot` as
```ts
type control_slot_props = { 
  show : (data? : D) => Promise<any>;
}
```

| Property | Type | description |
|---|---|---|
| show | (data?: D) => void | this is the hook that the **control slot** consume to _trigger_ the interaction |

## Common mistakes

this new aproach is more flexible, which means it is easier to make mistakes; therefore, some suggestions you could use are:

- The easiest way to use this component is with the exposed method `show` rather than the **control slot**
- The component does not provide a native way to avoid multiple triggers. This is done in case you have modal that you'd like to use multiple times in the same page. In case you want to prevent multiple modals showing (blocking the trigger event), i'll leave an example at the end

## Considerations

- This is a pure renderless component, all styling and interaction flow **should be manually defined**.

## Example

```vue

<script lang="ts" setup>

  // this composable prevents calling an async function (by ignoring it) until it's previous call has finished
  function useFixedFn<T extends unknown[]>(handler : (...args : T) => Promise<void>) {
    const busy = ref(false);
    const close = () => busy.value = false;

    return {
      fn(...args : T) {
        if(busy.value) return;
        busy.value = true;

        handler(...args).finally(close);
      },
      busy,
    }
  }

  const $modal = ref<t_RenderlessModal>(null!);

  const { fn : handleClick, busy } = useFixedFn(() => {
    const n : number = Math.ceil(Math.random() * 10);
    
    return $modal.value.show<number,number>(n)
      .then(
        e => console.log(`${e ?? n} was the number!`),
        () => console.log(`${n} wasn't the number!`)
      );
  });

</script>

```