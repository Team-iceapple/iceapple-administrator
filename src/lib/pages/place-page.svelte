<script lang="ts">
    import { goto, invalidateAll } from '$app/navigation';
    import { onMount } from 'svelte';
    import type {
        Reservation,
        Place,
    } from '$lib/types';

    type data = {
        places: Array<Place & { individualId: string, displayName: string, originalId: string, name:string, placeIndex: any }>;
        totalPlaces: number;
        reservations: Reservation[];
        todayReservations: any[];
    };

    const { places, totalPlaces, reservations, todayReservations }: data = $props();

    import {PlaceModel} from '$lib/models/places/place.model.svelte';
    import {ReservationFormModel} from '$lib/models/places/reservation-form.model.svelte';
    import {authFetch} from "$lib/utils/auth";
    import {page} from "$app/state";

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

    let isMounted = false;
    onMount(() => {
        isMounted = true;
    });
    $effect(() => {
        if (isMounted && selectedDate !== (page.url.searchParams.get('date') || new Date().toISOString().split("T")[0])) {
            goto(`?date=${selectedDate}`, { keepFocus: true, noScroll: true });
        }
    });

    async function safeJson(res: Response) {
        const text = await res.text();
        if (!text) return null;
        try {
            return JSON.parse(text);
        } catch {
            return null;
        }
    }

    async function updateReservationTimes() {
        const startHour = parseInt(startTime, 10);
        const endHour = parseInt(endTime, 10);

        if (startHour > endHour) {
            reservationFormModel.reservation.times = [];
            return;
        }

        const selectedHours: number[] = [];
        for (let i = startHour; i <= endHour; i++) {
            selectedHours.push(i);
        }

        reservationFormModel.reservation.times = selectedHours;
    }

    const times = ['09', '10', '11', '12', '13', '14', '15', '16', '17', '18'];

    let selectedPlaceId = $state<string[]>([]);
    let searchTerm = $state('');

    const validPlaces = places ?? [];
    const uniqueMap = new Map<string, { id: string, name: string }>();

    validPlaces.forEach(p => {
        if (!uniqueMap.has(p.originalId)) {
            uniqueMap.set(p.originalId, {
                id: p.originalId,
                name: p.name
            });
        }
    });

    const uniqueOriginalPlaces: Array<{ id: string, name: string }> = Array.from(uniqueMap.values());
    const uniquePlaceNames: string[] = uniqueOriginalPlaces.map(p => p.name);

    const filteredPlaces = $derived(
        uniqueOriginalPlaces.filter(p =>
            p.name.toLowerCase().includes(searchTerm.toLowerCase().trim())
        )
    );

    $effect(() => {
        const selectedName = reservationFormModel.reservation.place_name;
        if (selectedName) {
            const foundPlace = uniqueOriginalPlaces.find(p => p.name === selectedName);
            if (foundPlace) {
                reservationFormModel.reservation.place_id = foundPlace.id;
            }
        }
    });

    let maxQuantityForForm = $state(1);
    $effect(() => {
        const selectedPlaceName = reservationFormModel.reservation.place_name;

        if (!selectedPlaceName) {
            maxQuantityForForm = 1;
            return;
        }

        const count = places.filter(p => p.name === selectedPlaceName).length;
        maxQuantityForForm = count > 0 ? count : 1;
    });

    function incrementQuantity() {
        const currentReservation = reservationFormModel.reservation;
        if (maxQuantityForForm > currentReservation.place_count) {
            reservationFormModel.setReservation({
                ...currentReservation,
                place_count: currentReservation.place_count + 1,
            });
        }
    }

    function decrementQuantity() {
        const currentReservation = reservationFormModel.reservation;
        if (currentReservation.place_count > 1) {
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
            showPlaceModal = false;
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
        reservation: Reservation,
    ) {
        const isAllow =
            e instanceof MouseEvent ||
            (e instanceof KeyboardEvent && (e.key === 'Enter' || e.key === ' '));

        if (isAllow) {
            e.preventDefault();

            if (selectedReservation?.id === reservation.id) {
                selectedReservation = null;
                reservationFormModel.clear();
                startTime = '09';
                endTime = '18';
                return;
            }

            selectedReservation = reservation;

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
        }
    }

    async function changeToReservation(reservationId: string, action: 'create' | 'update' | 'delete') {
        if (
            !reservationFormModel.reservation.date ||
            !reservationFormModel.reservation.place_id ||
            !reservationFormModel.reservation.times ||
            !reservationFormModel.reservation.place_count
        ) {
            alert('날짜, 장소, 시간, 수량 정보를 모두 입력해주세요.');
            return;
        }

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
            } else {
                response = await authFetch(`/api/place/reservations/${reservationId}`, {
                    method: 'DELETE',
                });
            }

            if (!response.ok) {
                const body = await safeJson(response);
                alert(body?.message ?? `${action} 실패`);
                return;
            }

            alert(`${action} 성공`);

            await invalidateAll();

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

    let showPlaceModal = $state(false);
</script>

<main class="p-4 min-h-screen">
  <div class="text-xl bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
    <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div class="flex items-center space-x-6">
        <span class="text-xl font-semibold">날짜 선택</span>
        <input
          type="date"
          placeholder="오늘-Today"
          class="bg-white px-4 py-2 border rounded-md shadow-sm text-xl"
          bind:value={selectedDate}
          onchange={(e) => selectedDate = e.currentTarget.value}
        />
      </div>

      <button
        type="button"
        class="px-3 py-2 text-base rounded-md border border-gray-300 bg-gray-50 hover:bg-gray-100 active:scale-95 text-gray-700 w-full md:w-auto"
        onclick={() => {
        const today = new Date().toISOString().split("T")[0];
        selectedDate = today;
      }}
      >
        오늘로 이동
      </button>
    </div>
  </div>

  <div class="text-xl bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
    <div class="flex items-start justify-between mb-4">
      <h2 class="font-bold text-2xl flex items-center">
        예약 현황
        <span class="ml-2 text-sm text-gray-500 font-normal">
        {selectedDate}
      </span>
      </h2>
      <button
        type="button"
        class="px-3 py-2 text-base rounded-md border border-gray-300 bg-gray-50 hover:bg-gray-100 active:scale-95 text-gray-700 w-full md:w-auto"
        onclick={() => invalidateAll()}
      >
        새로고침
      </button>
    </div>

    <div class="flex space-x-4 overflow-x-auto pr-2 scrollbar-hide">
      {#each places as place (place.individualId)}
        <div class="min-w-[230px] flex-shrink-0 rounded-lg border border-gray-200 bg-gray-50 p-3">
          <h3 class="font-bold text-xl border-b pb-2 mb-2 text-gray-800">
            {place.displayName}
          </h3>

          <ul class="space-y-1 text-lg">
            {#each times as time}
              {@const hour = parseInt(time, 10)}

              {@const expandedSlots = reservations
                  .filter(r => r.place.name === place.name && r.times.includes(hour))
                  .sort((a, b) => a.id.localeCompare(b.id))
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
                    <span class="text-gray-800">{time}:00</span>
                    <span class="ml-auto text-gray-700 text-base">{reservation.student.number}</span>
                  </button>
                {:else}
                  <div class="flex items-center w-full opacity-70">
                    <span class="w-3 h-3 rounded-full mr-2 bg-green-400"></span>
                    <span class="text-gray-800">{time}:00</span>
                    <span class="ml-auto text-gray-500 text-base">가능</span>
                  </div>
                {/if}
              </li>
            {/each}
          </ul>
        </div>
      {/each}
    </div>
  </div>

  <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">

    <div class="text-xl bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div class="flex justify-between items-center mb-4 border-b pb-2">
        <h3 class="font-bold text-2xl">공간 예약 관리</h3>
      </div>

      <form class="space-y-4">
        <div class="grid grid-cols-2 gap-4">
          <div class="col-span-1">
            <label class="block text-lg font-medium text-gray-500 mb-1">
              날짜 <span class="text-red-500">*</span>
            </label>
            <input
              type="date"
              bind:value={reservationFormModel.reservation.date}
              class="w-full border rounded p-2 text-lg bg-gray-50"
              required
            />
          </div>

          <div class="col-span-1">
            <label class="block text-lg font-medium text-gray-500 mb-1">
              장소 <span class="text-red-500">*</span>
            </label>
            <select
              id="placeSelect"
              bind:value={reservationFormModel.reservation.place_name}
              class="w-full border rounded p-2 text-lg"
              required
            >
              <option value="" disabled>--- 선택 ---</option>
              {#each uniquePlaceNames as name}
                <option value={name}>{name}</option>
              {/each}
            </select>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div class="col-span-1">
            <label class="block text-lg font-medium text-gray-500 mb-1">
              예약자(학번)
            </label>
            <input
              type="text"
              placeholder="관리자는 자동 입력됩니다."
              bind:value={reservationFormModel.reservation.student_number}
              class="w-full border rounded p-2 text-lg"
            />
          </div>

          <div class="col-span-1">
            <label class="block text-lg font-medium text-gray-500 mb-1">
              전화번호
            </label>
            <input
              type="text"
              placeholder="관리자는 자동 입력됩니다."
              bind:value={reservationFormModel.reservation.phone_number}
              class="w-full border rounded p-2 text-lg"
            />
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div class="col-span-1">
            <label class="block text-lg font-medium text-gray-500 mb-1">
              예약 시간 <span class="text-red-500">*</span>
            </label>
            <div class="flex items-center space-x-2">
              <select
                bind:value={startTime}
                onchange={updateReservationTimes}
                class="w-1/2 border rounded p-2 text-lg"
                required
              >
                {#each times as time}
                  <option value={time}>{time}:00</option>
                {/each}
              </select>

              <span>~</span>

              <select
                bind:value={endTime}
                onchange={updateReservationTimes}
                class="w-1/2 border rounded p-2 text-lg"
                required
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
            <p class="text-ml text-gray-400 mt-1">
              선택 시간: {reservationFormModel.reservation.times.join(', ')}
            </p>
          </div>

          <div>
            <label class="block text-lg font-medium text-gray-500 mb-1">
              수량 <span class="text-red-500">*</span>
            </label>
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
              <p class="text-lg text-gray-400 mt-1">기존 예약은 수량을 변경할 수 없습니다.</p>
            {/if}
          </div>
        </div>
      </form>

      <div class="flex justify-end space-x-2 mt-4 pt-4 border-t">
        <button
          onclick={() => changeToReservation(reservationFormModel.reservation.id, 'create')}
          disabled={!!reservationFormModel.reservation.id}
          class="w-fit bg-gray-300 text-white px-4 py-1 rounded-md text-ml transition hover:bg-green-600 active:scale-95 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          등록
        </button>
        <button
          onclick={() => changeToReservation(reservationFormModel.reservation.id, 'update')}
          disabled={!reservationFormModel.reservation.id}
          class="w-fit bg-gray-300 text-white px-4 py-1 rounded-md text-ml transition hover:bg-blue-600 active:scale-95 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          수정
        </button>
        <button
          onclick={() => changeToReservation(reservationFormModel.reservation.id, 'delete')}
          disabled={!reservationFormModel.reservation.id}
          class="w-fit bg-gray-300 text-white px-4 py-1 rounded-md text-ml transition hover:bg-red-600 active:scale-95 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          삭제
        </button>
      </div>
    </div>

    <div class="text-xl bg-white rounded-lg shadow-sm border border-gray-200 p-6 h-fit">
      <div class="flex justify-between items-center mb-4 border-b pb-2">
        <h3 class="font-bold text-2xl">공간 관리</h3>

        <button
          type="button"
          class="bg-gray-300 text-white px-3 py-1 rounded-md text-ml transition hover:bg-blue-600 active:scale-95"
          onclick={() => { showPlaceModal = true; }}
        >
          + 새 공간
        </button>
      </div>

      <div class="mb-4">
        <input
          type="search"
          bind:value={searchTerm}
          placeholder="공간 이름으로 검색..."
          class="w-full border rounded p-2 text-lg"
        />
      </div>

      <ul class="space-y-2 overflow-y-auto max-h-60">
        {#each filteredPlaces as place (place.id)}
          <li class="flex items-center p-2 rounded-md hover:bg-gray-100">
            <input
              type="checkbox"
              id={`place-${place.id}`}
              value={place.id}
              bind:group={selectedPlaceId}
              class="mr-3 h-4 w-4 cursor-pointer"
            />
            <label
              for={`place-${place.id}`}
              class="font-semibold cursor-pointer select-none w-full text-x"
            >
              {place.name}
            </label>
          </li>
        {/each}

        {#if filteredPlaces.length === 0}
          <li class="text-gray-400 text-lg p-2 select-none">
            검색 결과 없음
          </li>
        {/if}
      </ul>

      <div class="flex justify-end space-x-2 mt-4 pt-4 border-t">
        <button
          onclick={() => handleDeleteSelectedPlaces()}
          disabled={selectedPlaceId.length === 0}
          class="bg-red-500 text-white px-4 py-1 rounded-md text-lg transition hover:bg-red-600 active:scale-95 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          삭제
        </button>
      </div>
    </div>

  </div>

  {#if showPlaceModal}
    <div class="fixed inset-0 z-50 flex items-center justify-center">
      <div
        class="absolute inset-0 bg-black/40"
        onclick={() => { showPlaceModal = false; }}
      ></div>

      <div class="relative bg-white w-full max-w-md rounded-xl shadow-xl p-6">
        <div class="flex items-start justify-between border-b pb-3 mb-4">
          <h4 class="font-bold text-xl">공간 등록</h4>
          <button
            class="text-gray-400 hover:text-gray-600 text-xl leading-none"
            onclick={() => { showPlaceModal = false; }}
            aria-label="닫기"
          >
            ✕
          </button>
        </div>

        <div class="space-y-3">
          <div>
            <label class="block text-lg font-medium text-gray-500 mb-1">공간 이름</label>
            <input
              type="text"
              placeholder="예: N4-120"
              bind:value={placeModel.place.name}
              class="w-full border rounded p-2 text-lg"
            />
          </div>

          <div>
            <label class="block text-lg font-medium text-gray-500 mb-1">설명</label>
            <textarea
              placeholder="예: 빔 프로젝터가 있어요."
              rows="2"
              bind:value={placeModel.place.description}
              class="w-full border rounded p-2 text-lg"
            ></textarea>
          </div>

          <div>
            <label class="block text-lg font-medium text-gray-500 mb-1">공간 개수</label>
            <input
              type="number"
              placeholder="예: 4"
              bind:value={placeModel.place.count}
              class="w-full border rounded p-2 text-lg"
              min="1"
            />
            <p class="text-sm text-gray-400 mt-1">
              동일 이름의 공간 수
            </p>
          </div>
        </div>

        <div class="flex justify-end space-x-2 mt-6 pt-4 border-t">
          <button
            class="px-4 py-1 rounded-md text-lg border bg-gray-100 hover:bg-gray-200 active:scale-95"
            onclick={() => { showPlaceModal = false; }}
          >
            취소
          </button>
          <button
            class="bg-blue-500 text-white px-4 py-1 rounded-md text-lg transition hover:bg-blue-600 active:scale-95 disabled:bg-gray-300 disabled:cursor-not-allowed"
            onclick={() => handleAddPlace()}
            disabled={!placeModel.place.name.trim()}
          >
            등록
          </button>
        </div>
      </div>
    </div>
  {/if}
</main>
