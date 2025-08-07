<script lang="ts">
import { ProjectPage } from '$lib/pages';
import type { PageProps } from './$types';

const { data }: PageProps = $props();
</script>

<ProjectPage
  projects={data.projects}
  IMAGE_URL={data.IMAGE_URL}
  currentPage={data.currentPage}
  maxPage={data.maxPage}
/>