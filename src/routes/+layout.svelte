<script lang="ts">
	import { Button } from '$lib/components/ui/button/';
	import UtensilsIcon from '@lucide/svelte/icons/utensils';
	import * as Breadcrumb from '$lib/components/ui/breadcrumb/';
	import '../app.css';

	let { children } = $props();
</script>

<nav class="bg-zinc-50 py-2 shadow-sm">
	<div class="container mx-auto px-3 md:px-6">
		<div class="flex flex-row justify-between gap-2">
			<div></div>
			<div>
				<a href="/" class="flex flex-row items-center gap-3">
					<UtensilsIcon class="stroke-foreground h-8 w-8 stroke-3 drop-shadow-sm" />
					<h1 class="font-styled pt-2 text-orange-500 text-shadow-sm">Rezeptly</h1>
				</a>
			</div>
			<div class="flex flex-row items-center">
				<Button href="/create">+ Create</Button>
			</div>
		</div>
	</div>
</nav>
<div class="container mx-auto my-6 px-3 md:px-6">
	{@render children()}
</div>
