<script lang="ts">
	import '../app.css';
	import CookingPotIcon from '@lucide/svelte/icons/cooking-pot';

	let { children } = $props();
</script>

<nav class="bg-zinc-50 py-2 shadow-sm">
	<div class="container mx-auto px-3 md:px-6">
		<div class=" flex flex-row justify-between">
			<div>
				<a href="/" class="flex flex-row items-center gap-2">
					<CookingPotIcon class="h-8 w-8 stroke-orange-500 stroke-3" />
					<h1>Rezeptly</h1>
				</a>
			</div>
			<div></div>
		</div>
	</div>
</nav>
<div class="container mx-auto my-6 px-3 md:px-6">
	{@render children()}
</div>
