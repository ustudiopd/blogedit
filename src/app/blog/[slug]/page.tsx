import PostViewer from '@/components/blog/PostViewer';

export default async function BlogDetailPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    // 실제 구현에서는 slug로 DB에서 데이터를 가져와야 함
    const mockHtml = `
    <h1>블로그 상세 페이지</h1>
    <p>슬러그: <strong>${slug}</strong></p>
    <p>이 페이지는 PostViewer 컴포넌트를 사용하여 렌더링됩니다.</p>
    <img src="https://images.unsplash.com/photo-1498050108023-c5249f4df085" alt="Test Image" style="width: 100%;" />
  `;

    return (
        <div className="min-h-screen bg-slate-950 text-slate-50 p-8">
            <div className="max-w-4xl mx-auto space-y-8">
                <PostViewer htmlContent={mockHtml} />
            </div>
        </div>
    );
}
