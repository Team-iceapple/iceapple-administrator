<script lang="ts">
    import {page} from '$app/stores';
    import {goto} from '$app/navigation';

    function goToLogin() {
        goto('/');
    }
</script>

<div class="min-h-screen bg-gray-50 flex items-center justify-center">
  <div class="text-center">
    <div class="mb-8">
      <h1 class="text-6xl font-bold text-gray-900 mb-4">404</h1>
      <h2 class="text-2xl font-semibold text-gray-700 mb-4">페이지를 찾을 수 없습니다</h2>
      <p class="text-gray-600 mb-8">
        요청하신 페이지가 존재하지 않거나 이동되었을 수 있습니다.
      </p>
    </div>

    <div class="space-y-4">
      <button
        class="bg-gray-600 hover:bg-gray-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
        onclick={goToLogin}
      >
        로그인 페이지로 이동
      </button>

      <div class="text-sm text-gray-500">
        <p>현재 경로: <code class="bg-gray-200 px-2 py-1 rounded text-gray-800">{$page.url.pathname}</code></p>
      </div>
    </div>
  </div>
</div>
