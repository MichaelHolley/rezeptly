<script lang="ts">
	const { message } = $props<{ message: string }>();
</script>

<div class="mt-12 flex flex-col items-center justify-center">
	<h2 class="text-2xl text-red-500">ooops... :/</h2>
	<h3 class="text-redh300 mt-4 text-xl">We ran into an issue.</h3>
	<p class="mt-2">Reason: {message}</p>
</div>
