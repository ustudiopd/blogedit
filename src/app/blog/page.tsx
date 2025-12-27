export default function BlogListPage() {
    return (
        <div className="min-h-screen bg-slate-950 text-slate-50 p-8">
            <div className="max-w-4xl mx-auto space-y-8">
                <header className="flex justify-between items-center border-b border-slate-800 pb-4">
                    <h1 className="text-3xl font-bold">블로그 목록</h1>
                    <a href="/blog/write" className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-md transition-colors font-medium">
                        새 글 작성
                    </a>
                </header>
                <div className="grid gap-6">
                    <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl hover:border-slate-600 transition-colors">
                        <h2 className="text-xl font-bold mb-2">테스트 포스트</h2>
                        <p className="text-slate-400">여기에 블로그 목록이 표시됩니다. (DB 연결 시 활성화)</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
