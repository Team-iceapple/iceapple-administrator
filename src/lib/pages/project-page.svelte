<script lang="ts">
import { type ActionResult, error } from '@sveltejs/kit';
import { applyAction, enhance } from '$app/forms';
import { goto, invalidateAll } from '$app/navigation';
import { MemberModel, ProjectFormModel } from '$lib/models/projects';
import type { DetailProjectGetResponse, Project } from '$lib/types';
import { generateYears } from '$lib/utils';
import { authFetch } from '$lib/utils/auth';

const { form, projects, currentPage: initialCurrentPage, maxPage } = $props();

const MIN_PAGE = 1;
let currentPage = $derived<number>(initialCurrentPage);
let currentProjects = $derived<Project[]>(projects);
let selectedProject = $state<Project | null>(null);

const memberModel = new MemberModel();
const member = $derived(memberModel.member);
const projectFormModel = new ProjectFormModel(memberModel);
const project = $derived(projectFormModel.project);
const projectFile = $derived(projectFormModel.projectFile);

async function selectProject(projectId: string) {
  if (projectId === selectedProject?.id) {
    selectedProject = null;
    projectFormModel.clear();
    return;
  }

  const response = await authFetch(`/api/project/${projectId}`);

  const body: DetailProjectGetResponse = await response.json();

  if (!response.ok) error(404, body.message);

  const project = body.work;
  selectedProject = project;
  projectFormModel.setProject(project);
}

async function handleProjectItem(
  e: KeyboardEvent | MouseEvent,
  projectId: string,
) {
  const isAllow =
    e instanceof MouseEvent ||
    (e instanceof KeyboardEvent && (e.key === 'Enter' || e.key === ' '));

  if (isAllow) {
    e.preventDefault();
    await selectProject(projectId);
  }
}

async function handleDeleteProject() {
  if (!selectedProject) return;
  if (!confirm(`정말로 ${selectedProject.name}을(를) 삭제하시겠습니까?`))
    // 추후 커스텀 모달로 변경 가능
    return;

  const response = await authFetch(`/api/project/${selectedProject.id}`, {
    method: 'DELETE',
  });

  if (!response.ok) error(404, (await response.json()).message);

  projectFormModel.clear();
  await invalidateAll();
  if (currentPage > maxPage) goToPage(maxPage); // 삭제시 최대 페이지가 줄어드는 경우 처리
}

function goToPage(page: number) {
  const isValidPage = MIN_PAGE <= page && page <= maxPage;

  if (isValidPage) {
    goto(`?page=${page}`, {
      keepFocus: true,
      noScroll: true,
    });
  }
}

async function afterProjectCreateOrUpdate(result: ActionResult) {
  await applyAction(result);
  if (result.type === 'success') {
    selectedProject = null;
    projectFormModel.clear();
    await invalidateAll();
  }
}

$inspect(form);
</script>

<div class="flex px-4">
  <!-- 좌측 패널 -->
  <div class="basis-2/3">
    <div class="flex flex-col gap-4 min-h-[1140px] ">
      <div class="mt-2 mx-auto flex items-center gap-4 text-gray-700 text-xl">
        <button class="px-2 py-1 border border-gray-400 rounded-sm
                 hover:bg-gray-100 active:ring-1 active:ring-blue-300
                 transition-colors
                 disabled:bg-gray-100 disabled:text-gray-400 disabled:border-gray-300 disabled:cursor-not-allowed"
                onclick={() => goToPage(currentPage - 1)}
                disabled={currentPage === MIN_PAGE}
        >
          이전
        </button>

        <div class="flex">
          <span class="font-bold">{currentPage}</span>
          <span class="mx-1">/</span>
          <span>{maxPage}</span>
        </div>

        <button class="px-2 py-1 border border-gray-400 rounded-sm
                 hover:bg-gray-100 active:ring-1 active:ring-blue-300
                 transition-colors
                 disabled:bg-gray-100 disabled:text-gray-400 disabled:border-gray-300 disabled:cursor-not-allowed"
                onclick={() => goToPage(currentPage + 1)}
                disabled={currentPage === maxPage}
        >
          다음
        </button>
      </div>
      {#each currentProjects as project (project.id)}
        <!-- 목록 아이템 -->
        <div
          class="flex w-full cursor-pointer items-start justify-between gap-6 rounded-md border border-gray-300 p-4 shadow-sm hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-400"
          class:bg-blue-100={project.id === selectedProject?.id}
          onclick={(e) => handleProjectItem(e, project.id)}
          onkeydown={(e) => handleProjectItem(e, project.id)}
          role="button"
          tabindex={0}
        >
          <div class="flex items-start gap-4">
            <img
              class="size-48 flex-shrink-0 rounded-sm border border-gray-300"
              src={`/api/project/files/${project.thumbnail}?type=png`}
              alt={`${project.name} Thumbnail`}
            />
            <div class="flex flex-col text-left">
              <p class="text-2xl font-semibold text-gray-800">{project.name}</p>
              <p class="text-xl text-gray-500">{project.members.map((member) => member.name)}</p>
            </div>
          </div>

          <div class="w-1/3 max-w-md flex-shrink-0 text-left">
            <p class="mt-9 text-base text-gray-600 line-clamp-3">
              {project.description}
            </p>
          </div>
        </div>
      {/each}
    </div>
  </div>

  <!-- 세로 구분선 -->
  <div class="border-l-2 border-l-gray-100 mx-4"></div>

  <!-- 우측 패널 -->
  <form class="flex flex-col basis-1/2"
        enctype="multipart/form-data"
        method="POST"
        action={`/projects?type=${!!selectedProject ? 'update' : 'create'}${selectedProject ? `&id=${selectedProject.id}` : ''}`}
        use:enhance={() => ({ result }) => afterProjectCreateOrUpdate(result)}
  >
    <div class="p-2 flex gap-4 justify-between items-center border-b border-gray-300">
      <h2 class="font-bold text-2xl">세부 정보</h2>
      <div class="px-2 flex text-2xl gap-4">
        <button class="px-3 py-1 border border-gray-400 rounded-sm text-gray-700 hover:bg-gray-100 hover:text-red-500 active:ring-1 active:ring-blue-300 transition-colors duration-300"
                class:invisible={selectedProject === null}
                type="button"
                onclick={handleDeleteProject}
        >
          삭제
        </button>
        <button class="px-3 py-1 border border-gray-400 rounded-sm text-gray-700 hover:bg-gray-100 active:ring-1 active:ring-blue-300 transition-colors duration-300"
                type="submit"
        >
          {selectedProject ? '저장' : '생성'}
        </button>
      </div>
    </div>
    <!-- 세부 정보 목록 -->
    <div class="flex flex-col p-4 gap-2">
      <!-- 년도 -->
      <div class="flex flex-col gap-1 text-xl">
        <label class="w-36" for="year-input">년도</label>
        <select class="max-w-24 flex-1 p-1 border border-gray-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                id='year-input'
                name="year"
                bind:value={project.year}>
          {#each generateYears(new Date().getFullYear() - 1, 2) as yearNum}
            <option value={yearNum}>{yearNum}</option>
          {/each}
        </select>

        {#if form && form.success === false}
          <p class="absolute text-red-500 text-xl -bottom-8 left-38">{ form.error.fieldErrors.year }</p>
        {/if}
      </div>

      <!-- 프로젝트 이름 -->
      <div class="relative flex flex-col gap-1 text-xl">
        <label class="w-36" for="name-input">제목</label>
        <input class="flex-1 p-1 border border-gray-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
               id="name-input"
               name="name"
               type="text"
               bind:value={project.name}
        />
        {#if form && form.success === false}
          <p class="absolute text-red-500 text-xl -bottom-8 left-38">{ form.error.fieldErrors.name }</p>
        {/if}
      </div>

      <!-- 팀 이름 -->
      <div class="relative flex flex-col gap-1 text-xl">
        <label class="w-36" for="team-name-input">팀 이름</label>
        <input class="flex-1 p-1 border border-gray-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
               id="team-name-input"
               name="team_name"
               type="text"
               bind:value={project.team_name}
        />
        {#if form && form.success === false}
          <p class="absolute text-red-500 text-xl -bottom-8 left-38">{ form.error.fieldErrors.team_name }</p>
        {/if}
      </div>

      <!-- 팀원 -->
      <div class="flex flex-col gap-1">
        <div class="flex flex-col gap-1 text-xl">
          <label class="w-36" for="member-name-input">팀원</label>

          <div class="flex gap-1 h-11">
            <input class="p-1 border border-gray-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                   id="member-name-input"
                   bind:value={member.name}
                   type="text"
                   placeholder="팀원 이름.."
            />
            <input class="p-1 border border-gray-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                   bind:value={member.extra}
                   type="text"
                   placeholder="팀원 세부 정보.."
            />
            <button class="w-18 px-3 py-1 border border-gray-400 rounded-sm text-gray-700 hover:bg-gray-100 active:ring-1 active:ring-blue-300 transition-colors"
                    type="button"
                    onclick={projectFormModel.addMember}
            >
              추가
            </button>
          </div>
        </div>

        <!-- 팀원 목록 -->
        <div class="relative border border-gray-300 rounded">
          <input type="hidden"
                 name="members"
                 value={JSON.stringify(project.members)}
          />

          <table class="table-fixed w-full text-xl">
            <thead>
              <tr class="border-b border-gray-300 bg-slate-50 text-left">
                <th class="w-1/8 px-2 py-1 border-r border-gray-300 font-normal">이름</th>
                <th class="w-1/2 px-2 py-1 font-normal">세부 정보</th>
              </tr>
            </thead>
          </table>
          <div class="h-46 overflow-y-auto">
            <table class="table-fixed w-full text-sm">
              <tbody>
              {#each project.members as member, i (i)}
                <tr class="not-first:border-t last:border-b border-gray-300 text-xl">
                  <td class="w-1/8 px-2 py-1 border-r border-gray-300">{member.name}</td>
                  <td class="relative w-1/2 px-2 py-1">
                    {member.extra}
                    <button class="absolute right-2 text-red-500"
                            type="button"
                            onclick={() => projectFormModel.deleteMember(i)}
                    >X</button>
                  </td>
                </tr>
              {/each}
              </tbody>
            </table>
          </div>
          {#if form && form.success === false}
            <p class="absolute text-red-500 text-xl -bottom-8">{ form.error.fieldErrors.members }</p>
          {/if}
        </div>
      </div>

      <!-- 프로젝트 설명 -->
      <div class="relative flex flex-col text-xl gap-1">
        <label class="w-36" for="description-text-area">설명</label>
        <textarea class="flex-1 p-1 border border-gray-300 rounded-sm h-24 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  id="description-text-area"
                  name="description"
                  bind:value={project.description}
        ></textarea>
        {#if form && form.success === false}
          <p class="absolute text-red-500 text-xl -bottom-8 left-38">{ form.error.fieldErrors.description }</p>
        {/if}
      </div>

      <!-- 메인 URL (QR 코드 용 주소) -->
      <div class="relative flex flex-col gap-1 text-xl">
        <label class="w-36" for="main-url-input">메인 URL</label>
        <input class="flex-1 p-1 border border-gray-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
               id="main-url-input"
               name="main_url"
               type="text"
               bind:value={project.main_url}
        />
        {#if form && form.success === false}
          <p class="absolute text-red-500 text-xl -bottom-8 left-38">{ form.error.fieldErrors.main_url }</p>
        {/if}
      </div>

      <!-- 썸네일 업로드 -->
      <div class="relative flex flex-col gap-1 text-xl">
        <label class="w-36" for="thumbnail-upload">썸네일 이미지</label>
        <input class="hidden flex-1 p-1"
               type="file"
               id="thumbnail-upload"
               name="thumbnail"
               accept="image/*"
               bind:value={projectFile.thumbnail}
        />
        <label for="thumbnail-upload" class="h-18 flex items-center justify-center gap-1 p-1 px-2 border border-gray-300">
          <img class="size-8" src="/images/project/image-up.svg" alt="img upload icon" />
          <span>파일 선택</span>
        </label>
        {#if projectFile.thumbnail}
          <span class="text-center">{ projectFile.thumbnail }</span>
        {:else}
          <span class="text-center">선택된 파일 없음</span>
        {/if}
        {#if form && form.success === false}
          <p class="absolute text-red-500 text-xl -bottom-8 left-38">{ form.error.fieldErrors.thumbnail }</p>
        {/if}
      </div>

      <!-- PDF 파일 업로드 -->
      <div class="relative flex flex-col gap-1 text-xl">
        <label class="w-36" for="pdf-upload">포스터 PDF</label>
        <input class="hidden flex-1 p-1"
               type="file"
               id="pdf-upload"
               name="pdf"
               accept=".pdf"
               bind:value={projectFile.pdf}
        />
        <label for="pdf-upload" class="h-18 flex items-center justify-center gap-1 p-1 px-2 border border-gray-300">
          <img class="size-8" src="/images/project/file-up.svg" alt="pdf upload icon" />
          <span>파일 선택</span>
        </label>
        {#if projectFile.pdf}
          <span class="text-center">{ projectFile.pdf }</span>
        {:else}
          <span class="text-center">선택된 파일 없음</span>
        {/if}
        {#if form && form.success === false}
          <p class="absolute text-red-500 text-xl -bottom-8 left-38">{ form.error.fieldErrors.pdf }</p>
        {/if}
      </div>
    </div>
  </form>
</div>
