<script lang="ts">
  type Reservation = {
    name: string;
    count: number[];
    description?: string;
  };

  type Props = {
    reservations: Reservation[];
  };
  let { reservations }: Props = $props();

  const timeSlots = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'];

  // 회의실별 최대 적정 인원 계산
  function getMaxCapacity(description?: string): number {
    if (!description) return 3; // 기본값
    
    if (description.includes('한 팀')) return 1;
    if (description.includes('두 팀')) return 2;
    if (description.includes('세 팀')) return 3;
    if (description.includes('네 팀')) return 4;
    if (description.includes('다섯 팀')) return 5;
    
    return 3; // 기본값
  }

  // 색상 결정 함수
  function getColorClass(count: number, maxCapacity: number): string {
    if (count === 0) return "bg-gray-100 text-gray-400";
    if (count >= maxCapacity) return "bg-red-500 text-white"; // 정원이 찼거나 초과하면 빨강
    return "bg-green-500 text-white"; // 여유 있으면 초록
  }
</script>

<div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
  <h2 class="text-2xl font-bold text-gray-900 mb-4">오늘 회의실 예약 현황</h2>

  <div class="overflow-x-auto max-h-96 overflow-y-auto">
    <table class="w-full text-base">
      <thead class="sticky top-0 bg-white">
        <tr class="border-b border-gray-200">
          <th class="text-lg text-left py-2 px-3 font-medium text-gray-700">회의실</th>
          {#each timeSlots as slot}
            <th class="text-base text-center py-2 px-2 font-medium text-gray-700">{slot}</th>
          {/each}
        </tr>
      </thead>
      <tbody>
        {#each reservations as reservation}
          {@const maxCapacity = getMaxCapacity(reservation.description)}
          <tr class="text-lg border-b border-gray-100">
            <td class="py-2 px-3 font-medium text-gray-900">{reservation.name}</td>
            {#each reservation.count as count, index}
              <td class="text-center py-2 px-2">
                <span class="inline-flex items-center justify-center w-6 h-6 text-xs font-medium {getColorClass(count, maxCapacity)} rounded-full">
                  {count}
                </span>
              </td>
            {/each}
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
</div>