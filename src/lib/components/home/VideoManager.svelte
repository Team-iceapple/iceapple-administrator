<script lang="ts">
    import { invalidateAll } from '$app/navigation';

    type ActionData = { success: boolean; message: string } | null | undefined;

    const { currentVideo, homeVideos, form } = $props<{ 
        currentVideo: { id: string; title: string; fileUrl: string } | null;
        homeVideos: { id: string; title: string; fileUrl: string; current: boolean }[];
        form?: ActionData;
    }>();

    let showVideoList = $state(false);
    let showUploadForm = $state(false);
    let newVideoTitle = $state('');
    let newVideoFile = $state<File | null>(null);

    function handleFileChange(event: Event) {
        const target = event.target as HTMLInputElement;
        if (target.files && target.files.length > 0) {
            newVideoFile = target.files[0];
        } else {
            newVideoFile = null;
        }
    }

    async function handleUploadSubmit(event: SubmitEvent) {
        event.preventDefault();
        
        if (!newVideoFile || !newVideoTitle.trim()) {
            alert('제목과 파일을 모두 입력해주세요.');
            return;
        }

        const formData = new FormData();
        formData.append('title', newVideoTitle.trim());
        formData.append('file', newVideoFile);

        const response = await fetch('?/uploadVideo', {
            method: 'POST',
            body: formData
        });

        const result = await response.json();
        if (result.success) {
            alert(result.message);
            newVideoTitle = '';
            newVideoFile = null;
            showUploadForm = false;
            await invalidateAll();
        } else {
            alert(result.message);
        }
    }

    async function handleDeleteSubmit(event: SubmitEvent) {
        if (!confirm('정말로 이 영상을 삭제하시겠습니까?')) {
            event.preventDefault();
            return;
        }
    }

    async function handleSetCurrentSubmit(event: SubmitEvent) {
        if (!confirm('이 영상을 현재 영상으로 설정하시겠습니까?')) {
            event.preventDefault();
            return;
        }
    }

    $effect(() => {
        if (form?.success !== undefined) {
            alert(form.message);
            if (form.success) {
                newVideoTitle = '';
                newVideoFile = null;
                showUploadForm = false;
                invalidateAll();
            }
        }
    });
</script>

<section class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
    <h2 class="text-lg font-medium text-gray-900 mb-4">홈 영상 관리</h2>

    <div class="flex items-center space-x-4 mb-4">
        <div class="w-48 h-32 bg-gray-100 rounded-lg flex items-center justify-center">
            {#if currentVideo}
                {@const videoUrl = currentVideo.fileUrl.startsWith('/') ? `https://task-api.wisoft.io/iceapple/home${currentVideo.fileUrl}` : currentVideo.fileUrl}
                <video 
                    controls 
                    preload="metadata" 
                    muted 
                    class="w-full h-full object-cover rounded-lg"
                >
                    <source src={videoUrl} type="video/mp4">
                    비디오를 재생할 수 없습니다.
                </video>
            {:else}
                <i class="text-3xl text-gray-400 fas fa-circle-play"></i>
            {/if}
        </div>
        <div class="flex-1">
            <p class="text-sm text-gray-600 mb-2">
                현재 영상: <span class="font-semibold">{currentVideo?.title ?? '설정된 영상 없음'}</span>
            </p>
            <div class="space-x-2">
                <button
                    onclick={() => (showVideoList = !showVideoList)}
                    class="bg-gray-50 text-gray-700 px-3 py-2 rounded-lg text-sm hover:bg-gray-100"
                >
                    {showVideoList ? '목록 숨기기' : '전체 영상 목록 보기'} <i class="ml-1 fas fa-chevron-down"></i>
                </button>
                <button
                    onclick={() => (showUploadForm = !showUploadForm)}
                    class="bg-indigo-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-indigo-700"
                >
                    {showUploadForm ? '등록 폼 닫기' : '새 영상 등록'}
                </button>
            </div>
        </div>
    </div>

    {#if showVideoList}
        <div class="toggle-content bg-gray-50 rounded-lg p-3 mb-4">
            <div class="space-y-2 text-sm">
                {#each homeVideos as video (video.id)}
                    <div class="flex justify-between items-center p-2 hover:bg-gray-100 rounded-md">
                        <span class:font-bold={video.current}>
                            {video.title}
                            {#if video.current}
                                <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 ml-2">현재</span>
                            {/if}
                        </span>
                        <div class="flex space-x-2">
                            {#if !video.current}
                                <form method="POST" action="?/setCurrentVideo" onsubmit={handleSetCurrentSubmit} class="inline">
                                    <input type="hidden" name="id" value={video.id} />
                                    <button
                                        type="submit"
                                        class="bg-green-600 text-white px-3 py-1 rounded-lg text-xs hover:bg-green-700"
                                        title="현재 영상으로 설정"
                                    >
                                        설정
                                    </button>
                                </form>
                            {/if}
                            <form method="POST" action="?/deleteVideo" onsubmit={handleDeleteSubmit} class="inline">
                                <input type="hidden" name="id" value={video.id} />
                                <button
                                    type="submit"
                                    class="bg-red-600 text-white px-3 py-1 rounded-lg text-xs hover:bg-red-700 disabled:opacity-50"
                                    disabled={video.current}
                                    title={video.current ? '현재 설정된 영상은 삭제할 수 없습니다.' : '삭제'}
                                >
                                    삭제
                                </button>
                            </form>
                        </div>
                    </div>
                {:else}
                    <p class="text-gray-500 p-2">등록된 영상이 없습니다.</p>
                {/each}
            </div>
        </div>
    {/if}

    {#if showUploadForm}
        <div class="border-t border-gray-200 pt-4">
            <h3 class="text-md font-medium text-gray-800 mb-3">새 영상 등록</h3>
            <form method="POST" action="?/uploadVideo" onsubmit={handleUploadSubmit}>
                <div class="space-y-3">
                    <div>
                        <label for="video-title" class="block text-sm font-medium text-gray-700 mb-1">
                            영상 제목
                        </label>
                        <input
                            type="text"
                            id="video-title"
                            name="title"
                            bind:value={newVideoTitle}
                            class="w-full border-gray-300 rounded-lg shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            placeholder="영상 제목을 입력하세요"
                        />
                    </div>
                    <div>
                        <label for="video-file" class="block text-sm font-medium text-gray-700 mb-1">
                            영상 파일
                        </label>
                        <input
                            type="file"
                            id="video-file"
                            name="file"
                            accept="video/*"
                            onchange={handleFileChange}
                            class="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                        />
                    </div>
                    <div>
                        <button
                            type="submit"
                            class="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-indigo-700 w-full sm:w-auto"
                        >
                            등록
                        </button>
                    </div>
                </div>
            </form>
        </div>
    {/if}
</section>

