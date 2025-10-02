<script lang="ts">
  type Props = {
    title: string;
    value: string | number;
    icon: string;
  };
  let { title, value, icon }: Props = $props();
</script>

<div class="flex items-center space-x-3 mb-4">
  <div class="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
    <i class="text-indigo-600 {icon}"></i>
  </div>
  <div>
    <h3 class="font-bold text-gray-900">{title}</h3>
    <p class="text-2xl font-semibold text-indigo-600">{value}</p>
  </div>
</div>