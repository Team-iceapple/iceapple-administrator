export const load = ({ url })  => {
    const path = url.pathname;

    const pathTitleMap: Record<string, string> = {
        '/': 'Main Page',
        '/place': 'Place Management Page',
        '/projects': 'Project Management Page'
    };

    return {
        pageTitle: pathTitleMap[path] ?? '없는 페이지'
    };
};