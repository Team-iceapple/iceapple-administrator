<script lang="ts">
  import { HomePage } from '$lib/pages';
  import type { PageData, ActionData } from './$types'; // Import ActionData

  let { data, form }: { data: PageData, form?: ActionData } = $props(); // Destructure form and make it optional
</script>

<HomePage data={data} form={form} />
