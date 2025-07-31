<script lang="ts">
import '@/app.css';
import { SideBar } from '$lib/components/ui';

let { children } = $props();
</script>

<SideBar />

{@render children()}
