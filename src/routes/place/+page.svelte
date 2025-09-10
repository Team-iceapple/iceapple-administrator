<script lang="ts">
import { PlacePage } from '$lib/pages';
import type { PageProps } from './$types';

const { data, form }: PageProps = $props();

</script>

<PlacePage
  form={form}
  reservations={data.reservations}
  places={data.places}
/>
