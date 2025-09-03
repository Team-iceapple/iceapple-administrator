<script lang="ts">
  type Props = {
    title: string;
    value: number | string;
    icon: string;
  };
  let { title, value, icon }: Props = $props();
</script>

<div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
  <div class="flex items-center space-x-3">
    <div class="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
      <i class="{icon} text-indigo-600"></i>
    </div>
    <div>
      <h3 class="font-medium text-gray-900">{title}</h3>
      <p class="text-2xl font-semibold text-indigo-600">{value}</p>
    </div>
  </div>
</div>
