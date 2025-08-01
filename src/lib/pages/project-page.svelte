<script lang="ts">
import { generateYears } from '$lib/utils';

type Member = {
  name: string;
  extra: string;
};

class MemberBuilder {
  name: string;
  extra: string;

  constructor() {
    this.name = $state<string>('');
    this.extra = $state<string>('');
  }

  build = (): Member => {
    return {
      name: this.name,
      extra: this.extra,
    };
  };

  clear = (): void => {
    this.name = '';
    this.extra = '';
  };
}

type Project = {
  id: string;
  name: string;
  team_name: string;
  members: Member[];
  thumbnail: string;
  pdf_url: string;
  description: string;
  main_url: string;
  year: number;
};

type ProjectCreateBody = {
  name: string;
  team_name: string;
  members: Member[];
  description: string;
  main_url: string;
  year: number;
};

class ProjectModel {
  name: string;
  team_name: string;
  members: Member[];
  description: string;
  main_url: string;
  year: number;
  pdf_url: string;
  pdfFile: File | null;
  thumbnail_url: string;
  thumbnailFile: File | null;

  constructor() {
    this.name = $state<string>('');
    this.team_name = $state<string>('');
    this.members = $state<Member[]>([]);
    this.description = $state<string>('');
    this.main_url = $state<string>('');
    this.year = $state<number>(new Date().getFullYear());
    this.pdfFile = $state<File | null>(null);
    this.pdf_url = $state<string>('');
    this.thumbnail_url = $state<string>('');
    this.thumbnailFile = $state<File | null>(null);
  }

  set = (project: Project) => {
    this.name = project.name;
    this.team_name = project.team_name;
    this.members = [...project.members];
    this.description = project.description;
    this.main_url = project.main_url;
    this.year = project.year;
    this.pdf_url = project.pdf_url;
    this.thumbnail_url = project.thumbnail;
  };

  addMember = (member: Member) => {
    this.members.push(member);
  };

  clear = () => {
    this.name = '';
    this.team_name = '';
    this.members = [];
    this.description = '';
    this.main_url = '';
    this.year = new Date().getFullYear();
    this.pdf_url = '';
    this.pdfFile = null;
    this.thumbnail_url = '';
    this.thumbnailFile = null;
  };

  post = () => {
    // 백엔드에 POST 요청
    const createBody: ProjectCreateBody = $state.snapshot({
      name: this.name,
      team_name: this.team_name,
      members: this.members,
      description: this.description,
      main_url: this.main_url,
      year: this.year,
    });

    console.info(JSON.stringify(createBody, null, 2));
  };
}

const fakeProjects: Project[] = [
  {
    id: 'pjt-001',
    name: 'SmartFarm Vision',
    team_name: 'Team Ignite',
    members: [
      { name: '오하늘', extra: 'Frontend Developer' },
      { name: '김민수', extra: 'ML Engineer' },
      { name: '한수현', extra: '풀스택 개발' },
      { name: '김승준', extra: '구경' },
    ],
    thumbnail: 'https://example.com/smartfarm_vision_thumbnail.jpg',
    pdf_url: 'https://example.com/smartfarm_vision.pdf',
    description:
      '일상 속 탄소 배출을 시각화하고 줄이도록 돕는 친환경 습관 관리 앱',
    main_url: 'https://smartfarmvision.example.com',
    year: 2023,
  },
  {
    id: 'pjt-002',
    name: 'Campus Delivery',
    team_name: 'Team Ignite',
    members: [
      { name: '한수현', extra: 'ML Engineer' },
      { name: '이하나', extra: '기획 및 디자인' },
      { name: '백승우', extra: '서버 개발' },
    ],
    thumbnail: 'https://example.com/campus_delivery_thumbnail.jpg',
    pdf_url: 'https://example.com/campus_delivery.pdf',
    description:
      '일상 속 탄소 배출을 시각화하고 줄이도록 돕는 친환경 습관 관리 앱',
    main_url: 'https://campusdelivery.example.com',
    year: 2024,
  },
  {
    id: 'pjt-003',
    name: 'EcoTrack',
    team_name: 'Team Fusion',
    members: [
      { name: '신하윤', extra: '모바일 개발' },
      { name: '박지윤', extra: '서버 개발' },
      { name: '이하나', extra: '기획 및 디자인' },
    ],
    thumbnail: 'https://example.com/ecotrack_thumbnail.jpg',
    pdf_url: 'https://example.com/ecotrack.pdf',
    description:
      'AI 기반 영상 인식으로 작물 생장 상태를 분석하는 스마트팜 시스템',
    main_url: 'https://ecotrack.example.com',
    year: 2024,
  },
  {
    id: 'pjt-004',
    name: 'FitTogether',
    team_name: 'Team Nexus',
    members: [
      { name: '김민수', extra: '서버 개발' },
      { name: '정하람', extra: 'Backend Developer' },
      { name: '윤서준', extra: '기획 및 디자인' },
    ],
    thumbnail: 'https://example.com/fittogether_thumbnail.jpg',
    pdf_url: 'https://example.com/fittogether.pdf',
    description:
      'AI 기반 영상 인식으로 작물 생장 상태를 분석하는 스마트팜 시스템',
    main_url: 'https://fittogether.example.com',
    year: 2022,
  },
  {
    id: 'pjt-005',
    name: 'StudyMate',
    team_name: 'Team Nexus',
    members: [
      { name: '김서영', extra: '기획 및 디자인' },
      { name: '오하늘', extra: 'Backend Developer' },
    ],
    thumbnail: 'https://example.com/studymate_thumbnail.jpg',
    pdf_url: 'https://example.com/studymate.pdf',
    description:
      'AI 기반 영상 인식으로 작물 생장 상태를 분석하는 스마트팜 시스템',
    main_url: 'https://studymate.example.com',
    year: 2022,
  },
  {
    id: 'pjt-006',
    name: 'PetCare AI',
    team_name: 'Team Ignite',
    members: [
      { name: '정우성', extra: '서버 개발' },
      { name: '문지후', extra: '모바일 개발' },
      { name: '남지민', extra: '데이터 분석' },
    ],
    thumbnail: 'https://example.com/petcare_ai_thumbnail.jpg',
    pdf_url: 'https://example.com/petcare_ai.pdf',
    description:
      '건강한 피트니스 루틴을 함께 유지할 수 있도록 돕는 소셜 피트니스 앱',
    main_url: 'https://petcareai.example.com',
    year: 2024,
  },
  {
    id: 'pjt-007',
    name: 'AutoChef',
    team_name: 'Team Nexus',
    members: [
      { name: '권지아', extra: 'Frontend Developer' },
      { name: '이도현', extra: 'ML Engineer' },
      { name: '윤하린', extra: '기획 및 디자인' },
    ],
    thumbnail: 'https://example.com/autochef_thumbnail.jpg',
    pdf_url: 'https://example.com/autochef.pdf',
    description:
      '일상 속 탄소 배출을 시각화하고 줄이도록 돕는 친환경 습관 관리 앱',
    main_url: 'https://autochef.example.com',
    year: 2022,
  },
  {
    id: 'pjt-008',
    name: 'GreenGo',
    team_name: 'Team Apex',
    members: [
      { name: '백승우', extra: '서버 개발' },
      { name: '정우성', extra: 'ML Engineer' },
      { name: '이하나', extra: '기획 및 디자인' },
    ],
    thumbnail: 'https://example.com/greengo_thumbnail.jpg',
    pdf_url: 'https://example.com/greengo.pdf',
    description:
      'AI 기반 영상 인식으로 작물 생장 상태를 분석하는 스마트팜 시스템',
    main_url: 'https://greengo.example.com',
    year: 2023,
  },
  {
    id: 'pjt-009',
    name: 'WeatherWise',
    team_name: 'Team Spark',
    members: [
      { name: '배태현', extra: 'Frontend Developer' },
      { name: '윤하린', extra: '풀스택 개발' },
    ],
    thumbnail: 'https://example.com/weatherwise_thumbnail.jpg',
    pdf_url: 'https://example.com/weatherwise.pdf',
    description: '대학 캠퍼스 내 소규모 배달을 자동화한 스마트 배달 플랫폼',
    main_url: 'https://weatherwise.example.com',
    year: 2024,
  },
  {
    id: 'pjt-010',
    name: 'CleanCity Map',
    team_name: 'Team Fusion',
    members: [
      { name: '문지후', extra: '데이터 분석' },
      { name: '노유진', extra: '풀스택 개발' },
    ],
    thumbnail: 'https://example.com/cleancity_map_thumbnail.jpg',
    pdf_url: 'https://example.com/cleancity_map.pdf',
    description:
      '일상 속 탄소 배출을 시각화하고 줄이도록 돕는 친환경 습관 관리 앱',
    main_url: 'https://cleancitymap.example.com',
    year: 2022,
  },
];

let projectPerPage = $state<number>(5);
let currentProjects = $state<Project[]>(fakeProjects.slice(0, projectPerPage));
let selectedProject = $state<Project | null>(null);

const projectModel = new ProjectModel();
const memberBuilder = new MemberBuilder();

function handleAddMember() {
  const member = memberBuilder.build();
  projectModel.addMember(member);
  memberBuilder.clear();
}

function handleDeleteMember(index: number) {
  projectModel.members.splice(index, 1);
}

function selectProject(project: Project) {
  if (project === selectedProject) {
    selectedProject = null;
    projectModel.clear();
    return;
  }

  selectedProject = project;
  projectModel.set(project);
}

function handleProjectItem(e: KeyboardEvent | MouseEvent, project: Project) {
  const isAllow =
    e instanceof MouseEvent ||
    (e instanceof KeyboardEvent && (e.key === 'Enter' || e.key === ' '));

  if (isAllow) {
    e.preventDefault();
    selectProject(project);
  }
}

$inspect(selectedProject);
</script>

<div class="flex">
  <!-- 좌측 패널 -->
  <div class="basis-1/2">
    <div class="flex flex-col p-4 gap-1">
      {#each currentProjects as project (project.id)}
        <div class="flex gap-2 p-2 cursor-pointer border rounded-sm shadow"
             class:bg-blue-400={project.id === selectedProject?.id}
             onclick={(e) => handleProjectItem(e, project)}
             onkeydown={(e) => handleProjectItem(e, project)}
             role="button"
             tabindex={0}
        >
          <img class="size-32" src={project.thumbnail} alt={`${project.name} Thumbnail`}/>
          <div class="flex flex-col text-left">
            <p class="text-lg font-semibold">{project.name}</p>
            <p class="text-sm">{project.members.map((member) => member.name)}</p>
          </div>
        </div>
      {/each}
    </div>
  </div>

  <!-- 세로 구분선 -->
  <div class="border-l mx-1"></div>

  <!-- 우측 패널 -->
  <div class="flex flex-col p-2 basis-1/2">
    <h2 class="font-bold text-3xl border-b">세부 정보</h2>
    <!-- 세부 정보 목록 -->
    <div class="flex flex-col p-2 gap-2">
      <!-- 년도 -->
      <div class="flex flex-col">
        <label class="text-lg"
               for="year-input">년도</label>
        <select class="p-1 border rounded-sm"
                id='year-input'
                bind:value={projectModel.year}>
          {#each generateYears(new Date().getFullYear() - 5) as year}
            <option value={year}>{year}</option>
          {/each}
        </select>
      </div>

      <!-- 프로젝트 이름 -->
      <div class="flex flex-col">
        <label class="text-lg"
               for="name-input">제목</label>
        <input class="p-1 border rounded-sm"
               id="name-input"
               type="text"
               bind:value={projectModel.name}
        />
      </div>

      <!-- 팀 이름 -->
      <div class="flex flex-col">
        <label class="text-lg"
               for="name-input">팀 이름</label>
        <input class="p-1 border rounded-sm"
               id="name-input"
               type="text"
               bind:value={projectModel.team_name}
        />
      </div>

      <!-- 팀원 -->
      <div class="flex flex-col gap-2">
        <div class="flex items-center gap-2">
          <label class="text-lg"
                 for="member-name-input">팀원</label>

          <div class="flex-1 flex gap-2">
            <input class="p-1 border rounded-sm"
                   id="member-name-input"
                   bind:value={memberBuilder.name}
                   type="text"
                   placeholder="팀원 이름.."
            />
            <input class="flex-1 p-1 border rounded-sm"
                   bind:value={memberBuilder.extra}
                   type="text"
                   placeholder="팀원 세부 정보.."
            />
            <button class="px-2 border rounded-sm"
                    onclick={handleAddMember}
            >
              추가
            </button>
          </div>
        </div>

        <!-- 팀원 목록 -->
          <div class="border rounded">
            <table class="table-fixed w-full text-sm">
              <thead>
                <tr class="border-b">
                  <th class="w-1/8 px-2 py-1 text-left border-r">이름</th>
                  <th class="w-1/2 px-2 py-1 text-left">세부 정보</th>
                </tr>
              </thead>
            </table>
            <div class="h-28 overflow-y-auto">
              <table class="table-fixed w-full text-sm">
                <tbody>
                {#each projectModel.members as member, i (i)}
                  <tr class="not-first:border-t last:border-b">
                    <td class="w-1/8 px-2 py-1 border-r">{member.name}</td>
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
        <label class="text-lg"
               for="description-text-area">설명</label>
        <textarea class="p-1 border rounded-sm h-24"
                  id="description-text-area"
                  bind:value={projectModel.description}
        ></textarea>
      </div>

      <!-- 썸네일 업로드 -->
      <div class="flex flex-col">
        <label class="text-lg"
               for="thumbnail-upload">썸네일 이미지</label>
        <input class="p-1 border rounded-sm"
               type="file"
               id="thumbnail-upload"
               bind:value={projectModel.thumbnailFile}
        />
      </div>

      <!-- PDF 파일 업로드 -->
      <div class="flex flex-col">
        <label class="text-lg"
               for="pdf-upload">포스터 PDF</label>
        <input class="p-1 border rounded-sm"
               type="file"
               id="pdf-upload"
               bind:value={projectModel.pdfFile}
        />
      </div>
    </div>

    <button class="mr-4 mt-4 py-1 px-2 border rounded-sm self-end"
            onclick={projectModel.post}
    >
      {selectedProject ? '저장' : '생성'}
    </button>
  </div>
</div>