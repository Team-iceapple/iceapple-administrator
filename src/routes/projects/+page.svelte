<script lang="ts">
import { ProjectPage } from '$lib/pages';
import type { PageProps } from './$types';

const { data, form }: PageProps = $props();
</script>

<ProjectPage
  form={form}
  projects={data.projects}
  currentPage={data.currentPage}
  maxPage={data.maxPage}
/>