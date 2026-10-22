import Image from "next/image";
import { Scissors } from "lucide-react";

export type ServiceImageSource = {
    name?: string;
    imageUrl?: string | null;
    service?: {
        name: string;
        imageUrl: string | null;
    };
};

interface ServiceCollageThumbnailProps {
    services: ServiceImageSource[];
    className?: string;
}

const COMBO_SUB_SERVICES: Record<string, string[]> = {
    "Strzyżenie Męskie + Broda + Pielęgnacja Twarzy": [
        "/images/services/mens-cut.webp",
        "/images/services/beard-trim.webp",
        "/images/services/full-service.webp",
    ],
    "Strzyżenie Męskie + Broda": [
        "/images/services/mens-cut.webp",
        "/images/services/beard-trim.webp",
    ],
    "Golenie Głowy + Broda": [
        "/images/services/head-shave.webp",
        "/images/services/beard-trim.webp",
    ],
};

/**
 * Funkcja pomocnicza pobierająca nazwę usługi z obiektu usługi.
 * @param item - Obiekt reprezentujący usługę.
 * @returns - Nazwa usługi.
 */
function getServiceName(item: ServiceImageSource): string {
    if (item.service?.name) return item.service.name;
    if (item.name) return item.name;
    return "";
}

/**
 * Funkcja pomocnicza pobierająca adres URL zdjęcia usługi.
 * @param item - Obiekt reprezentujący usługę.
 * @returns - Adres URL zdjęcia lub null.
 */
function getServiceImageUrl(item: ServiceImageSource): string | null {
    if (item.service && item.service.imageUrl !== undefined) return item.service.imageUrl;
    if (item.imageUrl !== undefined) return item.imageUrl;
    return null;
}

/**
 * Funkcja resolveServiceImages przyjmuje tablicę usług i zwraca tablicę URL-i zdjęć odpowiadających tym usługom.
 * Obsługuje pojedyncze usługi, pakiety łączone ze znakiem '+' oraz zdefiniowane kombinacje COMBO_SUB_SERVICES.
 * @param services - Tablica obiektów usług.
 * @returns - Tablica URL-i zdjęć odpowiadających usługom.
 */
export function resolveServiceImages(services: ServiceImageSource[]): string[] {
    if (!services || services.length === 0) return [];

    if (services.length > 1) {
        const directUrls = services
            .map(getServiceImageUrl)
            .filter((url): url is string => Boolean(url));
        if (directUrls.length > 0) {
            return directUrls.slice(0, 3);
        }
    }

    const singleName = getServiceName(services[0]).trim();
    const singleUrl = getServiceImageUrl(services[0]);

    for (const [comboName, urls] of Object.entries(COMBO_SUB_SERVICES)) {
        if (singleName.toLowerCase() === comboName.toLowerCase()) {
            return urls;
        }
    }

    if (singleName.includes("+")) {
        const parts = singleName.split("+").map((p) => p.trim().toLowerCase());
        const matchedUrls: string[] = [];
        for (const part of parts) {
            if (part.includes("strzyżen") || part.includes("męskie") || part.includes("włos")) {
                matchedUrls.push("/images/services/mens-cut.webp");
            } else if (part.includes("brod")) {
                matchedUrls.push("/images/services/beard-trim.webp");
            } else if (part.includes("twarz") || part.includes("pielęgnacj")) {
                matchedUrls.push("/images/services/full-service.webp");
            } else if (part.includes("golenie") && part.includes("głow")) {
                matchedUrls.push("/images/services/head-shave.webp");
            }
        }
        if (matchedUrls.length >= 2) {
            return matchedUrls.slice(0, 3);
        }
    }

    if (singleUrl) {
        return [singleUrl];
    }

    return [];
}

/**
 * Komponent kafelka ze zdjęciem/zdjęciami usług.
 * W przypadku wielu usług lub pakietów łączonych dzieli zdjęcia po przekątnej pod kątem 45 stopni:
 * - 2 zdjęcia: przez środek (50/50),
 * - 3 zdjęcia: na 3 równe części po 33%.
 * @param props - Właściwości komponentu zawierające tablicę usług i opcjonalną klasę stylów.
 * @returns - Komponent kafelka ze zdjęciem lub kolażem zdjęć usług.
 */
export default function ServiceCollageThumbnail({ services, className }: ServiceCollageThumbnailProps) {
    const images = resolveServiceImages(services);

    const baseClass = "relative shrink-0 overflow-hidden shadow-sm";
    const containerClass = className
        ? `${baseClass} ${className}`
        : `${baseClass} w-12 h-12 sm:w-14 sm:h-14 rounded-xl border border-outline-variant/30 bg-surface-container-high`;

    if (images.length === 0) {
        return (
            <div className={`${containerClass} flex items-center justify-center bg-surface-input text-primary`}>
                <Scissors className="w-5 h-5 text-primary/70" />
            </div>
        );
    }

    if (images.length === 1) {
        return (
            <div className={containerClass}>
                <Image
                    src={images[0]}
                    alt="Usługa"
                    fill
                    sizes="(max-width: 640px) 96px, 128px"
                    className="object-cover"
                />
            </div>
        );
    }

    if (images.length === 2) {
        return (
            <div className={`${containerClass} bg-surface-container-lowest`}>
                <Image
                    src={images[0]}
                    alt="Usługa 1"
                    fill
                    sizes="(max-width: 640px) 96px, 128px"
                    style={{ clipPath: "polygon(0 0, 100% 0, 0 100%)" }}
                    className="object-cover"
                />
                <Image
                    src={images[1]}
                    alt="Usługa 2"
                    fill
                    sizes="(max-width: 640px) 96px, 128px"
                    style={{ clipPath: "polygon(100% 0, 100% 100%, 0 100%)" }}
                    className="object-cover"
                />
                <svg
                    className="absolute inset-0 w-full h-full pointer-events-none z-10"
                    viewBox="0 0 100 100"
                    preserveAspectRatio="none"
                >
                    <line x1="0" y1="100" x2="100" y2="0" stroke="#141414" strokeWidth="2.5" />
                </svg>
            </div>
        );
    }

    return (
        <div className={`${containerClass} bg-surface-container-lowest`}>
            <Image
                src={images[0]}
                alt="Usługa 1"
                fill
                sizes="(max-width: 640px) 96px, 128px"
                style={{ clipPath: "polygon(0 0, 66.7% 0, 0 66.7%)" }}
                className="object-cover"
            />
            <Image
                src={images[1]}
                alt="Usługa 2"
                fill
                sizes="(max-width: 640px) 96px, 128px"
                style={{ clipPath: "polygon(66.7% 0, 100% 0, 100% 33.3%, 33.3% 100%, 0 100%, 0 66.7%)" }}
                className="object-cover"
            />
            <Image
                src={images[2]}
                alt="Usługa 3"
                fill
                sizes="(max-width: 640px) 96px, 128px"
                style={{ clipPath: "polygon(100% 33.3%, 100% 100%, 33.3% 100%)" }}
                className="object-cover"
            />
            <svg
                className="absolute inset-0 w-full h-full pointer-events-none z-10"
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
            >
                <line x1="0" y1="66.7" x2="66.7" y2="0" stroke="#141414" strokeWidth="2" />
                <line x1="33.3" y1="100" x2="100" y2="33.3" stroke="#141414" strokeWidth="2" />
            </svg>
        </div>
    );
}
