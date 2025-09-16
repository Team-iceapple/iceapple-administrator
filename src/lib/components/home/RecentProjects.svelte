<script lang="ts">
  import type { Project } from '$lib/types/project';

  type Props = {
    projects: Project[];
  };
  let { projects }: Props = $props();
</script>

<div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
  <h2 class="text-lg font-medium text-gray-900 mb-4">최근 등록된 프로젝트</h2>
  
  <div class="space-y-3">
    {#each projects.slice(0, 5) as project}
      <div class="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
        <div>
          <h3 class="font-medium text-gray-900">{project.title}</h3>
          <p class="text-sm text-gray-500">{project.year}년</p>
        </div>
        <div class="text-right">
          <p class="text-sm text-gray-600">
            {project.members?.length || 0}명
          </p>
        </div>
      </div>
    {/each}
  </div>
  
  {#if projects.length === 0}
    <p class="text-gray-500 text-sm">등록된 프로젝트가 없습니다.</p>
  {/if}
</div>