<script lang="ts">
    import '@/app.css';
    import { Header, SideBar } from '$lib/components/ui';
    import { requireAuth } from '$lib/utils/auth-guard';
    import { onMount } from 'svelte';
    import { page } from '$app/state';
    import type { LayoutProps } from './$types';

    let { data, children }: LayoutProps = $props();

    onMount(() => {
        // 로그인 페이지가 아닌 경우에만 인증 확인
        if (page.url.pathname !== '/login') {
            requireAuth();
        }
    });
</script>

<div class="min-h-screen bg-gray-50 ">
  {#if page.url.pathname !== '/login'}
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
