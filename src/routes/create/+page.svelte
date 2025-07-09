<script>
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Textarea } from '$lib/components/ui/textarea';
</script>

<form method="post" class="flex flex-col gap-4">
	<div class="form-group">
		<Label for="name">Name</Label>
		<Input name="name" type="text" placeholder="Name" required />
	</div>
	<div class="form-group">
		<Label>Description</Label>
		<Textarea name="description" placeholder="Short Recipe Description" required />
	</div>
	<div class="flex flex-row justify-end">
		<Button type="submit">+ Create</Button>
	</div>
</form>

<style>
	.form-group {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}
</style>
