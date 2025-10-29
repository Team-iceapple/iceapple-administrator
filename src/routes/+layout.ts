export const load = ({url}) => {
    const path = url.pathname;

    const pathTitleMap: Record<string, string> = {
        '/': 'Login',
        '/dashboard': 'Dashboard',
        '/place': 'Place Management',
        '/projects': 'Project Management',
    };

    return {
        pageTitle: pathTitleMap[path] ?? '없는 페이지',
        isAuthenticated: false,
    };
};
