<script lang="ts">
	import { tweened } from 'svelte/motion';
	import { cubicOut } from 'svelte/easing';
	import { formatCurrency } from '$lib/utils/format';
	import { untrack } from 'svelte';
	import { userPreferences } from '$lib/stores/preferences';

	interface Props {
		value: number;
		duration?: number;
	}

	const { value, duration = 400 }: Props = $props();

	// Use a reactive derivation so subsequent updates use the correct duration
	const currentDuration = $derived($userPreferences.enableAnimations ? duration : 0);

	const animatedValue = tweened(
		untrack(() => value),
		{
			duration: untrack(() => currentDuration),
			easing: cubicOut
		}
	);

	$effect(() => {
		animatedValue.set(value, { duration: currentDuration });
	});
</script>

<span>{formatCurrency(Math.round($animatedValue))}</span>
