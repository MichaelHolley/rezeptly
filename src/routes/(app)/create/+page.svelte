<script>
	import BreadcrumbComponent from '$lib/components/common/BreadcrumbComponent.svelte';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Textarea } from '$lib/components/ui/textarea';
	import { createNewRecipe } from './page.remote';
</script>

<BreadcrumbComponent breadcrumbs={[{ name: 'Create Recipe', href: '/create' }]} />

<form {...createNewRecipe} class="flex flex-col gap-4">
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
