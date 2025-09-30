<script lang="ts">
    import { goto, invalidateAll } from '$app/navigation';
    import { onMount } from 'svelte';
    import type {
        Reservation,
        Place,
        Student, DetailProjectGetResponse,
    } from '$lib/types';

    type data = {
        // 💡 [수정] places 타입이 Place 배열이 아닌 개별 공간 배열입니다.
        places: Array<Place & { individualId: string, displayName: string, originalId: string, name:string, placeIndex: any }>;
        totalPlaces: number;
        reservations: Reservation[];
        todayReservations: any[];
    };

    const { places, totalPlaces, reservations, todayReservations }: data = $props();

    console.log()
    import {PlaceModel} from '$lib/models/places/place.model.svelte';
    import {ReservationFormModel} from '$lib/models/places/reservation-form.model.svelte';
    import {authFetch} from "$lib/utils/auth";
    import {page} from "$app/state";
    import {logger} from "$lib/utils";

    const today = new Date().toISOString().split("T")[0];

    const placeModel = new PlaceModel();
    const place = $derived(PlaceModel.name);
    const reservationFormModel = new ReservationFormModel();
    const reservation = $derived(reservationFormModel.reservation);
    let selectedReservation = $state<Reservation | null>(null);
    let startTime = $state('09');
    let endTime = $state('18');
    let isLoading = $state(false);
    let selectedDate = $state(page.url.searchParams.get('date') || new Date().toISOString().split("T")[0]);
    console.log(selectedDate);
    let isMounted = false; // 컴포넌트 마운트 여부를 추적하는 변수
    onMount(() => {
        isMounted = true;
    });
    $effect(() => {
        if (isMounted && selectedDate !== (page.url.searchParams.get('date') || new Date().toISOString().split("T")[0])) {
            goto(`?date=${selectedDate}`, { keepFocus: true, noScroll: true });
        }
    });

    async function updateReservationTimes() {
        const startHour = parseInt(startTime, 10);
        const endHour = parseInt(endTime, 10);

        if (startHour > endHour) {
            // 경고 또는 에러 처리 (선택 사항)
            // console.warn("종료 시간이 시작 시간보다 빠를 수 없습니다.");
            reservationFormModel.reservation.times = [];
            return;
        }

        const selectedHours: number[] = [];
        for (let i = startHour; i <= endHour; i++) {
            selectedHours.push(i);
        }

        // 💡 times 배열을 모델에 반영
        reservationFormModel.reservation.times = selectedHours;
    }
    const times = ['09', '10', '11', '12', '13', '14', '15', '16', '17', '18'];

    let selectedPlaceId = $state<string[]>([]);
    let searchTerm = $state('');

    const validPlaces = places ?? [];
    const uniqueMap = new Map<string, { id: string, name: string }>();

    validPlaces.forEach(p => {
        // originalId를 키로 사용하여 중복을 제거하고, 첫 번째 항목의 정보를 저장합니다.
        // N5-504-1, N5-504-2 모두 같은 originalId(p_1392)를 사용합니다.
        if (!uniqueMap.has(p.originalId)) {
            uniqueMap.set(p.originalId, {
                id: p.originalId, // 원본 장소 ID (삭제 시 사용)
                name: p.name      // 원본 장소 이름 (N5-504)
            });
        }
    });

    const uniqueOriginalPlaces: Array<{ id: string, name: string }> = Array.from(uniqueMap.values());

    const uniquePlaceNames: string[] = uniqueOriginalPlaces.map(p => p.name);

    $effect(() => {
        const selectedName = reservationFormModel.reservation.place_name;
        if (selectedName) {
            // 'uniqueOriginalPlaces' 배열에서 선택된 이름과 일치하는 장소를 찾습니다.
            const foundPlace = uniqueOriginalPlaces.find(p => p.name === selectedName);
            if (foundPlace) {
                // 찾은 장소의 id를 form 모델에 저장합니다. (place_id 필드가 모델에 있다고 가정)
                reservationFormModel.reservation.place_id = foundPlace.id;
            }
        }
    });
    let maxQuantityForForm = $state(1);
    $effect(() => {
        const selectedPlaceName = reservationFormModel.reservation.place_name;

        if (!selectedPlaceName) {
            maxQuantityForForm = 1; // 장소가 선택되지 않으면 1로 초기화
            return; // 여기서 실행 종료
        }

        const count = places.filter(p => p.name === selectedPlaceName).length;
        maxQuantityForForm = count > 0 ? count : 1;
    });

    function incrementQuantity() {
        const currentReservation = reservationFormModel.reservation;
        if (maxQuantityForForm > currentReservation.place_count) {
            // 객체를 새로 만들어 setReservation을 통해 업데이트
            reservationFormModel.setReservation({
                ...currentReservation,
                place_count: currentReservation.place_count + 1,
            });
        }
    }
    function decrementQuantity() {
        const currentReservation = reservationFormModel.reservation;
        if (currentReservation.place_count > 1) {
            // 객체를 새로 만들어 setReservation을 통해 업데이트
            reservationFormModel.setReservation({
                ...currentReservation,
                place_count: currentReservation.place_count - 1,
            });
        }
    }

        async function handleAddPlace() {
            if (!placeModel.place.name.trim()) {
                alert('공간 이름을 입력해주세요.');
                return;
            }

            if (!placeModel.place.description.trim()) {
                alert('공간 설명을 입력해주세요.');
                return;
            }

            if (!placeModel.place.count) {
                alert('공간 갯수를 입력해주세요.');
                return;
            }

            try {
                const response = await authFetch('/api/place', {
                    method: 'POST',
                    body: JSON.stringify({
                        name: placeModel.place.name,
                        description: placeModel.place.description,
                        placeCount: placeModel.place.count
                    })
                });

                const result = await response.json();

                if (!response.ok) {
                    alert(`추가 실패: ${result.message ?? response.statusText}`);
                    return;
                }

                alert(result.message ?? '공간이 등록되었습니다.');
                placeModel.clear();

            } catch (err) {
                console.error(err);
                alert('네트워크 오류가 발생했습니다.');
            }
        }

        async function handleDeleteSelectedPlaces() {
            if (selectedPlaceId.length === 0) {
                alert('삭제할 공간을 선택해주세요.');
                return;
            }
            const idToDelete = selectedPlaceId.join(', ');
            const response = await authFetch(`/api/place/${idToDelete}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                const body = await response.json().catch(() => ({}));
                alert(body.message ?? `공간(ID: ${idToDelete}) 삭제 실패`);
                return;
            }

            selectedPlaceId = ([]);
        }

    function handleReservationItem(
        e: KeyboardEvent | MouseEvent,
        reservation: Reservation, // 클릭된 예약의 전체 정보
    ) {
        const isAllow =
            e instanceof MouseEvent ||
            (e instanceof KeyboardEvent && (e.key === 'Enter' || e.key === ' '));

        if (isAllow) {
            e.preventDefault();

            // 만약 현재 선택된 예약과 같은 것을 또 클릭하면, 폼을 초기화합니다.
            if (selectedReservation?.id === reservation.id) {
                selectedReservation = null;
                reservationFormModel.clear();
                startTime = '09';
                endTime = '18';
                return;
            }

            selectedReservation = reservation;

            // 예약 시간 범위를 startTime과 endTime 상태에 반영
            if (reservation.times && reservation.times.length > 0) {
                const sortedTimes = [...reservation.times].sort((a, b) => a - b);
                startTime = String(sortedTimes[0]).padStart(2, '0');
                endTime = String(sortedTimes[sortedTimes.length - 1]).padStart(2, '0');
            } else {
                startTime = '09';
                endTime = '09';
            }

            const formattedDate = String(selectedReservation.date).split('T')[0];

            reservationFormModel.clear();

            reservationFormModel.setReservation({
                id: reservation.id,
                date: formattedDate,
                place_name: reservation.place.name,
                student_number: reservation.student.number,
                times: reservation.times,
                place_count: reservation.res_count ?? 1,
                phone_number: reservation.student.phone ?? '',
                place_id: reservation.place.id,
            });
            console.log(reservationFormModel.reservation.date);

        }
    }

        async function changeToReservation(reservationId: string, action: 'create' | 'update' | 'delete') {
            // 유효성 검사: 장소, 예약자, 시간이 비어있으면 실행하지 않음
            console.log(`[${action}] 요청 시작, ID:`, reservationId);

            if (
                !reservationFormModel.reservation.date ||
                !reservationFormModel.reservation.place_id ||
                !reservationFormModel.reservation.times ||
                !reservationFormModel.reservation.place_count
            ) {
                alert('날짜, 장소, 시간, 수량 정보를 모두 입력해주세요.');
                return;
            }

            // 수정 또는 삭제 시에는 기존 예약 정보가 선택되었는지 확인
            if ((action === 'update' || action === 'delete') && !reservationFormModel.reservation.id) {
                alert("수정 또는 삭제할 예약을 먼저 선택해주세요.");
                return;
            }

            try {
                let response: Response;

                if (action === 'create') {
                    response = await authFetch(`/api/place/reservations`, {
                        method: 'POST',
                        body: JSON.stringify({
                            date: reservationFormModel.reservation.date,
                            place_id: reservationFormModel.reservation.place_id,
                            times: reservationFormModel.reservation.times,
                            user_name: 'admin',
                            res_count: reservationFormModel.reservation.place_count,
                        }),
                    });
                } else if (action === 'update') {
                    response = await authFetch(`/api/place/reservations/${reservationId}`, {
                        method: 'PATCH',
                        body: JSON.stringify({
                            date: reservationFormModel.reservation.date,
                            place_id: reservationFormModel.reservation.place_id,
                            times: reservationFormModel.reservation.times,
                            user_name: 'admin',
                            res_count: reservationFormModel.reservation.place_count,
                        }),
                    });
                } else if (action === 'delete') {
                    response = await authFetch(`/api/place/reservations/${reservationId}`, {
                        method: 'DELETE',
                    });

                } else {
                    throw new Error("지원하지 않는 action입니다.");
                }

                if (!response.ok) {
                    const body = await response.json().catch(() => ({}));
                    alert(body.message ?? `${action} 실패`);
                    return;
                }

                alert(`${action} 성공`);
                await invalidateAll();

                // 성공 후 상태 초기화
                reservationFormModel.clear();
                selectedReservation = null;
            } catch (err) {
                console.error(err);
                alert("예약 처리 중 오류가 발생했습니다.");
            }
        }

        $effect(() => {
            updateReservationTimes();
        });

    // function findReservation(placeId: string, time: string) {
    //     const p = displayedPlaces.find((p) => p.place.id === placeId);
    //     if (!p) return null;
    //     return p.reservations.find((r) => r.times.includes(time)) ?? null;
    // }
</script>

<main class="p-4 bg-gray-100 min-h-screen">
  <div class="flex justify-between items-center mb-4">
    <div class="flex items-center space-x-4">
      <span class="text-gray-600">날짜 선택 :</span>
      <input type="date" placeholder="오늘-Today" class="bg-white px-4 py-2 border rounded-md shadow-sm" bind:value={selectedDate} onchange={(e) => selectedDate = e.currentTarget.value}/>
    </div>
  </div>
  <div class="relative mb-4">
    <div class="flex space-x-4 overflow-x-auto p-2 scrollbar-hide">
      {#each places as place (place.individualId)}
        <div class="bg-white p-3 rounded-lg shadow min-w-[180px] flex-shrink-0">
          <h3 class="font-bold text-lg border-b pb-2 mb-2">{place.displayName}</h3>
          <ul class="space-y-1 text-sm">
            {#each times as time}
              {@const hour = parseInt(time, 10)}

              {@const expandedSlots = reservations
                  .filter(r => r.place.name === place.name && r.times.includes(hour))
                  .sort((a, b) => a.id.localeCompare(b.id)) // 순서 일관성을 위한 정렬
                  .flatMap(r => Array(r.res_count || 1).fill(r))
              }

              {@const reservation = expandedSlots[place.placeIndex]}

              <li class="flex items-center">
                {#if reservation}
                  <button
                    class="flex items-center w-full"
                    onclick={(e) => handleReservationItem(e, reservation)}
                    onkeydown={(e) => handleReservationItem(e, reservation)}
                    tabindex="0"
                  >
                    <span class="w-3 h-3 rounded-full mr-2 bg-red-400"></span>
                    <span>{time}:00</span>
                    <span class="ml-auto text-black-500 text-xs">{reservation.student.number}</span>
                  </button>
                {:else}
                  <div class="flex items-center w-full opacity-70">
                    <span class="w-3 h-3 rounded-full mr-2 bg-green-400"></span>
                    <span>{time}:00</span>
                    <span class="ml-auto text-black-500 text-xs">가능</span>
                  </div>
                {/if}
              </li>
            {/each}
          </ul>
        </div>
      {/each}
    </div>
  </div>
  <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">

    <div class="bg-white p-4 rounded-lg shadow h-fit">
      <h3 class="font-bold text-lg mb-4 border-b pb-2">공간 목록</h3>
      <div class="mb-4">
        <input
          type="search"
          bind:value={searchTerm}
          placeholder="공간 이름으로 검색..."
          class="w-full border rounded p-2 text-sm"
        />
      </div>
      <ul class="space-y-2 overflow-y-auto max-h-60">
        {#each uniqueOriginalPlaces as place (place.id)}
          <li class="flex items-center p-2 rounded-md hover:bg-gray-100">
            <input
              type="checkbox"
              id={`place-${place.id}`}
              value={place.id}
              bind:group={selectedPlaceId}
              class="mr-3 h-4 w-4 cursor-pointer"
            />
            <label for={`place-${place.id}`}
                   class="font-semibold cursor-pointer select-none w-full">{place.name}</label>
          </li>
        {/each}
      </ul>
      <div class="flex justify-end space-x-2 mt-4 pt-4 border-t">
        <button
          onclick={() => handleDeleteSelectedPlaces()}
          disabled={selectedPlaceId.length === 0}
          class="bg-red-500 text-white px-4 py-1 rounded-md text-sm transition hover:bg-red-600 active:scale-95 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          삭제
        </button>
      </div>
    </div>

    <div class="bg-white p-4 rounded-lg shadow h-fit">
      <h4 class="font-bold mb-2 text-lg border-b pb-2">새 공간 등록</h4>
      <input
        type="text"
        placeholder="새 공간 이름 (예: N4-120)"
        bind:value={placeModel.place.name}
        class="w-full border rounded p-2 mb-2 text-sm"
      />
      <textarea
        placeholder="공간 설명 (예: 빔 프로젝터가 있어요.)"
        rows="2"
        bind:value={placeModel.place.description}
        class="w-full border rounded p-2 mb-2 text-sm"
      ></textarea>
      <input
        type="number"
        placeholder="공간 개수 (예: 4) - 해당 이름의 복사본 개수"
        bind:value={placeModel.place.count}
        class="w-full border rounded p-2 text-sm"
        min="1"
      />
      <div class="flex justify-end space-x-2 mt-4">
        <button
          onclick={() => handleAddPlace()}
          disabled={!placeModel.place.name.trim()}
          class="bg-blue-500 text-white px-4 py-1 rounded-md text-sm transition hover:bg-blue-600 active:scale-95 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          등록
        </button>
      </div>
    </div>


    <div class="bg-white p-4 rounded-lg shadow">
      <div class="flex justify-between items-center mb-4 border-b pb-2">
        <h3 class="font-bold text-lg">공간 예약 관리</h3>
      </div>

      <form class="space-y-4">
        <div class="grid grid-cols-2 gap-4">
          <div class="col-span-1">
            <label class="block text-xs font-medium text-gray-500 mb-1">날짜</label>
            <input
              type="date"
              bind:value={reservationFormModel.reservation.date}
              class="w-full border rounded p-2 text-sm bg-gray-50"
            />
          </div>
          <div class="col-span-1">
            <label class="block text-xs font-medium text-gray-500 mb-1">장소</label>
            <select
            id="placeSelect"
            bind:value={reservationFormModel.reservation.place_name}
            class="w-full border rounded p-2 text-sm">
            <option value="" disabled>--- 선택 ---</option>
              {#each uniquePlaceNames as name}
                <option value={name}>{name}</option>
              {/each}
            </select>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div class="col-span-1">
            <label class="block text-xs font-medium text-gray-500 mb-1">예약자(학번)</label>
            <input
              type="text"
              placeholder="예: 20231234"
              bind:value={reservationFormModel.reservation.student_number}
              class="w-full border rounded p-2 text-sm"
            />
          </div>
          <div class="col-span-1">
            <label class="block text-xs font-medium text-gray-500 mb-1">전화번호</label>
            <input
              type="text"
              placeholder="예: 010-1234-5678"
              bind:value={reservationFormModel.reservation.phone_number}
              class="w-full border rounded p-2 text-sm"
            />
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div class="col-span-1">
            <label class="block text-xs font-medium text-gray-500 mb-1">예약 시간</label>
            <div class="flex items-center space-x-2">
              <select
                bind:value={startTime}
                onchange={updateReservationTimes}
                class="w-1/2 border rounded p-2 text-sm"
              >
                {#each times as time}
                  <option value={time}>{time}:00</option>
                {/each}
              </select>

              <span>~</span>

              <select
                bind:value={endTime}
                onchange={updateReservationTimes}
                class="w-1/2 border rounded p-2 text-sm"
              >
                {#each times as time}
                  {@const hour = parseInt(time, 10)}
                  {@const startHour = parseInt(startTime, 10)}
                  {#if hour >= startHour}
                    <option value={time}>{time}:00</option>
                  {/if}
                {/each}
              </select>
            </div>
            <p class="text-xs text-gray-400 mt-1">
              선택 시간: {reservationFormModel.reservation.times.join(', ')}
            </p>
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-500 mb-1">수량</label>
            <div class="flex items-center space-x-2">
              <button
                type="button"
                onclick={decrementQuantity}
                disabled={!!reservationFormModel.reservation.id || reservationFormModel.reservation.place_count <= 1}
                class="px-3 py-1 border rounded bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >-</button>
              <span class="flex-grow text-center p-1 border rounded">
              {reservationFormModel.reservation.place_count}

              {#if reservationFormModel.reservation.place_name}
                <span class="text-gray-400">/ {maxQuantityForForm}</span>
              {/if}
              </span>
              <button
                type="button"
                onclick={incrementQuantity}
                disabled={!!reservationFormModel.reservation.id || reservationFormModel.reservation.place_count >= maxQuantityForForm}
                class="px-3 py-1 border rounded bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >+</button>
            </div>
            {#if reservationFormModel.reservation.id}
              <p class="text-xs text-gray-400 mt-1">기존 예약은 수량을 변경할 수 없습니다.</p>
            {/if}
          </div>
        </div>
      </form>

      <div class="flex justify-end space-x-2 mt-4 pt-4 border-t">
        <button
          onclick={() => changeToReservation(reservationFormModel.reservation.id, 'create')}
          disabled={!!reservationFormModel.reservation.id}
          class=" bg-gray-300 text-white px-4 py-1 rounded-md text-sm transition hover:bg-green-600 active:scale-95 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          등록
        </button>
        <button
          onclick={() => changeToReservation(reservationFormModel.reservation.id, 'update')}
          disabled={!reservationFormModel.reservation.id}
          class="bg-gray-300 text-white px-4 py-1 rounded-md text-sm transition hover:bg-blue-600 active:scale-95 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          수정
        </button>
        <button
          onclick={() => changeToReservation(reservationFormModel.reservation.id, 'delete')}
          disabled={!reservationFormModel.reservation.id}
          class="bg-gray-300 text-white px-4 py-1 rounded-md text-sm transition hover:bg-red-600 active:scale-95 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          삭제
        </button>
      </div>
    </div>
  </div>
</main>
