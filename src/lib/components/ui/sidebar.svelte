<script lang="ts">
    import { goto } from '$app/navigation';
    import {removeToken, hasToken, extendSession, getTokenTimeLeft} from '$lib/utils/auth';
    import {onDestroy, onMount} from 'svelte';

    // 사이드바 메뉴 아이템
    const menuItems = [
        { name: 'Home', href: '/', icon: '/images/slidebar/home.svg' },
        { name: 'Place', href: '/place', icon: '/images/slidebar/place.svg' },
        { name: 'Projects', href: '/projects', icon: '/images/slidebar/project.svg' },
    ];

    let isLoggedIn = $state(false);
    let isExtending = $state(false);
    let timeLeft = $state(0);
    let timer: number | null = null;


    onMount(() => {
        isLoggedIn = hasToken();
        if(isLoggedIn) {
            updateTimeLeft();
            timer = setInterval(updateTimeLeft, 1000);
        }
    });

    onDestroy(() => {
        if(timer) {
            clearInterval(timer);
        }
    });

    function updateTimeLeft() {
        timeLeft = getTokenTimeLeft();

        if(timeLeft === 0 && isLoggedIn) {
            removeToken();
            isLoggedIn = false;
            if(timer) {
                clearInterval(timer);
                timer = null;
            }
        }
    }

    function formatTime(seconds: number) {
        if(seconds <= 0) {
            return '만료됨';
        }
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;

        if(hours > 0) {
            return `${hours}시간 ${minutes}분`
        } else if (minutes > 0) {
            return `${minutes}분 ${secs}초`
        } else if (secs > 0) {
            return `${secs}초`
        }
    }


    // 세션 연장 처리
    async function handleExtendSession() {
        isExtending = true;

        try {
            const result = await extendSession();
            console.log(result.success);
            console.log(result.message);

            if (result.success) {
                updateTimeLeft();
                alert(result.message);
            } else {
                alert(result.message);
            }
        } catch (error) {
            console.error('세션 연장 에러:', error);
            alert('세션 연장 중 오류가 발생했습니다.');
        } finally {
            isExtending = false;
        }
    }

    // 로그아웃 처리
    function handleLogout() {
        if (confirm('정말 로그아웃 하시겠습니까?')) {
            // 토큰 삭제
            removeToken();

            // 로그인 페이지로 리다이렉트
            goto('/');
        }
    }
</script>

<aside class="fixed left-0 top-0 z-40 h-screen w-64 bg-gray-50  border-r border-gray-200 ">
  <div class="flex h-full flex-col">
    <!-- 로고 영역 -->
    <div class="flex h-20 items-center justify-center border-b border-gray-200 ">
      <div class="flex items-center space-x-3 gap-1">
        <img src="/logo.jpg" alt="Logo" class="h-17 w-17"/>
        <div class="flex flex-col">
          <span class="text-lg font-bold text-gray-900 e">국립한밭대학교</span>
          <p class="text-l text-gray-500 ">모바일융합공학과</p>
        </div>
      </div>
    </div>

    <nav class="flex-1 space-y-1 px-4 py-4">
      {#each menuItems as item}
        <a
          href={item.href}
          class="flex items-center px-4 py-3 text-2xl font-medium rounded-lg transition-colors duration-200
						? 'bg-blue-100 text-blue-700'
						: 'text-gray-700 hover:bg-gray-300 hover:text-gray-900 hover:shadow-sm'}"
        >
          <img src={item.icon} alt={item.name + ' 아이콘'} class="mr-3 h-6 w-6"/>
          {item.name}
        </a>
      {/each}
    </nav>

    <!-- 세션 연장 및 로그아웃 버튼 (로그인 상태일 때만 표시) -->
    {#if isLoggedIn}
      <div class="border-t border-gray-200  p-4 space-y-2">
        <!-- 세션 남은 시간 표시 -->
        <div class="px-4 py-2 bg-gray-100 rounded-lg">
          <div class="flex items-center justify-between">
            <span class="text-sm font-medium text-gray-700">로그인 남은 시간</span>
            <span class="text-sm font-bold {timeLeft < 300 ? 'text-red-600' : timeLeft < 900 ? 'text-yellow-600' : 'text-green-600'}">
              {formatTime(timeLeft)}
            </span>
          </div>
        </div>

        <!-- 세션 연장 버튼 -->
        <button
          onclick={handleExtendSession}
          disabled={isExtending}
          class="flex items-center w-full px-4 py-3 text-xl font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {#if isExtending}
            <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            연장 중...
          {:else}
            <svg class="mr-3 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            로그인 연장
          {/if}
        </button>

        <!-- 로그아웃 버튼 -->
        <button
          onclick={handleLogout}
          class="flex items-center w-full px-4 py-3 text-xl font-medium text-red-600 hover:bg-red-50  rounded-lg transition-colors duration-200"
        >
          <img src="/images/slidebar/logout.svg" alt="로그아웃 아이콘" class="mr-3 h-5 w-5"/>
          로그아웃
        </button>
      </div>
    {/if}
  </div>
</aside>
