<script lang="ts">
import { ProjectPage } from '$lib/pages';
import type { PageProps } from './$types';

const { data }: PageProps = $props();
</script>

<ProjectPage
  projects={data.projects}
  currentPage={data.currentPage}
  maxPage={data.maxPage}
/>