"use client";

import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { useRouter } from "next/navigation";

export function HeroSection() {
  const router = useRouter();

  return (
    <section className="relative w-full overflow-hidden">
      {/* 배경 그라데이션 장식 */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 -left-1/4 w-[600px] h-[600px] bg-primary-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 -right-1/4 w-[500px] h-[500px] bg-secondary-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16 items-center">
        <div className="space-y-6 lg:space-y-8">
          

        <div className="relative lg:order-first">
          <div className="relative mx-auto w-full max-w-md lg:max-w-lg">
            {/* 메인 이미지 컨테이너 */}
            <div className="relative aspect-[4/5] rounded-2xl lg:rounded-3xl overflow-hidden border-2 border-border/50 bg-surface shadow-elevation-4 group">
              <Image
                src="/assets/images/profile-photo.JPG"
                alt="아이언 프로필 사진"
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                sizes="(max-width: 1024px) 90vw, 480px"
                priority
              />
              {/* 오버레이 그라데이션 */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </div>

            {/* 장식 요소들 */}
            <div className="absolute -top-6 -right-6 w-32 h-32 rounded-full bg-primary-500/10 blur-2xl -z-10 animate-pulse" />
            <div className="absolute -bottom-8 -left-8 w-40 h-40 rounded-full bg-secondary-500/10 blur-3xl -z-10" />
            
            
          </div>
        </div>

          {/* 메인 헤드라인 */}
          <h1 className="mx-auto text-center text-3xl sm:text-4xl lg:text-5xl font-extrabold text-text-primary leading-tight tracking-tight">
            <span className="block mt-5">책을 통해</span>
            <span className="block mt-2 bg-gradient-to-r from-primary-400 via-primary-300 to-secondary-400 bg-clip-text text-transparent">
              새로운 인사이트를 얻으며
            </span>

            <span className="block mt-5">기록을 통해</span>
            <span className="block mt-2 bg-gradient-to-r from-secondary-400 via-primary-300 to-primary-400 bg-clip-text text-transparent">
              삶을 나답게 살아가며
            </span>

            

            <span className="block mt-5">대화를 통해</span>
            <span className="block mt-2 bg-gradient-to-r from-primary-400 via-primary-300 to-secondary-400 bg-clip-text text-transparent">
              함께 성장하는 시간을
              <br/>
              만드는 사람
            </span>
            <span className="block mt-6 text-text-primary">
              
            </span>

          </h1>

          

          
        </div>

     
      </div>
    </section>
  );
}

