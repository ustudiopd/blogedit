export default function Home() {
    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-slate-950 text-slate-50">
            <div className="z-10 max-w-5xl w-full items-center justify-center font-mono text-sm flex flex-col gap-8">
                <h1 className="text-6xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">
                    AI Blog Editor
                </h1>
                <p className="text-slate-400 text-center text-xl max-w-2xl">
                    Novel.sh와 Tiptap을 활용한 고성능 블로그 에디터 구현 예제입니다.
                    슬래시 메뉴, 이미지 리사이즈, AI 슬러그 생성 기능이 포함되어 있습니다.
                </p>
                <a
                    href="/blog/write"
                    className="mt-8 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-full text-lg font-bold shadow-lg shadow-blue-500/20 transition-all hover:scale-105"
                >
                    에디터 체험하기
                </a>
            </div>
        </main>
    );
}
