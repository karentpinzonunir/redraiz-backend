import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://redraiz-backend.vercel.app',
    'https://redraiz.vercel.app/',
    'https://redraiz-git-karent-karentpinzonunirs-projects.vercel.app/'
    // Agrega aquí la URL de tu frontend cuando lo subas a Vercel
    // 'https://tu-frontend.vercel.app',
];

export function middleware(request: NextRequest) {
    const origin = request.headers.get('origin');

    const response = NextResponse.next();

    if (origin && allowedOrigins.includes(origin)) {
        response.headers.set('Access-Control-Allow-Origin', origin);
    }

    response.headers.set(
        'Access-Control-Allow-Methods',
        'GET, POST, PUT, DELETE, OPTIONS'
    );

    response.headers.set(
        'Access-Control-Allow-Headers',
        'Content-Type, Authorization'
    );

    response.headers.set('Access-Control-Allow-Credentials', 'true');

    if (request.method === 'OPTIONS') {
        return new NextResponse(null, {
            status: 204,
            headers: response.headers,
        });
    }

    return response;
}

export const config = {
    matcher: '/api/:path*',
};