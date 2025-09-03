<script lang="ts">
  type Props = {
    works: any[];
  };
  let { works }: Props = $props();

  const projectsByYear = works.reduce((acc, work) => {
    if (!acc[work.year]) {
      acc[work.year] = 0;
    }
    acc[work.year]++;
    return acc;
  }, {} as Record<number, number>);
</script>

<div class="toggle-content bg-gray-50 rounded-lg p-3 mt-3">
  <div class="space-y-2 text-sm">
    {#each Object.entries(projectsByYear) as [year, count]}
      <div class="flex justify-between">
        <span class="">{year}</span>
        <span class="font-medium">{count}건</span>
      </div>
    {/each}
  </div>
</div>
