<script lang="ts">
    import {
        MeetingRoomList,
        PinnedNotices,
        ProjectList,
        RecentProjects,
        ReservationsList,
        SummaryCard,
        TodayReservations,
        VideoManager
    } from '$lib/components/home';
    import type {PageData, ActionData} from '../../routes/(home)/$types';

    let {data, form}: { data: PageData, form?: ActionData } = $props();

    let showMeetingRoomList = $state(false);
    let showReservationList = $state(false);
    let showProjectList = $state(false);
</script>

<main class="p-6">
    <VideoManager currentVideo={data.currentVideo} homeVideos={data.homeVideos} form={form}/>

    <section class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <SummaryCard title="전체 회의실 수" value={data.totalPlaces} icon="fas fa-door-open"/>
            <button onclick={() => showMeetingRoomList = !showMeetingRoomList}
                    class="w-full bg-gray-50 text-gray-700 py-2 px-3 rounded-lg text-sm hover:bg-gray-100 mb-3 mt-4">
                회의실 목록 <i class="ml-2 fas fa-chevron-down"></i>
            </button>
            {#if showMeetingRoomList}
                <MeetingRoomList places={data.places}/>
            {/if}
        </div>

        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <SummaryCard title="오늘 예약된 사용자 수" value={`${data.uniqueTodayUsers}명`} icon="fas fa-users"/>
            <button onclick={() => showReservationList = !showReservationList}
                    class="w-full bg-gray-50 text-gray-700 py-2 px-3 rounded-lg text-sm hover:bg-gray-100 mt-4">
                예약자 보기 <i class="ml-2 fas fa-chevron-down"></i>
            </button>
            {#if showReservationList}
                <ReservationsList reservations={data.reservations}/>
            {/if}
        </div>

        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <SummaryCard title="전체 프로젝트 수" value={data.works.length} icon="fas fa-diagram-project"/>
            <button onclick={() => showProjectList = !showProjectList}
                    class="w-full bg-gray-50 text-gray-700 py-2 px-3 rounded-lg text-sm hover:bg-gray-100 mt-4">
                연도별 보기 <i class="ml-2 fas fa-chevron-down"></i>
            </button>
            {#if showProjectList}
                <ProjectList works={data.works}/>
            {/if}
        </div>
    </section>

    <div class="grid grid-cols-1 lg:grid-cols-1 gap-6 mb-6">
        <TodayReservations reservations={data.todayReservations}/>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <RecentProjects projects={data.recentProjects}/>
        <PinnedNotices notices={data.pinnedNotices}/>
    </div>
</main>
