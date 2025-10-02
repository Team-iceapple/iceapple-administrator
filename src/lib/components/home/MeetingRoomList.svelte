<script lang="ts">
  import type { Room } from '$lib/types/place';

  type Props = {
    places: Room[];
  };
  let { places }: Props = $props();
</script>

<div class="toggle-content bg-gray-50 rounded-lg p-3 mb-3">
  <div class="space-y-2 text-base">
    {#each places as place}
      <div class="flex justify-between">
        <span class="">{place.name}</span>
      </div>
    {/each}
  </div>
</div>