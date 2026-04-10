import { prisma } from "@/lib/prisma";
import type { TestService } from "@prisma/client";

export default async function TestPage() {
    const services = await prisma.testService.findMany();

    return (
        <div className="p-10 text-white bg-black min-h-screen">
            <h1 className="text-2xl font-bold mb-6">Lista Usług</h1>

            {services.length === 0 && (
                <p className="text-zinc-500">Baza jest pusta, ale połączenie działa!</p>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {services.map((service: TestService) => (
                    <div key={service.id} className="border border-zinc-800 p-4 rounded bg-zinc-900">
                        <h2 className="font-bold text-xl">{service.title}</h2>
                        <p className="text-green-400 font-mono mt-2">{service.price} zł</p>
                    </div>
                ))}
            </div>
        </div>
    );
}