import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    /* config options here */
    typescript: {
        // 빌드 시 타입 에러가 있어도 진행하게 하려면 설정을 추가할 수 있지만, 
        // 이미 에러를 모두 수정했으므로 기본값(false)을 유지합니다.
        ignoreBuildErrors: false,
    },
    eslint: {
        ignoreDuringBuilds: false,
    },
};

export default nextConfig;
