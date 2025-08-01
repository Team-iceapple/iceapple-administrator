<script lang="ts">
    import '@/app.css';
    import {Header, SideBar} from '$lib/components/ui';

    let {children} = $props();
</script>

<div class="min-h-screen bg-gray-50 dark:bg-gray-900">
  <SideBar/>

  <div class="ml-64">
    <Header/>

    <main class="p-6">
      {@render children()}
    </main>
  </div>
</div>
