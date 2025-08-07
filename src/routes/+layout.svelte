<script lang="ts">
import '@/app.css';
import { Header, SideBar } from '$lib/components/ui';
import type { LayoutProps } from './$types';

let { data, children }: LayoutProps = $props();
</script>

<div class="min-h-screen bg-gray-50 ">
  <SideBar/>

  <div class="ml-64">
    <Header title={data.pageTitle}/>

    <main class="p-6">
      {@render children()}
    </main>
  </div>
</div>
