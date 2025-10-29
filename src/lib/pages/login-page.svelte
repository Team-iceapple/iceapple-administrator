<script lang="ts">
    import {goto} from '$app/navigation';
    import {setToken} from '$lib/utils/auth';
    import {redirectIfAuthenticated} from '$lib/utils/auth-guard';
    import {onMount} from 'svelte';

    let username = $state('');
    let password = $state('');
    let isLoading = $state(false);
    let errorMessage = $state('');

    onMount(() => {
        redirectIfAuthenticated();
    });

    async function handleLogin() {
        if (!username.trim() || !password.trim()) {
            errorMessage = '아이디와 비밀번호를 입력해주세요.';
            return;
        }

        isLoading = true;
        errorMessage = '';

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    user_name: username.trim(),
                    password: password.trim(),
                }),
            });

            const data = await response.json();

            if (response.ok && data.success) {
                setToken(data.token);

                goto('/dashboard');
            } else {
                // HTTP 상태 코드에 따른 에러 메시지
                if (response.status === 401) {
                    errorMessage = '아이디 또는 비밀번호가 올바르지 않습니다.';
                } else if (response.status === 403) {
                    errorMessage = '접근이 거부되었습니다. 관리자에게 문의하세요.';
                } else if (response.status === 500) {
                    errorMessage = '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
                } else {
                    errorMessage = data.error || '로그인에 실패했습니다.';
                }
            }
        } catch (error) {
            console.error('로그인 에러:', error);
            errorMessage = '네트워크 오류가 발생했습니다.';
        } finally {
            isLoading = false;
        }
    }

    function handleKeyPress(event: KeyboardEvent) {
        if (event.key === 'Enter') {
            handleLogin();
        }
    }
</script>

<svelte:head>
  <title>로그인 - Kiosk Admin</title>
</svelte:head>

<div class="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
  <div class="sm:mx-auto sm:w-full sm:max-w-md">
    <div class="flex items-center justify-center mt-3">
      <img src="/logo.jpg" alt="Logo" class="h-28 w-28"/>
    </div>
    <div class="flex items-center justify-center mt-3">
      <p class="text-l text-gray-500">
        국립한밭대학교 모바일융합공학과
      </p>
    </div>
  </div>

  <div class="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
    <div class="bg-white py-8 px-6 shadow-lg rounded-lg">
      <form class="space-y-6" onsubmit={(e) => { e.preventDefault(); handleLogin(); }}>
        <div>
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
              </svg>
            </div>
            <input
              id="username"
              name="username"
              type="text"
              bind:value={username}
              onkeypress={handleKeyPress}
              required
              class="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500 sm:text-sm"
              placeholder="Enter your name"
            />
          </div>
        </div>

        <div>
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
              </svg>
            </div>
            <input
              id="password"
              name="password"
              type="password"
              bind:value={password}
              onkeypress={handleKeyPress}
              required
              class="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500 sm:text-sm"
              placeholder="Enter your password"
            />
          </div>
        </div>

        {#if errorMessage}
          <div class="rounded-md bg-red-50 p-4">
            <div class="text-sm text-red-700">
              {errorMessage}
            </div>
          </div>
        {/if}

        <div>
          <button
            type="submit"
            disabled={isLoading}
            class="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gray-400 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            {#if isLoading}
              <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none"
                   viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              로그인 중...
            {:else}
              Login In
            {/if}
          </button>
        </div>
      </form>
    </div>
  </div>
</div>