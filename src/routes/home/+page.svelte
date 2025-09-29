<script lang="ts">
import { HomePage } from '$lib/pages';
import type {PageData, ActionData} from "../../../.svelte-kit/types/src/routes/home/$types";

let { data, form }: { data: PageData, form?: ActionData } = $props();
</script>

<HomePage {data} {form} />