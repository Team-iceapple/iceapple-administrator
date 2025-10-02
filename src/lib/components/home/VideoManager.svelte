<script lang="ts">
  import type { ActionData } from '../../../routes/$types';
  import type { AdminVideo } from '$lib/types/home';

  type Props = {
    currentVideo: AdminVideo | null;
    homeVideos: AdminVideo[];
    playlist: AdminVideo[];
    form?: ActionData;
  };
  let { currentVideo, homeVideos, playlist, form }: Props = $props();
  
  let showUploadForm = $state(false);
  let showVideoList = $state(false);
  let showPlaylist = $state(false);
  let editingVideoId = $state<string | null>(null);
  let editData = $state<{title: string, weight: string, playbackRate: string}>({
    title: '',
    weight: '',
    playbackRate: ''
  });

  $effect(() => {
    if (form && typeof form === 'object' && form !== null && 'success' in form && (form as any).success === true) {
      showVideoList = true;
    }
  });
</script>

<div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 min-h-80 flex flex-col">
  <h2 class="text-2xl font-bold text-gray-900 mb-4">홈 영상 관리</h2>

  <!-- 현재 영상 정보 -->
  <div class="flex items-center space-x-4 mb-6 flex-1">
    <!-- 현재 영상 미리보기 -->
    {#if currentVideo && currentVideo.fileUrl}
      <div class="w-48 h-28 bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
        <video 
          class="w-full h-full object-cover"
          controls
          preload="metadata">
          <source src="https://iceapple.wisoft.dev/api/home{currentVideo.fileUrl}" type="video/mp4">
          <div class="w-full h-full flex items-center justify-center bg-gray-100">
            <i class="text-gray-400 fas fa-circle-play text-2xl"></i>
          </div>
        </video>
      </div>
    {:else}
      <div class="w-48 h-28 bg-gray-100 rounded-lg flex items-center justify-center border border-gray-200">
        <i class="text-gray-400 fas fa-circle-play text-2xl"></i>
      </div>
    {/if}
    
    <div class="flex-1">
      <h3 class="font-medium text-gray-900 text-xl">
        현재 재생 중인 영상: <span class="text-indigo-600">{currentVideo?.title || '재생 중인 영상이 없습니다'}</span>
      </h3>
      <p class="text-lg text-gray-600 mt-1">우선순위가 가장 높은 활성화된 영상이 자동으로 재생됩니다</p>
    </div>
  </div>

  <!-- 액션 버튼들 -->
  <div class="flex space-x-3 mb-4">
    <button 
      class="bg-indigo-600 text-white px-4 py-2 rounded-lg text-lg font-medium hover:bg-indigo-700 transition-colors"
      onclick={() => showUploadForm = !showUploadForm}>
      새 영상 등록
    </button>
    <button 
      class="bg-gray-600 text-white px-4 py-2 rounded-lg text-lg font-medium hover:bg-gray-700 transition-colors"
      onclick={() => showVideoList = !showVideoList}>
      영상 목록 관리
    </button>
    <button 
      class="bg-green-600 text-white px-4 py-2 rounded-lg text-lg font-medium hover:bg-green-700 transition-colors"
      onclick={() => showPlaylist = !showPlaylist}>
      활성화된 영상 ({playlist.length}개)
    </button>
  </div>

  <!-- 업로드 폼 -->
  {#if showUploadForm}
    <div class="border-t border-gray-200 pt-4 mt-4">
      <form method="POST" action="?/uploadVideo" enctype="multipart/form-data" class="space-y-4">
        <div>
          <label for="title" class="block text-sm font-medium text-gray-700 mb-1">영상 제목</label>
          <input 
            type="text" 
            id="title" 
            name="title" 
            required
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="영상 제목을 입력하세요">
        </div>
        <div>
          <label for="file" class="block text-sm font-medium text-gray-700 mb-1">영상 파일</label>
          <input 
            type="file" 
            id="file" 
            name="file" 
            accept="video/*"
            required
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
        </div>
        <div class="flex space-x-2">
          <button 
            type="submit"
            class="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors">
            <i class="fas fa-upload mr-2"></i>업로드
          </button>
          <button 
            type="button"
            onclick={() => showUploadForm = false}
            class="bg-gray-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors">
            <i class="fas fa-times mr-2"></i>취소
          </button>
        </div>
      </form>
    </div>
  {/if}

  <!-- 영상 목록 -->
  {#if showVideoList}
    <div class="border-t border-gray-200 pt-4 mt-4">
      <h3 class="text-md font-medium text-gray-900 mb-4">등록된 영상 목록</h3>
      <div class="space-y-3">
        {#each homeVideos as video}
          <div class="border border-gray-200 rounded-lg p-4 bg-white">
            <div class="flex items-start justify-between mb-3">
              <div class="flex-1">
                <div class="flex items-center space-x-2 mb-1">
                  <h4 class="text-sm font-medium text-gray-900">{video.title}</h4>
                  {#if video.current}
                    <span class="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">현재 영상</span>
                  {/if}
                  {#if video.enabled === false}
                    <span class="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">비활성화</span>
                  {/if}
                </div>
                <p class="text-xs text-gray-500 mb-2">파일: {video.filePath}</p>
                <div class="flex space-x-4 text-xs text-gray-500">
                  <span>우선순위: {video.weight}</span>
                  <span>재생속도: {video.playbackRate}x</span>
                </div>
              </div>
              <div class="flex space-x-2">
                <button 
                  class="bg-slate-200 text-slate-700 hover:bg-slate-300 text-sm px-3 py-2 border border-slate-300 rounded min-w-[50px] transition-colors"
                  onclick={() => {
                    editingVideoId = editingVideoId === video.id ? null : video.id;
                    if (editingVideoId === video.id) {
                      editData.title = video.title;
                      editData.weight = video.weight.toString();
                      editData.playbackRate = video.playbackRate.toString();
                    }
                  }}>
                  {editingVideoId === video.id ? '닫기' : '편집'}
                </button>
                <form method="POST" action="?/enableVideo" class="inline">
                  <input type="hidden" name="id" value={video.id}>
                  <input type="hidden" name="enabled" value={video.enabled === false ? 'true' : 'false'}>
                  <button 
                    type="submit"
                    class="{video.enabled === false ? 'bg-emerald-400 hover:bg-emerald-500' : 'bg-amber-400 hover:bg-amber-500'} text-white px-3 py-2 rounded text-sm min-w-[70px] transition-colors">
                    {video.enabled === false ? '활성화' : '비활성화'}
                  </button>
                </form>
                <form method="POST" action="?/deleteVideo" class="inline">
                  <input type="hidden" name="id" value={video.id}>
                  <button 
                    type="submit"
                    class="bg-rose-400 text-white px-3 py-2 rounded text-sm min-w-[50px] hover:bg-rose-500 transition-colors">
                    삭제
                  </button>
                </form>
              </div>
            </div>
            
            <!-- 편집 폼 -->
            {#if editingVideoId === video.id}
              <div class="border-t border-gray-200 pt-3 mt-3">
                <form method="POST" action="?/updateVideo" class="space-y-3" id="edit-form-{video.id}">
                  <input type="hidden" name="id" value={video.id}>
                  <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label for="edit-title-{video.id}" class="block text-xs font-medium text-gray-700 mb-1">제목</label>
                      <input 
                        type="text" 
                        name="title" 
                        id="edit-title-{video.id}"
                        bind:value={editData.title}
                        class="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent">
                    </div>
                    <div>
                      <label for="edit-weight-{video.id}" class="block text-xs font-medium text-gray-700 mb-1">우선순위 (숫자가 작을수록 먼저 재생)</label>
                      <input
                        type="number"
                        name="weight"
                        id="edit-weight-{video.id}"
                        bind:value={editData.weight}
                        class="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                        placeholder="0">
                    </div>
                    <div>
                      <label for="edit-playbackRate-{video.id}" class="block text-xs font-medium text-gray-700 mb-1">재생속도 (1.0 = 기본속도)</label>
                      <input
                        type="number"
                        step="0.1"
                        name="playbackRate"
                        id="edit-playbackRate-{video.id}"
                        bind:value={editData.playbackRate}
                        class="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                        placeholder="1.0">
                    </div>
                  </div>
                  <div class="flex space-x-2">
                    <button
                      type="button"
                      onclick={(e) => {
                        const target = e.target;
                        const formElement = target.closest('form');
                        if (formElement) {
                          const makeFirstInput = document.createElement('input');
                          makeFirstInput.type = 'hidden';
                          makeFirstInput.name = 'makeFirst';
                          makeFirstInput.value = 'true';
                          formElement.appendChild(makeFirstInput);
                          formElement.submit();
                        }
                      }}
                      class="bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-700">
                      최우선으로 설정
                    </button>
                    <button
                      type="submit"
                      class="bg-green-600 text-white px-3 py-1 rounded text-xs hover:bg-green-700">
                      저장
                    </button>
                    <button
                      type="button"
                      onclick={() => editingVideoId = null}
                      class="bg-gray-600 text-white px-3 py-1 rounded text-xs hover:bg-gray-700">
                      취소
                    </button>
                  </div>
                </form>
              </div>
            {/if}
          </div>
        {/each}
        {#if homeVideos.length === 0}
          <p class="text-sm text-gray-500">등록된 영상이 없습니다.</p>
        {/if}
      </div>
    </div>
  {/if}

  <!-- 활성화된 영상 목록 (Playlist) -->
  {#if showPlaylist}
    <div class="border-t border-gray-200 pt-4 mt-4">
      <h3 class="text-md font-medium text-gray-900 mb-4">활성화된 영상 목록 (우선순위 순)</h3>
      <div class="space-y-2">
        {#each playlist as video, index}
          <div class="border border-green-200 rounded-lg p-3 bg-green-50">
            <div class="flex items-center space-x-3">
              <div class="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                {index + 1}
              </div>
              <div class="flex-1">
                <h4 class="text-sm font-medium text-gray-900">{video.title}</h4>
                <div class="flex space-x-4 text-xs text-gray-600 mt-1">
                  <span>우선순위: {video.weight}</span>
                  <span>재생속도: {video.playbackRate}x</span>
                  {#if video.current}
                    <span class="text-green-700 font-medium">🎬 현재 영상</span>
                  {/if}
                </div>
              </div>
            </div>
          </div>
        {/each}
        {#if playlist.length === 0}
          <p class="text-sm text-gray-500 bg-gray-50 p-4 rounded-lg text-center">
            활성화된 영상이 없습니다. 영상 목록에서 영상을 활성화해주세요.
          </p>
        {/if}
      </div>
    </div>
  {/if}

</div>