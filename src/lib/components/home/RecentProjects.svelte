<script lang="ts">
  type Props = {
    projects: {
      id: string;
      name: string;
      date: string;
    }[];
  };
  let { projects }: Props = $props();
</script>

<section class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
  <div class="flex items-center justify-between mb-4">
    <h2 class="text-lg font-medium text-gray-900">최근 등록된 프로젝트</h2>
    <button class="text-indigo-600 text-sm hover:text-indigo-700">더보기</button>
  </div>
  <div class="space-y-4">
    {#each projects as project}
      <div class="flex items-center space-x-4">
        <div class="w-16 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
          <i class="text-gray-400 fas fa-image"></i>
        </div>
        <div class="flex-1">
          <h3 class="font-medium text-gray-900">{project.name}</h3>
          <p class="text-sm text-gray-500">{project.date}</p>
        </div>
      </div>
    {/each}
  </div>
</section>
