<template>
	<div>
		<button @click="handleClick">send it!</button>
		<p v-if="busy">waiting for user response...</p>
	</div>

	<RenderlessModal ref="$modal" v-slot="{ data, resolve, reject } : slot_props<number>">
		<fieldset>
			<legend>es {{ data }} su numero?</legend>
			<button @click="resolve(data - 1)">uno menos</button>
			<button @click="resolve()">sí</button>
			<button @click="resolve(data + 1)">uno más</button>
			<button @click="reject">not me!</button>
		</fieldset>
	</RenderlessModal>

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
			<button @click="handleClickWithin({ show })">send it!</button>
		</template>

	</RenderlessModal>

</template>

<script setup lang="ts">
	import { ref } from 'vue';
	import RenderlessModal, { type slot_props } from '../src/RenderlessModal.vue';
	
	type t_RenderlessModal = InstanceType<typeof RenderlessModal>;

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
				e => console.log(`${e ?? n} era el numero!`),
				() => console.log(`${n} no era el numero!`)
			);
	});

	const { fn : handleClickWithin } = useFixedFn(({ show } : Pick<t_RenderlessModal, 'show'>) => {
		return show<Event>(Math.ceil(Math.random() * 10))
			.then(e => {
					const $data = new FormData(e.target as HTMLFormElement);
					console.log(`${$data.get("val")} es el numero!`);
				},
				() => console.log(`no encontramos el numero!`)
			);
	})

</script>