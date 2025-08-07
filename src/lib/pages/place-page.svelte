<script lang="ts">
    const today = Date.now()

    type Room = {
            id: string;
            name: string;
            description?: string | null;

    }

    class RoomBuilder {
            id: string;
            name: string;
            description?: string | null;

            constructor() {
                    this.id = $state<string>('a');
                    this.name = $state<string>('');
                    this.description = $state<string | null>(null);
            }

            build = (): Room => {
                return {
                    id: `r_${Date.now()}`, // 간단한 고유 ID 생성
                    name: this.name,
                    description: this.description,
                };
            };

            clear = (): void => {
                    this.id = '';
                    this.name = '';
                    this.description = null;
            };
    }

    let fakeRooms = $state<Room[]> ([
        { id: 'r_1', name: 'N5504', description: '책상이 4개에요.' },
        { id: 'r_2', name: 'N5506', description: '강의실이에요.' },
        { id: 'r_3', name: 'N5511', description: '큰 TV가 있어요.'},
        { id: 'r_4', name: 'N5512', description: '소규모 모임에 좋아요.' },
        { id: 'r_5', name: 'N4119', description: '강의실이에요.' },
        { id: 'r_6', name: 'N4301', description: '세미나실이에요.'},
        { id: 'r_7', name: 'N4302', description: '회의실이에요.'},
        { id: 'r_8', name: 'N4303', description: '강의실이에요.'},
    ]);

    type Reservation = {
            id: string;
            times: string[];
            date: Date;
            room: Room;
            member: string;
            description?: string | null;
    };

    class ReservationModel {
        id: string;
        times: string[];
        date: Date;
        room: Room;
        member: string;
        description?: string | null;

        constructor() {
            this.id = `rv_${Date.now()}`;
            this.times = $state<string[]>([]);
            this.date = $state<Date>(new Date());
            this.room = $state<Room>({id: '', name: '', description: null});
            this.member = $state<string>('');
            this.description = $state<string | null>(null);
        }

        set = (reservation : Reservation) => {
            this.id = reservation.id;
            this.times = [...reservation.times]; // 배열은 spread로 복사 (ok)
            this.date = new Date(reservation.date.getTime()); // 새로운 Date 객체 생성
            this.room = { ...reservation.room }; // 새로운 Room 객체 생성
            this.member = reservation.member;
            this.description = reservation.description;
        }

        clear = () => {
            this.id = '';
            this.times = [];
            this.date = new Date();
            this.room = {id: '', name: '', description: null};
            this.member = '';
            this.description = null;
        }

        post = () => {
            const createReservation: Reservation = $state.snapshot({
                id: this.id,
                times: this.times,
                date: this.date,
                room: this.room,
                member: this.member,
                description: this.description,
            });

            console.info(JSON.stringify(createReservation, null, 2));
        };
    }

    let fakeReservation : Reservation[] = $state([
        {
            id: 'rv_1',
            times: ['11', '12', '13'],
            date: new Date(),
            room: {id: 'r_2', name: 'N5506'},
            member: '20221038',
            description: null,
        },
        {
            id: 'rv_2',
            times: ['10', '11', '12'],
            date: new Date(),
            room: {id: 'r_3', name: 'N5511'},
            member: '20221032',
            description: null,
        },
        {
            id: 'rv_3',
            times: ['15', '16', '17'],
            date: new Date(),
            room: {id: 'r_5', name: 'N4119'},
            member: '20221038',
            description: null,
        },
        {
            id: 'rv_4',
            times: ['11', '12', '13'],
            date: new Date(),
            room: {id: 'r_5', name: 'N4119'},
            member: '20221032',
            description: null,
        },
        {
            id: 'rv_5',
            times: ['13', '14', '15'],
            date: new Date(),
            room: {id: 'r_3', name: 'N5511'},
            member: '20221039',
            description: "캡스톤 회의",
        },
    ])

    const times = ['09', '10', '11', '12', '13', '14', '15', '16', '17', '18'];


    let selectedRoomIds = $state<string[]>([]); // 선택된 공간의 ID들을 저장할 배열
    let searchTerm = $state('');
    let displayedRooms = $derived(
        fakeRooms.filter(room => room.name.toLowerCase().includes(searchTerm.toLowerCase().trim()))
            .sort((a, b) => a.name.localeCompare(b.name))
    );

    const roomBuilder = new RoomBuilder();

    function handleAddRoom() {
        if (!roomBuilder.name.trim()) {
            alert('공간 이름을 입력해주세요.');
            return;
        }
        const room = roomBuilder.build();
        fakeRooms.push(room);
        fakeRooms.sort((a, b) => a.name.localeCompare(b.name));
        roomBuilder.clear();
    }

    function handleDeleteSelectedRooms() {
        if (selectedRoomIds.length === 0) {
            alert('삭제할 공간을 선택해주세요.');
            return;
        }
        // selectedRoomIds에 포함되지 않은 공간들만 남김
        fakeRooms = fakeRooms.filter(room => !selectedRoomIds.includes(room.id));
        // 선택 상태 초기화
        selectedRoomIds = [];
    }

    $effect(() => {
        // 이름이 변경될 때마다 fakeRooms에서 해당 이름의 전체 Room 객체를 찾습니다.
        const selectedRoomObject = fakeRooms.find(r => r.name === reservationModel.room.name);

        // 찾았다면, reservationModel.room 객체 전체를 업데이트합니다.
        if (selectedRoomObject) {
            reservationModel.room.id = selectedRoomObject.id;
            reservationModel.room.description = selectedRoomObject.description;
        }
    });
    type ChangeType = 'APPLY' | 'EDIT' | 'DELETE';
    type PendingToChange = {
        id: number; // 목록에서 각 항목을 구분하기 위한 임시 ID
        type: ChangeType;
        data: Reservation;
    };

    let selectedReservation = $state<Reservation | null>(null);

    const reservationModel = new ReservationModel();

    function findReservation(roomId: string, time : string) {
        return fakeReservation.find(r => r.room.id === roomId && r.times.includes(time));
    }

    function handleReservationItem(e: KeyboardEvent | MouseEvent, reservation: Reservation) {
        const isAllow =
            e instanceof MouseEvent ||
            (e instanceof KeyboardEvent && (e.key === 'Enter' || e.key === ' '));

        if (isAllow) {
            e.preventDefault();
            selectReservation(reservation);
        }
    }

    function selectReservation(reservation: Reservation) {
        if (reservation === selectedReservation) {
            selectedReservation = null;
            reservationModel.clear();
            return;
        }

        selectedReservation = reservation;
        reservationModel.set(reservation);
    }

    $inspect(selectedReservation);

    let pendingChanges = $state<PendingToChange[]>([]);

    function addPendingToChange(type: ChangeType) {
        // 유효성 검사: 장소, 예약자, 시간이 비어있으면 실행하지 않음
        if (!reservationModel.room.name || !reservationModel.member || reservationModel.times.length === 0) {
            alert('장소, 예약자, 시간 정보를 모두 입력해주세요.');
            return;
        }

        // 수정 또는 삭제 시에는 기존 예약 정보가 선택되었는지 확인
        if (type !== 'APPLY' && !reservationModel.id) {
            alert('수정 또는 삭제할 예약을 먼저 선택해주세요.');
            return;
        }

        const newChange: PendingToChange = {
            id: Date.now(), // 고유한 임시 ID 부여
            type: type,
            data: $state.snapshot(reservationModel) // 현재 폼 데이터를 복사해서 저장
        };

        pendingChanges.push(newChange);

        // 폼 초기화
        reservationModel.clear();
        selectedReservation = null;
    }

    function removePendingToChange(id: number) {
        pendingChanges = pendingChanges.filter((change) => change.id !== id);
    }

    function handleFinalSave() {
        if (pendingChanges.length === 0) {
            alert('저장할 내역이 없습니다.');
            return;
        }

        console.log('--- 최종 저장 시작 ---');

        pendingChanges.forEach((change) => {
            switch (change.type) {
                case 'APPLY':
                    // 실제로는 여기서 서버 API를 호출하여 데이터를 생성합니다.
                    console.log('[등록 처리]', change.data);
                    fakeReservation.push(change.data); // 테스트용으로 실제 데이터에 반영
                    break;
                case 'EDIT': {
                    // 실제로는 여기서 서버 API를 호출하여 데이터를 업데이트합니다.
                    console.log('[수정 처리]', change.data);
                    const indexToUpdate = fakeReservation.findIndex(r => r.id === change.data.id);
                    if (indexToUpdate > -1) fakeReservation[indexToUpdate] = change.data;
                    break;
                }
                case 'DELETE':
                    // 실제로는 여기서 서버 API를 호출하여 데이터를 삭제합니다.
                    console.log('[삭제 처리]', change.data);
                    fakeReservation = fakeReservation.filter(r => r.id !== change.data.id);
                    break;
            }
        });

        console.log('--- 모든 내역 처리 완료 ---');
        alert('모든 변경사항이 저장되었습니다.');
    }

</script>

    <main class="p-4 bg-gray-100 min-h-screen">
	<div class="flex justify-between items-center mb-4">
		<div class="flex items-center space-x-4">
                  <input type="date" placeholder="날짜 선택" class="bg-white px-4 py-2 border rounded-md shadow-sm"/>
			<span class="text-gray-600">default - Today</span>
		</div>
	</div>

	<!-- Rooms Status -->
	<div class="relative mb-4">
		<div class="flex space-x-4 overflow-x-auto p-2 scrollbar-hide">
			{#each displayedRooms as room}
				<div class="bg-white p-3 rounded-lg shadow min-w-[180px] flex-shrink-0">
                                  <h3 class="font-bold text-lg border-b pb-2 mb-2">{room.name}</h3>
                                  {#each times as time }
                                    {@const reservation = findReservation(room.id, time)}
                                  <ul class="space-y-1 text-sm" onclick={(e) => handleReservationItem(e, reservation)}
                                      onkeydown={(e) => handleReservationItem(e, reservation)}>
                                      <li class="flex items-center">
                                        <span class={`w-3 h-3 rounded-full mr-2 ${ reservation ? 'bg-green-400' : 'bg-red-400'}`}></span>
                                        <span>{time}</span>
                                        {#if reservation}
                                          <span class="ml-auto text-gray-500 text-xs" >{reservation.member}</span>
                                        {/if}
                                      </li>
                                  </ul>
                                  {/each}
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
            {#each displayedRooms as room (room.id)}
              <li class="flex items-center p-2 rounded-md hover:bg-gray-100">
                <input
                  type="checkbox"
                  id={`room-${room.id}`}
                  value={room.id}
                  bind:group={selectedRoomIds}
                  class="mr-3 h-4 w-4 cursor-pointer"
                />
                <label for={`room-${room.id}`} class="font-semibold cursor-pointer select-none w-full">{room.name}</label>
              </li>
            {/each}
          </ul>
          <div class="mt-4 pt-4 border-t">
            <h4 class="font-semibold mb-2 text-md">새 공간 등록</h4>
            <input
              type="text"
              placeholder="새 공간 이름 (예: N4120)"
              bind:value={roomBuilder.name}
              class="w-full border rounded p-2 mb-2 text-sm"
            />
            <textarea
              placeholder="공간 설명 (예: 빔 프로젝터가 있어요.)"
              rows="2"
              bind:value={roomBuilder.description}
              class="w-full border rounded p-2 text-sm"
            ></textarea>
          </div>
          <div class="flex justify-end space-x-2 mt-4">
            <button
              onclick={handleAddRoom}
              disabled={!roomBuilder.name.trim()}
              class="bg-blue-500 text-white px-4 py-1 rounded-md text-sm transition hover:bg-blue-600 active:scale-95 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              등록
            </button>
            <button
              onclick={handleDeleteSelectedRooms}
              disabled={selectedRoomIds.length === 0}
              class="bg-red-500 text-white px-4 py-1 rounded-md text-sm transition hover:bg-red-600 active:scale-95 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              삭제
            </button>
          </div>
        </div>

        <div class="bg-white p-4 rounded-lg shadow lg:col-span-2">
          <div class="flex justify-between items-center mb-4 border-b pb-2">
            <h3 class="font-bold text-lg">공간 예약 관리</h3>
            <div class="flex space-x-1">
              <button onclick={() => addPendingToChange('APPLY')} class="bg-blue-500 text-white px-3 py-1 rounded-md text-sm">등록</button>
              <button onclick={() => addPendingToChange('EDIT')} class="bg-yellow-500 text-white px-3 py-1 rounded-md text-sm">수정</button>
              <button onclick={() => addPendingToChange('DELETE')} class="bg-red-500 text-white px-3 py-1 rounded-md text-sm">삭제</button>
            </div>
          </div>
          <div class="space-y-2">
            <div class="grid grid-cols-3 items-center">
              <label for="date" class="text-sm font-medium">날짜 :</label>
              <input type="date" id="date" bind:value={reservationModel.date} class="col-span-2 border rounded-md px-2 py-1 text-sm" />
            </div>
            <div class="grid grid-cols-3 items-center">
              <label for="place" class="text-sm font-medium">장소 :</label>
              <select id="place" class="col-span-2 border rounded-md px-2 py-1 text-sm bg-white"
                      bind:value={reservationModel.room.name}>
                {#each displayedRooms as room}
                  <option value={room.name}>{room.name}</option>
                {/each}
              </select>
            </div>
            <div class="grid grid-cols-3 items-center">
              <label for="time" class="text-sm font-medium">시간 :</label>
              <div class="col-span-2 flex items-center space-x-2">
                <input type="datetime" bind:value={reservationModel.times[0]} class="border rounded-md px-2 py-1 w-16 text-sm" />
                <span>~</span>
                <input type="datetime" bind:value={reservationModel.times[2]} class="border rounded-md px-2 py-1 w-16 text-sm" />
              </div>
            </div>
            <div class="grid grid-cols-3 items-center">
              <label for="reserver" class="text-sm font-medium">예약자 :</label>
              <input type="text" id="reserver" bind:value={reservationModel.member} class="col-span-2 border rounded-md px-2 py-1 text-sm" />
            </div>
            <div class="grid grid-cols-3 items-start">
              <label for="description" class="text-sm font-medium mt-1">설명 :</label>
              <textarea id="description" rows="2" class="col-span-2 border rounded-md px-2 py-1 text-sm" bind:value={reservationModel.description}>{reservationModel.description}</textarea>
            </div>
          </div>
          <div class="mt-4 pt-4 border-t">
            <h4 class="font-semibold mb-2 text-md">반영할 내역</h4>
            {#if pendingChanges.length === 0}
              <p class="text-center text-gray-400 text-sm py-4">변경할 내역이 없습니다.</p>
            {:else}
              <ul class="space-y-2 max-h-40 overflow-y-auto">
                {#each pendingChanges as change (change.id)}
                  <li class="flex items-center justify-between p-2 bg-gray-50 rounded-md">
                    <div>
                            <span class={`font-bold text-xs px-2 py-1 rounded-full text-white ${
                                change.type === 'APPLY' ? 'bg-blue-500' :
                                change.type === 'EDIT' ? 'bg-yellow-500' : 'bg-red-500'
                            }`}>
                                {change.type}
                            </span>
                      <span class="ml-2 text-sm">{change.data.room.name} / {change.data.times.join(', ')}</span>
                    </div>
                    <button onclick={() => removePendingToChange(change.id)} class="text-gray-400 hover:text-red-600 font-bold">X</button>
                  </li>
                {/each}
              </ul>
            {/if}
          </div>
          <div class="flex justify-end mt-3 pt-3 border-t">
            <button onclick={handleFinalSave} class="px-4 py-2 bg-green-600 text-white rounded-2xl shadow hover:bg-green-700 active:scale-95 transition duration-200">최종 저장</button>
          </div>
        </div>
      </div>
</main>
