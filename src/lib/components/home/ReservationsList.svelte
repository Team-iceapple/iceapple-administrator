<script lang="ts">
  type Props = {
    reservations: any[];
  };
  let { reservations }: Props = $props();
</script>

<div class="toggle-content bg-gray-50 rounded-lg p-3 mt-3">
  <div class="space-y-2 text-sm">
    {#each reservations as reservation}
      <div class="flex justify-between">
        <span class="font-medium text-gray-800">{reservation.student_number}</span>
        <span class="text-gray-500">{reservation.place.name}</span>
      </div>
    {/each}
  </div>
</div>
