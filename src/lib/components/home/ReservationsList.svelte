<script lang="ts">
  import type { Reservation } from '$lib/types/place';

  type Props = {
    reservations: Reservation[];
  };
  let { reservations }: Props = $props();
</script>

<div class="toggle-content bg-gray-50 rounded-lg p-3 mt-3">
  <div class="space-y-2 text-base">
    {#each reservations as reservation}
      <div class="flex justify-between">
        <span class="font-medium text-gray-800">{reservation.student.number}</span>
        <span class="text-gray-500">{reservation.room.name}</span>
      </div>
    {/each}
  </div>
</div>