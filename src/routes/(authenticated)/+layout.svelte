<script lang="ts">
  import { Header, SideBar } from '$lib/components/ui';
  import { hasToken } from '$lib/utils/auth';
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import type { LayoutData } from './$types';

  let { data, children }: { data: LayoutData, children: any } = $props();
  
  let isAuthenticated = $state(data.isAuthenticated);

  onMount(() => {
    // 클라이언트에서 토큰 확인
    const clientTokenExists = hasToken();
    if (!clientTokenExists) {
      // 토큰이 없으면 로그인 페이지로 리다이렉트
      goto('/');
      return;
    }
    
    if (clientTokenExists !== isAuthenticated) {
      isAuthenticated = clientTokenExists;
    }

    // 스토리지 변화 감지하여 인증 상태 업데이트
    const handleStorageChange = () => {
      const hasTokenNow = hasToken();
      if (!hasTokenNow) {
        goto('/');
        return;
      }
      isAuthenticated = hasTokenNow;
    };

    // 커스텀 인증 상태 변경 이벤트 감지
    const handleAuthStateChange = (event: CustomEvent) => {
      if (!event.detail.authenticated) {
        goto('/');
        return;
      }
      isAuthenticated = event.detail.authenticated;
    };

    window.addEventListener('authStateChanged', handleAuthStateChange as EventListener);
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('authStateChanged', handleAuthStateChange as EventListener);
      window.removeEventListener('storage', handleStorageChange);
    };
  });
</script>

<!-- 인증된 페이지는 항상 사이드바와 헤더 표시 -->
<SideBar/>

<div class="ml-64">
  <Header title={data.pageTitle}/>
  
  <main class="p-2">
    {@render children()}
  </main>
</div>
