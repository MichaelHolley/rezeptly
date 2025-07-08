<script>
	import { Button } from '$lib/components/ui/button';
</script>

<form method="post" class="flex flex-col gap-4">
	<label>
		Name
		<input name="name" type="text" placeholder="Name" required />
	</label>
	<label>
		Description
		<input name="description" type="text" placeholder="Description" required />
	</label>
	<label>
		Targeted Persons
		<input name="targetedPersons" type="number" placeholder="Targeted Persons" required />
	</label>
	<div class="flex flex-row">
		<Button type="submit">+ Create</Button>
	</div>
</form>
