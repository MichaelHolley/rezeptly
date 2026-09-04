<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Spinner } from '$lib/components/ui/spinner';
	import { Textarea } from '$lib/components/ui/textarea';
	import {
		diffLists,
		type AssistantDetailsProposal,
		type AssistantToolResult,
		type RecipeAssistantMessage
	} from '$lib/shared/recipe-assistant';
	import { Chat } from '@ai-sdk/svelte';
	import BotIcon from '@lucide/svelte/icons/bot';
	import CheckIcon from '@lucide/svelte/icons/check';
	import RotateCcwIcon from '@lucide/svelte/icons/rotate-ccw';
	import SendIcon from '@lucide/svelte/icons/send';
	import SquareIcon from '@lucide/svelte/icons/square';
	import XIcon from '@lucide/svelte/icons/x';
	import { untrack } from 'svelte';
	import {
		DefaultChatTransport,
		isToolUIPart,
		lastAssistantMessageIsCompleteWithApprovalResponses
	} from 'ai';

	const {
		recipeId,
		onApplied
	}: {
		recipeId: number;
		onApplied: (result: Extract<AssistantToolResult, { status: 'applied' }>) => void;
	} = $props();

	let open = $state(false);
	let input = $state('');
	const assistantRecipeId = untrack(() => recipeId);

	const chat = new Chat<RecipeAssistantMessage>({
		transport: new DefaultChatTransport({ api: `/api/recipes/${assistantRecipeId}/assistant` }),
		sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithApprovalResponses,
		onFinish: ({ message }) => {
			let applied: Extract<AssistantToolResult, { status: 'applied' }> | undefined;
			for (const part of message.parts) {
				if (isToolUIPart(part) && part.state === 'output-available') {
					const result = part.output as AssistantToolResult;
					if (result.status === 'applied') applied = result;
				}
			}
			if (applied) onApplied(applied);
		}
	});

	const pendingApprovals = $derived(
		chat.messages.some((message) =>
			message.parts.some((part) => isToolUIPart(part) && part.state === 'approval-requested')
		)
	);
	const generating = $derived(chat.status === 'submitted' || chat.status === 'streaming');
	const composerDisabled = $derived(generating || pendingApprovals);

	const examples = [
		'Make the description more inviting.',
		'Help me improve the order of these steps.',
		'What could I serve with this recipe?'
	];

	const detailLabels: Record<keyof AssistantDetailsProposal, string> = {
		name: 'Name',
		description: 'Description',
		course: 'Course',
		durationMinutes: 'Duration (minutes)',
		portions: 'Portions'
	};

	function detailRows(proposal: AssistantDetailsProposal) {
		return Object.entries(proposal)
			.filter(([, change]) => change.from !== change.to)
			.map(([field, change]) => ({
				label: detailLabels[field as keyof AssistantDetailsProposal],
				from: change.from,
				to: change.to
			}));
	}

	function displayValue(value: unknown) {
		return value == null ? 'Not set' : String(value);
	}

	function resultMessage(result: AssistantToolResult) {
		if (result.status === 'applied') return 'Applied to the recipe.';
		return result.message;
	}

	async function submit() {
		const text = input.trim();
		if (!text || composerDisabled) return;
		input = '';
		await chat.sendMessage({ text });
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Enter' && !event.shiftKey) {
			event.preventDefault();
			void submit();
		}
	}
</script>

{#snippet approvalActions(approvalId: string)}
	<div class="mt-3 flex gap-2">
		<Button
			size="sm"
			class="bg-ai text-ai-foreground hover:bg-ai/90"
			onclick={() => chat.addToolApprovalResponse({ id: approvalId, approved: true })}
		>
			<CheckIcon /> Approve
		</Button>
		<Button
			size="sm"
			variant="outline"
			onclick={() =>
				chat.addToolApprovalResponse({
					id: approvalId,
					approved: false,
					reason: 'The writer rejected this proposal.'
				})}
		>
			<XIcon /> Reject
		</Button>
	</div>
{/snippet}

{#snippet toolState(part: { state: string; output?: unknown; errorText?: string })}
	{#if part.state === 'approval-responded'}
		<p class="mt-3 text-xs text-zinc-500">Decision saved. Waiting for the other proposals…</p>
	{:else if part.state === 'output-denied'}
		<p class="mt-3 text-xs font-medium text-zinc-500">Rejected</p>
	{:else if part.state === 'output-available'}
		{@const result = part.output as AssistantToolResult}
		<p class:text-red-600={result.status !== 'applied'} class="mt-3 text-xs font-medium">
			{resultMessage(result)}
		</p>
	{:else if part.state === 'output-error'}
		<p class="mt-3 text-xs font-medium text-red-600">{part.errorText}</p>
	{/if}
{/snippet}

<Button
	size="icon-lg"
	class="bg-ai text-ai-foreground hover:bg-ai/90 fixed right-5 bottom-5 z-40 rounded-full shadow-lg"
	onclick={() => (open = true)}
	aria-label="Open recipe assistant"
	title="Open recipe assistant"
>
	<BotIcon class="size-5" />
</Button>

{#if open}
	<button
		class="fixed inset-0 z-50 bg-black/35 md:hidden"
		onclick={() => (open = false)}
		aria-label="Dismiss recipe assistant"
	></button>
	<aside
		class="bg-background fixed inset-x-0 bottom-0 z-50 flex h-[85svh] flex-col rounded-t-2xl border shadow-2xl md:inset-y-20 md:right-6 md:left-auto md:h-auto md:w-[26rem] md:rounded-xl"
		aria-label="Recipe assistant"
	>
		<header class="flex items-center gap-3 border-b px-4 py-3">
			<div class="bg-ai/10 text-ai flex size-9 items-center justify-center rounded-full">
				<BotIcon />
			</div>
			<div>
				<h2 class="font-semibold">Recipe assistant</h2>
				<p class="text-xs text-zinc-500">Changes always need your approval.</p>
			</div>
			<Button
				variant="ghost"
				size="icon"
				class="ml-auto"
				onclick={() => (open = false)}
				aria-label="Close recipe assistant"
			>
				<XIcon />
			</Button>
		</header>

		<div class="min-h-0 flex-1 space-y-4 overflow-y-auto p-4" aria-live="polite">
			{#if chat.messages.length === 0}
				<div class="flex h-full flex-col justify-center">
					<h3 class="text-lg font-semibold">What would you like to refine?</h3>
					<p class="mt-1 text-sm text-zinc-500">
						Ask about the current draft or request a change. Nothing is saved until you approve it.
					</p>
					<div class="mt-5 flex flex-col gap-2">
						{#each examples as example (example)}
							<button
								class="hover:border-ai hover:bg-ai/5 rounded-lg border p-3 text-left text-sm transition-colors"
								onclick={() => (input = example)}
							>
								{example}
							</button>
						{/each}
					</div>
				</div>
			{/if}

			{#each chat.messages as message (message.id)}
				<div class:ml-10={message.role === 'user'} class:mr-6={message.role === 'assistant'}>
					<p class="mb-1 text-xs font-medium text-zinc-500">
						{message.role === 'user' ? 'You' : 'Assistant'}
					</p>
					<div
						class:bg-ai={message.role === 'user'}
						class:text-ai-foreground={message.role === 'user'}
						class="space-y-3 rounded-xl border p-3 text-sm"
					>
						{#each message.parts as part, index (`${message.id}-${index}`)}
							{#if part.type === 'text'}
								<p class="whitespace-pre-wrap">{part.text}</p>
							{:else if part.type === 'tool-updateDetails' && part.state !== 'input-streaming' && part.input}
								<div>
									<p class="font-semibold">Proposed detail changes</p>
									<dl class="mt-2 space-y-2">
										{#each detailRows(part.input) as row (row.label)}
											<div>
												<dt class="text-xs font-medium text-zinc-500">{row.label}</dt>
												<dd>
													<s class="text-zinc-500">{displayValue(row.from)}</s> → {displayValue(
														row.to
													)}
												</dd>
											</div>
										{/each}
									</dl>
									{#if part.state === 'approval-requested'}{@render approvalActions(
											part.approval.id
										)}{/if}
									{@render toolState(part)}
								</div>
							{:else if part.type === 'tool-replaceIngredients' && part.state !== 'input-streaming' && part.input}
								<div>
									<p class="font-semibold">Proposed ingredient changes</p>
									{#if part.input.expected.length === 0 && part.input.replacement.length === 0}
										<p class="mt-2 italic text-zinc-500">Empty list</p>
									{:else}
										<ul class="mt-2 list-disc space-y-1 pl-5">
											{#each diffLists(part.input.expected, part.input.replacement) as entry, i (`${entry.kind}-${entry.value}-${i}`)}<li
													class={entry.kind === 'removed'
														? 'text-zinc-500 line-through'
														: entry.kind === 'added'
															? 'font-medium'
															: undefined}
												>
													{entry.value}
												</li>{/each}
										</ul>
									{/if}
									{#if part.state === 'approval-requested'}{@render approvalActions(
											part.approval.id
										)}{/if}
									{@render toolState(part)}
								</div>
							{:else if part.type === 'tool-replaceInstructions' && part.state !== 'input-streaming' && part.input}
								<div>
									<p class="font-semibold">Proposed instruction changes</p>
									{#if part.input.expected.length === 0 && part.input.replacement.length === 0}
										<p class="mt-2 italic text-zinc-500">Empty list</p>
									{:else}
										<ol class="mt-2 list-decimal space-y-2 pl-5">
											{#each diffLists(part.input.expected, part.input.replacement) as entry, i (`${entry.kind}-${entry.value.heading}-${i}`)}
												<li
													class={entry.kind === 'removed'
														? 'text-zinc-500 line-through'
														: entry.kind === 'added'
															? 'font-medium'
															: undefined}
												>
													{#if entry.value.heading}<strong
															>{entry.value.heading}:
														</strong>{/if}{entry.value.instructions}
												</li>
											{/each}
										</ol>
									{/if}
									{#if part.state === 'approval-requested'}{@render approvalActions(
											part.approval.id
										)}{/if}
									{@render toolState(part)}
								</div>
							{/if}
						{/each}
					</div>
				</div>
			{/each}

			{#if generating}
				<div class="flex items-center gap-2 text-sm text-zinc-500"><Spinner /> Thinking…</div>
			{/if}
			{#if chat.error}
				<div class="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
					<p>The assistant could not complete that response.</p>
					<Button size="sm" variant="outline" class="mt-2" onclick={() => chat.regenerate()}>
						<RotateCcwIcon /> Retry
					</Button>
				</div>
			{/if}
		</div>

		<form
			class="border-t p-3"
			onsubmit={(event) => {
				event.preventDefault();
				void submit();
			}}
		>
			<Textarea
				bind:value={input}
				onkeydown={handleKeydown}
				placeholder={pendingApprovals
					? 'Resolve every proposal to continue…'
					: 'Ask about this recipe…'}
				rows={2}
				maxlength={2000}
				disabled={composerDisabled}
			/>
			<div class="mt-2 flex items-center justify-between">
				<p class="text-xs text-zinc-500">Enter to send · Shift+Enter for a new line</p>
				{#if generating}
					<Button
						type="button"
						size="icon"
						variant="outline"
						onclick={() => chat.stop()}
						aria-label="Stop response"
					>
						<SquareIcon class="size-3 fill-current" />
					</Button>
				{:else}
					<Button
						type="submit"
						size="icon"
						class="bg-ai text-ai-foreground hover:bg-ai/90"
						disabled={!input.trim() || composerDisabled}
						aria-label="Send message"
					>
						<SendIcon />
					</Button>
				{/if}
			</div>
		</form>
	</aside>
{/if}
