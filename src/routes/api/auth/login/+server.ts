import { API_ENDPOINTS } from '$lib/config/api';
import { logger } from '$lib/utils';

export async function POST({ request, fetch }: { request: Request; fetch: typeof globalThis.fetch }) {
    logger.log('로그인 요청');

    try {
        const body = await request.json();

        logger.log('로그인 데이터', { user_name: body.user_name });

        const response = await fetch(API_ENDPOINTS.AUTH_LOGIN, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });

        logger.log('외부 서버 응답 상태', {
            status: response.status,
            statusText: response.statusText,
            url: API_ENDPOINTS.AUTH_LOGIN
        });

        // 응답이 비어있는지 확인
        const responseText = await response.text();
        logger.log('외부 서버 응답 내용', { responseText });

        if (!responseText) {
            logger.log('외부 서버에서 빈 응답 받음');

            // 401 상태 코드이면서 응답이 비어있는 경우 인증 실패로 처리
            if (response.status === 401) {
                return new Response(JSON.stringify({
                    success: false,
                    error: '아이디 또는 비밀번호가 올바르지 않습니다.'
                }), {
                    status: 401,
                    headers: { 'Content-Type': 'application/json' }
                });
            }

            // 그 외의 경우는 서버 오류로 처리
            return new Response(JSON.stringify({
                success: false,
                error: '외부 서버에서 응답을 받지 못했습니다.'
            }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        let data: any;

        try {
            data = JSON.parse(responseText);
        } catch (parseError) {
            logger.log('JSON 파싱 에러', { parseError, responseText });
            return new Response(JSON.stringify({
                success: false,
                error: '외부 서버 응답을 파싱할 수 없습니다.'
            }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        if (!response.ok) {
            logger.log('로그인 실패', { status: response.status, error: data });

            // 일관된 에러 응답 형식으로 변환
            const errorResponse = {
                success: false,
                error: data.message || data.error || '로그인에 실패했습니다.'
            };

            return new Response(JSON.stringify(errorResponse), {
                status: response.status,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // 외부 서버 응답을 클라이언트가 기대하는 형식으로 변환
        const clientResponse = {
            success: true,
            token: data.accessToken,  // accessToken을 token으로 변환
            user: {
                username: data.user_name || data.username // 사용자 정보가 있다면 포함
            }
        };

        logger.log('로그인 성공');
        return new Response(JSON.stringify(clientResponse), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        logger.log('로그인 에러', error);
        return new Response(JSON.stringify({
            success: false,
            error: '서버 오류가 발생했습니다.'
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}