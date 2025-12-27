import { NextRequest, NextResponse } from 'next/server';
import { Octokit } from 'octokit';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { title, content, slug } = body;

        if (!title || !content || !slug) {
            return NextResponse.json({ error: '제목, 내용, 슬러그는 필수입니다.' }, { status: 400 });
        }

        const path = `content/posts/${slug}.json`;
        const fileContent = JSON.stringify({
            title,
            content,
            slug,
            updatedAt: new Date().toISOString(),
        }, null, 2);

        const octokit = new Octokit({
            auth: process.env.GITHUB_ACCESS_TOKEN,
        });

        const repoFull = process.env.GITHUB_REPO || 'ustudiopd/blogedit';
        const [owner, repo] = repoFull.split('/');

        // 기존 파일이 있는지 확인 (SHA 필요)
        let sha: string | undefined;
        try {
            const { data } = await octokit.rest.repos.getContent({
                owner,
                repo,
                path,
            });
            if (!Array.isArray(data)) {
                sha = data.sha;
            }
        } catch (e) {
            // 파일이 없으면 무시
        }

        await octokit.rest.repos.createOrUpdateFileContents({
            owner,
            repo,
            path,
            message: `Save post: ${title}`,
            content: Buffer.from(fileContent).toString('base64'),
            sha,
        });

        return NextResponse.json({ success: true, path });
    } catch (error: any) {
        console.error('GitHub save error:', error);
        return NextResponse.json({ error: error.message || '포스트 저장 중 오류가 발생했습니다.' }, { status: 500 });
    }
}
