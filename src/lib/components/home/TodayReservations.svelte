<script lang="ts">
  type Props = {
    reservations: {
      name: string;
      count: number[];
    }[];
  };
  let { reservations }: Props = $props();

  const timeSlots = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'];

  function getReservationStatus(count: number) {
    if (count === 0) return { text: '예약 없음', class: 'bg-gray-100 text-gray-800' };
    if (count <= 2) return { text: `${count}개 예약`, class: 'bg-blue-100 text-blue-800' };
    if (count <= 5) return { text: `${count}개 예약`, class: 'bg-yellow-100 text-yellow-800' };
    return { text: `${count}개 예약`, class: 'bg-red-100 text-red-800' };
  }
</script>

<section class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
  <h2 class="text-lg font-medium text-gray-900 mb-4">오늘 회의실 예약 현황</h2>
  <div class="overflow-x-auto">
    <table class="w-full text-sm">
      <thead>
        <tr class="border-b border-gray-200">
          <th class="text-left py-2">회의실</th>
          {#each timeSlots as time}
            <th class="text-center py-2 min-w-20">{time}</th>
          {/each}
        </tr>
      </thead>
      <tbody class="divide-y divide-gray-100">
        {#each reservations as reservation}
          <tr>
            <td class="py-2 font-medium">{reservation.name}</td>
            {#each reservation.count as count, index}
              <td class="py-2 text-center">
                {#if count > 0}
                  {@const status = getReservationStatus(count)}
                  <span class="px-2 py-1 rounded-full text-xs {status.class}">
                    {status.text}
                  </span>
                {:else}
                  <span class="text-gray-400 text-xs">-</span>
                {/if}
              </td>
            {/each}
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
</section>
