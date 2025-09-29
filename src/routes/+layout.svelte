<script lang="ts">
    import '@/app.css';
    import { Header, SideBar } from '$lib/components/ui';
    import { page } from '$app/state';
    import { hasToken } from '$lib/utils/auth';
    import { onMount } from 'svelte';
    import type { LayoutProps } from './$types';

    let { data, children }: LayoutProps = $props();

    let isClientAuthenticated = $state(false);

    onMount(() => {
        isClientAuthenticated = hasToken();

        // 스토리지 변화 감지하여 인증 상태 업데이트
        const handleStorageChange = () => {
            isClientAuthenticated = hasToken();
        };

        window.addEventListener('storage', handleStorageChange);

        // 주기적으로 토큰 상태 확인 (다른 탭에서 로그인했을 경우 대비)
        const interval = setInterval(() => {
            isClientAuthenticated = hasToken();
        }, 1000);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
            clearInterval(interval);
        };
    });

    const showSidebar = $derived(
        isClientAuthenticated &&
        page.url.pathname !== '/' &&
        !page.error // 에러 페이지에서는 사이드바 숨김
    );

</script>

<div class="min-h-screen bg-gray-50 ">
  {#if showSidebar}
    <SideBar/>

    <div class="ml-64">
      <Header title={data.pageTitle}/>

      <main class="p-2">
        {@render children()}
      </main>
    </div>
  {:else}
    <main>
      {@render children()}
    </main>
  {/if}
</div>
