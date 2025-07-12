<script>
	import * as Breadcrumb from '$lib/components/ui/breadcrumb/';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Textarea } from '$lib/components/ui/textarea';
</script>

<Breadcrumb.Root class="mb-4">
	<Breadcrumb.List>
		<Breadcrumb.Item>
			<Breadcrumb.Link href="/">Home</Breadcrumb.Link>
		</Breadcrumb.Item>
		<Breadcrumb.Separator />
		<Breadcrumb.Item>
			<Breadcrumb.Link href="/create">Create Recipe</Breadcrumb.Link>
		</Breadcrumb.Item>
	</Breadcrumb.List>
</Breadcrumb.Root>

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
