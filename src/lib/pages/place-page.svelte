<script lang="ts">
    import type {
        ReservationGetResponse,
        Reservation,
        Place,
        Student, DetailProjectGetResponse,
    } from '$lib/types';

    import {PlaceModel} from '$lib/models/places/place.model.svelte';
    import {ReservationFormModel} from '$lib/models/places/reservation-form.model.svelte';
    import {API_ENDPOINTS} from "$lib/config/api";


    const today = new Date().toISOString().split("T")[0];
    const {form, reservations, places} = $props();

    const placeModel = new PlaceModel();
    const place = $derived(PlaceModel.name);
    const reservationFormModel = new ReservationFormModel();
    const reservation = $derived(reservationFormModel.reservation);
    let selectedReservation = $state<Reservation | null>(null);

    async function selectReservation(reservationId: string) {
        if (reservationId === selectedReservation?.id) {
            selectedReservation = null;
            reservationFormModel.clear();
            return;
        }

        reservationFormModel.setReservation(reservation);
    }

    const times = ['09', '10', '11', '12', '13', '14', '15', '16', '17', '18'];

    let selectedPlaceId = $state('');
    let searchTerm = $state('');

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
            const response = await fetch('/place', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
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

        const response = await fetch(`/api/place/${selectedPlaceId}`, {
            method: 'DELETE',

        });

        if (!response.ok) {
            const body = await response.json().catch(() => ({}));
            alert(body.message ?? `공간(ID: ${selectedPlaceId}) 삭제 실패`);
            return;
        }

        selectedPlaceId = ('');
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
            selectReservation(reservation.id);
        }
    }

    async function changeToReservation(id: string, action: "create" | "update" | "delete") {
        // 유효성 검사: 장소, 예약자, 시간이 비어있으면 실행하지 않음
        if (
            !reservationFormModel.reservation.place_name ||
            !reservationFormModel.reservation.user_number ||
            !reservationFormModel.reservation.times
        ) {
            alert('장소, 예약자, 시간 정보를 모두 입력해주세요.');
            return;
        }

        // 수정 또는 삭제 시에는 기존 예약 정보가 선택되었는지 확인
        if ((action === "update" || action === "delete") && !reservationFormModel.reservation.id) {
            alert("수정 또는 삭제할 예약을 먼저 선택해주세요.");
            return;
        }

        try {
            let response: Response;

            if (action === "create") {
                response = await fetch(`api/reservations`, {
                    method: "POST",
                    headers: {"Content-Type": "application/json"},
                    body: JSON.stringify({
                        date: reservationFormModel.reservation.date,
                        place_name: reservationFormModel.reservation.place_name,
                        user_number: reservationFormModel.reservation.user_number,
                        times: reservationFormModel.reservation.times,
                    }),
                });
            } else if (action === "update") {
                response = await fetch(`/api/reservations/${reservationFormModel.reservation.id}`, {
                    method: "PATCH",
                    headers: {"Content-Type": "application/json"},
                    body: JSON.stringify({
                        date: reservationFormModel.reservation.date,
                        place_name: reservationFormModel.reservation.place_name,
                        user_number: reservationFormModel.reservation.user_number,
                        times: reservationFormModel.reservation.times,
                    }),
                });
            } else if (action === "delete") {
                response = await fetch(`/api/reservations/${reservationFormModel.reservation.id}`, {
                    method: "DELETE",
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

            // 성공 후 상태 초기화
            reservationFormModel.clear();
            selectedReservation = null;
        } catch (err) {
            console.error(err);
            alert("예약 처리 중 오류가 발생했습니다.");
        }
    }

    // function findReservation(placeId: string, time: string) {
    //     const p = displayedPlaces.find((p) => p.place.id === placeId);
    //     if (!p) return null;
    //     return p.reservations.find((r) => r.times.includes(time)) ?? null;
    // }
</script>

<main class="p-4 bg-gray-100 min-h-screen">
  <div class="flex justify-between items-center mb-4">
    <div class="flex items-center space-x-4">
      <input type="date" placeholder="날짜 선택" class="bg-white px-4 py-2 border rounded-md shadow-sm"/>
      <span class="text-gray-600">default - Today</span>
    </div>
  </div>

  <!--	<div class="relative mb-4">-->
  <!--		<div class="flex space-x-4 overflow-x-auto p-2 scrollbar-hide">-->
  <!--			{#each displayedPlaces as place}-->
  <!--				<div class="bg-white p-3 rounded-lg shadow min-w-[180px] flex-shrink-0">-->
  <!--                                  <h3 class="font-bold text-lg border-b pb-2 mb-2">{reservations.place.name}</h3>-->
  <!--                                  {#each times as time }-->
  <!--                                    {@const reservation = findReservation(reservations.place.id, time)}-->
  <!--                                  <li class="flex items-center">-->
  <!--                                    <button-->
  <!--                                      class="flex items-center w-full"-->
  <!--                                      onclick={(e) => handleReservationItem(e, reservation)}-->
  <!--                                      onkeydown={(e) => handleReservationItem(e, reservation)}-->
  <!--                                    >-->
  <!--                                      <span class={`w-3 h-3 rounded-full mr-2 ${reservation ? 'bg-green-400' : 'bg-red-400'}`}></span>-->
  <!--                                      <span>{time}</span>-->
  <!--                                      {#if reservation}-->
  <!--                                        <span class="ml-auto text-gray-500 text-xs">{reservations.reservation.student_number}</span>-->
  <!--                                      {/if}-->
  <!--                                    </button>-->
  <!--                                  </li>-->
  <!--                                  {/each}-->
  <!--				</div>-->
  <!--			{/each}-->
  <!--		</div>-->
  <!--	</div>-->
  <div class="relative mb-4">
    <div class="flex space-x-4 overflow-x-auto p-2 scrollbar-hide">
      {#each places.places as place (place.name)}
        <div class="bg-white p-3 rounded-lg shadow min-w-[180px] flex-shrink-0">
          <h3 class="font-bold text-lg border-b pb-2 mb-2">{place.name}</h3>
          <ul class="space-y-1 text-sm">
            {#each times as time}
              <li class="flex items-center">
                {#each reservations.reservations.filter(r => r.times.includes(time) && r.place.name === place.name) as reservation}
                <button
                  class="flex items-center w-full"
                  onclick={(e) => handleReservationItem(e, reservation)}
                >
                  <span class={`w-3 h-3 rounded-full mr-2 ${reservation ? 'bg-red-400' : 'bg-green-400'}`}></span>
                  <span>{reservation.time}</span>
                  {#if reservations.reservations.filter(r => r.times.includes(time) && r.place.name === place.name).length === 0}
                    <span class="ml-auto text-gray-500 text-xs">{reservation.student_number}</span>
                  {/if}
                </button>
                {/each}
              </li>
            {/each}
          </ul>
        </div>
      {/each}
    </div>
  </div>
  <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
    <div class="bg-white p-4 rounded-lg shadow">
      <h3 class="font-bold text-lg mb-4 border-b pb-2">공간 목록</h3>
      <div class="mb-4">
        <input
          type="search"
          bind:value={searchTerm}
          placeholder="공간 이름으로 검색..."
          class="w-full border rounded p-2 text-sm"
        />
      </div>
      <ul class="space-y-2 overflow-y-auto h-50">
        {#each places.places as place}
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
      <div class="mt-4 pt-4 border-t">
        <h4 class="font-semibold mb-2 text-md">새 공간 등록</h4>
        <input
          type="text"
          placeholder="새 공간 이름 (예: N4120-1)"
          bind:value={placeModel.place.name}
          class="w-full border rounded p-2 mb-2 text-sm"
        />
        <textarea
          placeholder="공간 설명 (예: 빔 프로젝터가 있어요.)"
          rows="2"
          bind:value={placeModel.place.description}
          class="w-full border rounded p-2 text-sm"
        ></textarea>
        <textarea
          placeholder="공간 개수 (예 : 2)"
          bind:value={placeModel.place.count}
          class="w-full border rounded p-2 text-sm"
        ></textarea>
      </div>
      <div class="flex justify-end space-x-2 mt-4">
        <button
          onclick={() => handleAddPlace()}
          disabled={!placeModel.place.name.trim()}
          class="bg-blue-500 text-white px-4 py-1 rounded-md text-sm transition hover:bg-gray-500 active:scale-95 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          등록
        </button>
        <button
          onclick={() => handleDeleteSelectedPlaces()}
          disabled={!selectedPlaceId}
          class=" bg-blue-500 text-white px-4 py-1 rounded-md text-sm transition hover:bg-gray-500 active:scale-95 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          삭제
        </button>
      </div>
    </div>

    <div class="bg-white p-4 rounded-lg shadow lg:col-span-2">
      <div class="flex justify-between items-center mb-4 border-b pb-2">
        <h3 class="font-bold text-lg">공간 예약 관리</h3>
        <div class="flex space-x-1">
          <button onclick={() => changeToReservation("", "create")}
                  class="border-1 border-gray-500 text-black px-3 py-1 hover:bg-gray-300 rounded-md text-sm">등록
          </button>
          <button onclick={() => changeToReservation("", "update")}
                  class=" border-1 border-gray-500 text-black px-3 py-1 hover:bg-gray-300  rounded-md text-sm">수정
          </button>
          <button onclick={() => changeToReservation("", "delete")}
                  class=" border-1 border-gray-500 text-black px-3 py-1 hover:bg-gray-300 rounded-md text-sm">삭제
          </button>
        </div>
      </div>
      <div class="space-y-2">
        <div class="grid grid-cols-3 items-center">
          <label for="date" class="text-sm font-medium">날짜 :</label>
          <input type="date" id="date" bind:value={reservationFormModel.reservation.date}
                 class="col-span-2 border rounded-md px-2 py-1 text-sm"/>
        </div>
        <div class="grid grid-cols-3 items-center">
          <label for="place" class="text-sm font-medium">장소 :</label>
          <select id="place" class="col-span-2 border rounded-md px-2 py-1 text-sm bg-white"
                  bind:value={reservationFormModel.reservation.place_name}>
            {#each places as place}
              <option value={place.name}>{place.name}</option>
            {/each}
          </select>
        </div>
        <div class="grid grid-cols-3 items-center">
          <label for="time" class="text-sm font-medium">시간 :</label>
          <div class="col-span-2 flex items-center space-x-2">
            <input type="datetime" bind:value={reservationFormModel.reservation.times[0]}
                   class="border rounded-md px-2 py-1 w-16 text-sm"/>
            <span>~</span>
            <input type="datetime" bind:value={reservationFormModel.reservation.times[2]}
                   class="border rounded-md px-2 py-1 w-16 text-sm"/>
          </div>
        </div>
        <div class="grid grid-cols-3 items-center">
          <label for="reserver" class="text-sm font-medium">예약자 :</label>
          <input type="text" id="reserver" bind:value={reservationFormModel.reservation.user_number}
                 class="col-span-2 border rounded-md px-2 py-1 text-sm"/>
        </div>
        <div class="grid grid-cols-3 items-center">
          <label for="reserver" class="text-sm font-medium">전화번호 :</label>
          <input type="text" id="reserver" bind:value={reservationFormModel.reservation.phone_number}
                 class="col-span-2 border rounded-md px-2 py-1 text-sm"/>
        </div>
      </div>
    </div>
  </div>
</main>
