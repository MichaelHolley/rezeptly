import { json } from '@sveltejs/kit';

export async function POST({ request }) {
	const data = await request.json();

	console.log(data); // TODO: merge and save instructions

	return json({ status: 200 });
}
