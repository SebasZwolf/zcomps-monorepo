<script setup lang="ts">
import { shallowReactive } from 'vue';

const s = defineSlots<{
	default(p : slot_props) : any;
	control?(p : { show : typeof show }) : any;
}>();
 
function show<G = unknown, D = unknown>(data? : D) : Promise<G> {
	const { promise, reject, resolve } = Promise.withResolvers<G>();
	
	const state = { reject, resolve, data };
	forms.push(state);

	return promise
		.finally(() => forms.splice(forms.findLastIndex(e => e === state), 1));
}

defineExpose({ show });


export type slot_props<D = any> = {
	resolve(e? : any) : void;
	reject() : void;

	data : D;
};

const forms = shallowReactive<Array<slot_props>>([]);

</script>

<template>
	<slot v-for="o of forms" name="default" v-bind="o"/>
	<slot name="control" :show/>
</template>