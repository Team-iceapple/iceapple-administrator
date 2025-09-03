<script lang="ts">
  import type { Room } from '$lib/types';
  import type {
    HomeVideo,
    RoomStatus,
    ReservationSummary,
    ProjectYearStat
  } from '$lib/types/home';

  // 1) 홈 영상
  const homeVideo = $state<HomeVideo>({ filename: 'mobile.mp4', url: null });

  // 2) 회의실 + 상태
  const rooms = $state<Room[]>([
    { id: 'r_a', name: 'Room A', description: null },
    { id: 'r_b', name: 'Room B', description: null },
    { id: 'r_c', name: 'Room C', description: null }
  ]);

  const roomStatuses = $state<RoomStatus[]>([
    { roomId: 'r_a', status: 'AVAILABLE' },
    { roomId: 'r_b', status: 'IN_USE' },
    { roomId: 'r_c', status: 'AVAILABLE' }
  ]);

  const totalRooms = $derived(rooms.length);

  function getStatus(roomId: string) {
    return roomStatuses.find(s => s.roomId === roomId)?.status ?? 'AVAILABLE';
  }

  // 3) 오늘 예약된 사용자(요약)
  const todayReservations = $state<ReservationSummary>({
    count: 6,
    users: [{ name: '김학생', mask: '****' }, { name: '이학생', mask: '****' }, { name: '박학생', mask: '****' }]
  });

  // 4) 전체 프로젝트 수(연도별)
  const projectStats = $state<ProjectYearStat[]>([
    { year: 2024, count: 23 },
    { year: 2023, count: 17 },
    { year: 2022, count: 5 }
  ]);

  const totalProjects = $derived(projectStats.reduce((acc, s) => acc + s.count, 0));

  // 액션 버튼(형식만 유지)
  function onClickEditVideo() {}
  function onClickDeleteVideo() {}
  function onClickSaveVideo() {}
</script>

<!-- 메인 컨테이너: 레이아웃에 맞게 여백만 가볍게 -->
<main class="p-6 space-y-6">

  <!-- 1) 홈 영상 등록 -->
  <section class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
    <h2 class="text-lg font-medium text-gray-900 mb-4">홈 영상 등록</h2>
    <div class="flex items-center space-x-4">
      <div class="w-32 h-20 bg-gray-100 rounded-lg flex items-center justify-center">
        <i class="text-3xl text-gray-400 fas fa-circle-play"></i>
      </div>
      <div class="flex-1">
        <p class="text-sm text-gray-600 mb-2">현재: {homeVideo.filename}</p>
        <div class="flex space-x-2">
          <button class="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-indigo-700" on:click={onClickEditVideo}>수정</button>
          <button class="bg-red-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-700" on:click={onClickDeleteVideo}>삭제</button>
          <button class="bg-cyan-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-cyan-700" on:click={onClickSaveVideo}>저장</button>
        </div>
      </div>
    </div>
  </section>

  <!-- 2~4) 요약 카드 3개 -->
  <section class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    <!-- 전체 회의실 수 -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div class="flex items-center space-x-3 mb-4">
        <div class="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
          <i class="text-indigo-600 fas fa-door-open"></i>
        </div>
        <div>
          <h3 class="font-medium text-gray-900">전체 회의실 수</h3>
          <p class="text-2xl font-semibold text-indigo-600">{totalRooms}</p>
        </div>
      </div>
      <div class="bg-gray-50 rounded-lg p-3">
        <div class="space-y-2 text-sm">
          {#each rooms as room}
            {@const status = getStatus(room.id)}
            <div class="flex justify-between">
              <span>{room.name}</span>
              <span class={status === 'AVAILABLE' ? 'text-green-600' : 'text-red-600'}>
                {status === 'AVAILABLE' ? '사용가능' : '사용중'}
              </span>
            </div>
          {/each}
        </div>
      </div>
    </div>

    <!-- 오늘 예약된 사용자 수 -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div class="flex items-center space-x-3 mb-4">
        <div class="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
          <i class="text-purple-600 fas fa-users"></i>
        </div>
        <div>
          <h3 class="font-medium text-gray-900">오늘 예약된 사용자 수</h3>
          <p class="text-2xl font-semibold text-purple-600">{todayReservations.count}명</p>
        </div>
      </div>
      <div class="bg-gray-50 rounded-lg p-3">
        <div class="space-y-2 text-sm">
          {#each todayReservations.users as u}
            <div class="flex justify-between">
              <span>{u.name}</span>
              <span class="text-gray-500">{u.mask ?? ''}</span>
            </div>
          {/each}
        </div>
      </div>
    </div>

    <!-- 전체 프로젝트 수 -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div class="flex items-center space-x-3 mb-4">
        <div class="w-10 h-10 bg-cyan-100 rounded-lg flex items-center justify-center">
          <i class="text-cyan-600 fas fa-diagram-project"></i>
        </div>
        <div>
          <h3 class="font-medium text-gray-900">전체 프로젝트 수</h3>
          <p class="text-2xl font-semibold text-cyan-600">{totalProjects}</p>
        </div>
      </div>
      <div class="bg-gray-50 rounded-lg p-3">
        <div class="space-y-2 text-sm">
          {#each projectStats as s}
            <div class="flex justify-between">
              <span>{s.year}</span>
              <span class="font-medium">{s.count}건</span>
            </div>
          {/each}
        </div>
      </div>
    </div>
  </section>
</main>