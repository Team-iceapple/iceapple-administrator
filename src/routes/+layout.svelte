<script lang="ts">
    import '@/app.css';
    import { Header, SideBar } from '$lib/components/ui';
    import { page } from '$app/state';
    import type { LayoutProps } from './$types';

    let { data, children }: LayoutProps = $props();

    const showSidebar = $derived(data.isAuthenticated && page.url.pathname !== '/');
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
