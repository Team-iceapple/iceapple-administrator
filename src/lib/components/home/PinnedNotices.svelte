<script lang="ts">
  type Props = {
    notices: {
      id: string;
      title: string;
    }[];
  };
  let { notices }: Props = $props();
</script>

<section class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
  <h2 class="text-lg font-medium text-gray-900 mb-4">고정 공지사항</h2>
  <div class="space-y-3">
    {#each notices as notice}
      <div class="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer">
        <i class="text-indigo-600 mt-1 fas fa-thumbtack"></i>
        <div class="flex-1">
          <h3 class="font-medium text-gray-900">{notice.title}</h3>
        </div>
      </div>
    {/each}
  </div>
</section>
