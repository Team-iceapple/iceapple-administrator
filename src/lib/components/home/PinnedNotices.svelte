<script lang="ts">
  type Notice = {
    id: string | number;
    title: string;
    content?: string;
    createdAt?: string;
  };

  type Props = {
    notices: Notice[];
  };
  let { notices }: Props = $props();
</script>

<div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
  <h2 class="text-lg font-medium text-gray-900 mb-4">고정 공지사항</h2>
  
  <div class="space-y-3">
    {#each notices.slice(0, 5) as notice}
      <div class="py-2 border-b border-gray-100 last:border-b-0">
        <h3 class="font-medium text-gray-900 mb-1">{notice.title}</h3>
        {#if notice.content}
          <p class="text-sm text-gray-600 line-clamp-2">{notice.content}</p>
        {/if}
        {#if notice.createdAt}
          <p class="text-xs text-gray-400 mt-1">{notice.createdAt}</p>
        {/if}
      </div>
    {/each}
  </div>
  
  {#if notices.length === 0}
    <p class="text-gray-500 text-sm">고정된 공지사항이 없습니다.</p>
  {/if}
</div>