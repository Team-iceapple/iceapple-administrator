<script lang="ts">
import { HomePage } from '$lib/pages';
import type { PageData, ActionData } from './$types';

let { data, form }: { data: PageData, form?: ActionData } = $props();
</script>

<HomePage {data} {form} />