<script lang="ts">
import { error } from '@sveltejs/kit';
import { goto } from '$app/navigation';
import type {
  DetailProjectGetResponse,
  Member,
  Project,
  ProjectCreateBody,
  ProjectCreateFile,
  ProjectUpdateBody,
} from '$lib/types';
import { generateYears } from '$lib/utils';

const {
  projects,
  IMAGE_URL,
  currentPage: initialCurrentPage,
  maxPage,
} = $props();

const MIN_PAGE = 1;
let currentPage = $derived<number>(initialCurrentPage);
let currentProjects = $derived<Project[]>(projects);
let selectedProject = $state<Project | null>(null);

let project = $state<Project>({
  id: '',
  name: '',
  team_name: '',
  members: [],
  description: '',
  thumbnail: '',
  year: new Date().getFullYear(),
  main_url: '',
  pdf_url: '',
});

let projectFile = $state<Partial<ProjectCreateFile>>({
  pdf: undefined,
  thumbnail: undefined,
});

function resetProject() {
  project.name = '';
  project.team_name = '';
  project.members = [];
  project.description = '';
  project.main_url = '';
  project.year = new Date().getFullYear();
  project.pdf_url = '';
  project.thumbnail = '';

  projectFile.pdf = undefined;
  projectFile.thumbnail = undefined;
}

function setProject(newProject: Project) {
  project = { ...newProject };
}

function handleSave() {
  if (selectedProject) {
    console.info('수정 요청');
    const updateBody = $state.snapshot<ProjectUpdateBody>({
      name: project.name,
      team_name: project.team_name,
      members: project.members,
      description: project.description,
      main_url: project.main_url,
      year: project.year,
    });

    console.info(updateBody);
  } else {
    console.info('생성 요청');

    const createBody = $state.snapshot<ProjectCreateBody>({
      name: project.name,
      team_name: project.team_name,
      members: project.members,
      description: project.description,
      main_url: project.main_url,
      year: project.year,
    });

    console.info(createBody);
  }
}

let memberName = $state('');
let memberExtra = $state('');

function handleAddMember() {
  const member: Member = {
    name: memberName,
    extra: memberExtra,
  };

  project.members.push(member);

  memberName = '';
  memberExtra = '';
}

function handleDeleteMember(index: number) {
  project.members.splice(index, 1);
}

async function selectProject(projectId: string) {
  if (projectId === selectedProject?.id) {
    selectedProject = null;
    resetProject();
    return;
  }

  const response = await fetch(`api/project/${projectId}`);

  const body: DetailProjectGetResponse = await response.json();

  if (!response.ok) error(404, body.message);

  const project = body.work;
  selectedProject = project;
  setProject(project);
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

function goToPage(page: number) {
  const isValidPage = MIN_PAGE <= page && page <= maxPage;

  if (isValidPage) {
    goto(`?page=${page}`, {
      keepFocus: true,
      noScroll: true,
    });
  }
}
</script>

<div class="flex">
  <!-- 좌측 패널 -->
  <div class="basis-1/2">
    <div class="flex flex-col gap-1 min-h-[720px] ">
      {#each currentProjects as project (project.id)}
        <!-- 예시 수정: 목록 아이템 -->
        <div
          class="flex gap-2 p-2 cursor-pointer border border-gray-300 rounded-md shadow-sm hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-400"
          class:bg-blue-100={project.id === selectedProject?.id}
          onclick={(e) => handleProjectItem(e, project.id)}
          onkeydown={(e) => handleProjectItem(e, project.id)}
          role="button"
          tabindex={0}
        >
          <img class="size-28 rounded-sm border border-gray-300" src={`api/project/files/${project.thumbnail}?type=png`} alt={`${project.name} Thumbnail`} />
          <div class="flex flex-col text-left">
            <p class="text-lg font-semibold text-gray-800">{project.name}</p>
            <p class="text-sm text-gray-500">{project.members.map((member) => member.name)}</p>
          </div>
        </div>
      {/each}

      <div class="mt-auto mx-auto flex items-center gap-3 text-gray-700">
        <button class="px-2 py-1 border border-gray-400 rounded-sm
                 hover:bg-gray-100 active:ring-1 active:ring-blue-300
                 transition-colors
                 disabled:bg-gray-100 disabled:text-gray-400 disabled:border-gray-300 disabled:cursor-not-allowed"
                onclick={() => goToPage(currentPage - 1)}
                disabled={currentPage === MIN_PAGE}
        >
          이전
        </button>

        <div class="text-sm">
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
    </div>
  </div>

  <!-- 세로 구분선 -->
  <div class="border-l-2 border-l-gray-100 mx-2"></div>

  <!-- 우측 패널 -->
  <div class="flex flex-col basis-1/2">
    <h2 class="font-bold text-2xl border-b border-gray-300">세부 정보</h2>
    <!-- 세부 정보 목록 -->
    <div class="flex flex-col p-2 gap-2">
      <!-- 년도 -->
      <div class="flex flex-col">
        <label class="text-base"
               for="year-input">년도</label>
        <select class="p-1 border border-gray-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                id='year-input'
                bind:value={project.year}>
          {#each generateYears(new Date().getFullYear() - 5) as yearNum}
            <option value={yearNum}>{yearNum}</option>
          {/each}
        </select>
      </div>

      <!-- 프로젝트 이름 -->
      <div class="flex flex-col">
        <label class="text-base"
               for="name-input">제목</label>
        <input class="p-1 border border-gray-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
               id="name-input"
               type="text"
               bind:value={project.name}
        />
      </div>

      <!-- 팀 이름 -->
      <div class="flex flex-col">
        <label class="text-base"
               for="name-input">팀 이름</label>
        <input class="p-1 border border-gray-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
               id="name-input"
               type="text"
               bind:value={project.team_name}
        />
      </div>

      <!-- 팀원 -->
      <div class="flex flex-col gap-2">
        <div class="flex items-center gap-2">
          <label class="text-base"
                 for="member-name-input">팀원</label>

          <div class="flex-1 flex gap-2">
            <input class="p-1 border border-gray-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                   id="member-name-input"
                   bind:value={memberName}
                   type="text"
                   placeholder="팀원 이름.."
            />
            <input class="p-1 border border-gray-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                   bind:value={memberExtra}
                   type="text"
                   placeholder="팀원 세부 정보.."
            />
            <button class="px-3 py-1 border border-gray-400 rounded-sm text-gray-700 hover:bg-gray-100 active:ring-1 active:ring-blue-300 transition-colors"
                    onclick={handleAddMember}
            >
              추가
            </button>
          </div>
        </div>

        <!-- 팀원 목록 -->
          <div class="border border-gray-300 rounded">
            <table class="table-fixed w-full text-sm">
              <thead>
                <tr class="border-b border-gray-300 bg-slate-50 text-left">
                  <th class="w-1/8 px-2 py-1 border-r border-gray-300">이름</th>
                  <th class="w-1/2 px-2 py-1">세부 정보</th>
                </tr>
              </thead>
            </table>
            <div class="h-28 overflow-y-auto">
              <table class="table-fixed w-full text-sm">
                <tbody>
                {#each project.members as member, i (i)}
                  <tr class="not-first:border-t last:border-b border-gray-300">
                    <td class="w-1/8 px-2 py-1 border-r border-gray-300">{member.name}</td>
                    <td class="relative w-1/2 px-2 py-1">
                      {member.extra}
                      <button class="absolute right-2 text-red-500"
                              onclick={() => handleDeleteMember(i)}
                      >X</button>
                    </td>
                  </tr>
                {/each}
                </tbody>
              </table>
            </div>
          </div>
      </div>

      <!-- 프로젝트 설명 -->
      <div class="flex flex-col">
        <label class="text-base"
               for="description-text-area">설명</label>
        <textarea class="p-1 border border-gray-300 rounded-sm h-24 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  id="description-text-area"
                  bind:value={project.description}
        ></textarea>
      </div>

      <!-- 썸네일 업로드 -->
      <div class="flex flex-col">
        <label class="text-base"
               for="thumbnail-upload">썸네일 이미지</label>
        <input class="p-1 border border-gray-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
               type="file"
               id="thumbnail-upload"
               bind:value={projectFile.thumbnail}
        />
      </div>

      <!-- PDF 파일 업로드 -->
      <div class="flex flex-col">
        <label class="text-base"
               for="pdf-upload">포스터 PDF</label>
        <input class="p-1 border border-gray-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
               type="file"
               id="pdf-upload"
               bind:value={projectFile.pdf}
        />
      </div>
    </div>

    <button class="self-end px-3 py-1 border border-gray-400 rounded-sm text-gray-700 hover:bg-gray-100 active:ring-1 active:ring-blue-300 transition-colors"
            onclick={handleSave}
    >
      {selectedProject ? '저장' : '생성'}
    </button>
  </div>
</div>
