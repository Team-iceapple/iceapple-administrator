<script lang="ts">
  import '@/app.css';
  import type { LayoutProps } from './$types';

  let { data, children }: LayoutProps = $props();
</script>

<!-- 루트 레이아웃은 단순하게 - 로그인 페이지와 에러 페이지만 처리 -->
<div class="min-h-screen bg-gray-50">
  <main>
    {@render children()}
  </main>
</div>