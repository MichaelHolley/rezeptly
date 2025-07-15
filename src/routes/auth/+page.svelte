<script>
	import { enhance } from '$app/forms';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import LoginIcon from '@lucide/svelte/icons/log-in';
</script>

<form method="POST" class="mx-auto flex max-w-sm flex-col gap-4" use:enhance>
	<Input type="password" name="password" placeholder="Password" />
	<div class="flex flex-row justify-center">
		<Button type="submit"><LoginIcon />Login</Button>
	</div>
</form>
