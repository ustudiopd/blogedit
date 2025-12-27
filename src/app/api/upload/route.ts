import { NextRequest, NextResponse } from 'next/server';
import { Octokit } from 'octokit';

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: '파일이 없습니다.' }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        const base64Content = buffer.toString('base64');

        const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9ms._-]/g, '')}`;
        const path = `public/uploads/${fileName}`;

        const octokit = new Octokit({
            auth: process.env.GITHUB_ACCESS_TOKEN,
        });

        // 환경 변수에서 리포지토리 정보 가져오기 (예: ustudiopd/blogedit)
        // Netlify나 로컬 환경변수에 REPO_NAME="owner/repo" 형식으로 필요
        const repoFull = process.env.GITHUB_REPO || 'ustudiopd/blogedit';
        const [owner, repo] = repoFull.split('/');

        await octokit.rest.repos.createOrUpdateFileContents({
            owner,
            repo,
            path,
            message: `Upload image: ${fileName}`,
            content: base64Content,
        });

        // GitHub Pages나 raw content URL을 통해 이미지 접근 가능
        // 하지만 Netlify 배포 후에는 배포된 도메인/uploads/파일명 으로 접근하는 것이 안정적입니다.
        const url = `/uploads/${fileName}`;

        return NextResponse.json({ url });
    } catch (error: any) {
        console.error('GitHub upload error:', error);
        return NextResponse.json({ error: error.message || '이미지 업로드 중 오류가 발생했습니다.' }, { status: 500 });
    }
}
