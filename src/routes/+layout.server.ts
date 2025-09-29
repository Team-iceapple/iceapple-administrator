import type {PageServerLoad} from "../../.svelte-kit/types/src/routes/$types";

export const load: PageServerLoad = async ({ cookies, url }) => {
    const token = cookies.get('accessToken');
    const isAuthenticated = !!token;

    return {
        isAuthenticated,
        pathname: url.pathname
    };
};
