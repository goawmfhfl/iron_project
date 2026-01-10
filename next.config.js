/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      // Notion 이미지(secure.notion-static / S3 signed url 등) 최적화 허용
      {
        protocol: 'https',
        hostname: 'www.notion.so',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'notion.so',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**.notion-static.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**.amazonaws.com',
        pathname: '/**',
      },
    ],
  },
  // webpack 캐시 설정 - 빌드 안정성 향상
  // Vercel 환경에서 webpack 캐시 오류를 방지하기 위한 설정
  webpack: (config, { dev, isServer }) => {
    // 프로덕션 빌드에서만 캐시 최적화
    if (!dev) {
      // Vercel 환경에서 안정성을 위해 메모리 캐시 사용
      // 파일 시스템 캐시는 Vercel의 임시 파일 시스템에서 문제를 일으킬 수 있음
      config.cache = {
        type: 'memory',
        maxGenerations: 1,
      };
      
      // 추가 안정성 설정
      if (config.optimization) {
        config.optimization = {
          ...config.optimization,
          // 모듈 ID 생성 방식 변경 (안정성 향상)
          moduleIds: 'deterministic',
          // 청크 ID 생성 방식 변경
          chunkIds: 'deterministic',
        };
      }
    }
    return config;
  },
  // optimizeCss는 critters 모듈이 필요하여 빌드 오류 발생 가능
  // 필요시 npm install critters 후 활성화
  // experimental: {
  //   optimizeCss: true,
  // },
}

module.exports = nextConfig

