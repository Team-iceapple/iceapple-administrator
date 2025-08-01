<script lang="ts">
    // 사이드바 메뉴 아이템
    const menuItems = [
        {name: '홈', icon: '/images/slidebar/home.svg'},
        {name: '회의실 예약', icon: '/images/slidebar/rooms.svg'},
        {name: '졸업작품 관리', icon: '/images/slidebar/project.svg'}
    ];

    // 로그아웃 처리
    function handleLogout() {
        if (confirm('정말 로그아웃 하시겠습니까?')) {
            console.log('로그아웃 처리');
            alert('로그아웃되었습니다.');
            // 여기에 실제 로그아웃 로직 추가 예정 (예: 세션 삭제, 리다이렉트 등)
        }
    }
</script>

<aside class="fixed left-0 top-0 z-40 h-screen w-64 bg-gray-50 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
<div class="flex h-full flex-col">
    <!-- 로고 영역 -->
    <div class="flex h-16 items-center justify-center border-b border-gray-200 dark:border-gray-700">
      <div class="flex items-center space-x-3 gap-2">
        <img src="/logo.webp" alt="Logo" class="h-13 w-auto"/>
        <div class="flex flex-col">
          <span class="text-lg font-bold text-gray-900 dark:text-white">Kiosk Admin</span>
          <p class="text-sm text-gray-500 dark:text-gray-400">모바일융합공학과</p>
        </div>
      </div>
    </div>

    <!-- 메뉴 영역 -->
    <nav class="flex-1 space-y-1 px-4 py-4">
      {#each menuItems as item}
        <div
          class="flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-200 text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700">
          <img src={item.icon} alt={item.name + ' 아이콘'} class="mr-3 h-6 w-6"/>
          {item.name}
        </div>
      {/each}
    </nav>


    <!-- 로그아웃 버튼 -->
    <div class="border-t border-gray-200 dark:border-gray-700 p-4">
      <button
        onclick={handleLogout}
        class="flex items-center w-full px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 rounded-lg transition-colors duration-200"
      >
        <img src="/images/slidebar/logout.svg" alt="로그아웃 아이콘" class="mr-3 h-6 w-6"/>
        로그아웃
      </button>
    </div>
  </div>
</aside>
