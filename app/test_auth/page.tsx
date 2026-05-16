import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function RegisterPage() {
    return (
        //glowny kontener
        <div className="bg-background text-on-background font-body min-h-screen relative overflow-hidden">

            {/* fota */}
            <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
                <img
                    alt="Barber"
                    className="w-full h-full object-cover grayscale"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuDbwdiBtwz1pBRYojhxzs5Bj2wp564xZBo1BIO1vAPXqGG2O5wsCNpkIUQD0W9fFYM3vBq8LI9EunV6qJh6hJIvZg_FYMvgUVcb6Ix-q0jg2Y3bvmHGzSt_oq-zbYYd4PzbG7k3zu_-iQtsXTFe-DzTKCaDj7uGYrGBhiHfRuJ-Q5_0yCwIaVUfba7ZuRqC_5obJgbxAbW40sKFZqc66kboDEAVizXYtC72iCN51ecsBdUm6M0iDAc7Mcfr5ZxoKf-0KBAvii0o15zj"
                />
                {/* gradient */}
                <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background"></div>
            </div>
            {/* formularz */}
            <main className="relative z-10 min-h-screen flex items-center justify-center px-6 py-24"></main>

        </div>
    )
}