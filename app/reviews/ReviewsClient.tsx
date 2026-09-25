"use client";

import { useState, useMemo } from "react";
import { Star, StarHalf, Quote, Scissors, Filter } from "lucide-react";

const CATEGORY_LABELS: Record<string, string> = {
    HAIR: "Włosy",
    BEARD: "Broda",
    COMBO: "Pakiety Combo",
    CARE: "Pielęgnacja",
};

interface ReviewItem {
    id: string;
    rating: number;
    comment: string | null;
    createdAt: string;
    authorName: string;
    serviceName: string | null;
    categories: string[];
}

interface ServiceItem {
    id: string;
    name: string;
    category: string;
}

interface ReviewsClientProps {
    initialReviews: ReviewItem[];
    services: ServiceItem[];
}

/**
 * Komponent ReviewsClient renderuje listę opinii klientów z możliwością filtrowania według oceny, kategorii i usługi oraz sortowania według daty lub oceny.
 * Użytkownik może wybrać ocenę w skali od 1 do 5 gwiazdek, kategorię usług oraz konkretną usługę, aby zawęzić wyświetlane opinie.
 * Komponent oblicza dostępne kategorie i usługi na podstawie przekazanych danych oraz aktualizuje listę opinii w zależności od wybranych filtrów i sortowania.
 * W przypadku braku opinii spełniających kryteria filtrowania, wyświetlany jest odpowiedni komunikat.
 */
export default function ReviewsClient({ initialReviews, services }: ReviewsClientProps) {
    const [selectedRating, setSelectedRating] = useState<number | "all">("all");
    const [selectedCategory, setSelectedCategory] = useState<string>("all");
    const [selectedService, setSelectedService] = useState<string>("all");
    const [sortBy, setSortBy] = useState<"newest" | "highest" | "lowest">("newest");

    const availableCategories = useMemo(() => {
        return Array.from(new Set(services.map((s) => s.category)));
    }, [services]);

    const filteredAvailableServices = useMemo(() => {
        if (selectedCategory === "all") return services;
        return services.filter((s) => s.category === selectedCategory);
    }, [services, selectedCategory]);

    const handleCategoryChange = (cat: string) => {
        setSelectedCategory(cat);
        setSelectedService("all");
    };

    const filteredReviews = useMemo(() => {
        return initialReviews
            .filter((rev) => {
                const matchesRating = selectedRating === "all" || Math.floor(rev.rating) === selectedRating;
                const matchesCategory =
                    selectedCategory === "all" || rev.categories.includes(selectedCategory);
                const matchesService =
                    selectedService === "all" || (rev.serviceName && rev.serviceName.includes(selectedService));

                return matchesRating && matchesCategory && matchesService;
            })
            .sort((a, b) => {
                if (sortBy === "highest") return b.rating - a.rating;
                if (sortBy === "lowest") return a.rating - b.rating;
                return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            });
    }, [initialReviews, selectedRating, selectedCategory, selectedService, sortBy]);

    return (
        <div>
            <div className="bg-surface-container/40 border border-outline-variant/15 rounded-2xl p-5 mb-8 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-2 text-xs font-label uppercase tracking-widest text-primary font-bold mr-2">
                        <Filter className="w-3.5 h-3.5" />
                        Filtruj:
                    </div>

                    <select
                        value={selectedRating}
                        onChange={(e) => setSelectedRating(e.target.value === "all" ? "all" : Number(e.target.value))}
                        className="bg-surface-container-highest border border-outline-variant/20 text-on-surface text-xs rounded-xl px-3 py-2 outline-none focus:border-primary/60 transition-colors"
                    >
                        <option value="all">Wszystkie oceny</option>
                        <option value="5">5 gwiazdek</option>
                        <option value="4">4 gwiazdki</option>
                        <option value="3">3 gwiazdki</option>
                        <option value="2">2 gwiazdki</option>
                        <option value="1">1 gwiazdka</option>
                    </select>

                    {availableCategories.length > 0 && (
                        <select
                            value={selectedCategory}
                            onChange={(e) => handleCategoryChange(e.target.value)}
                            className="bg-surface-container-highest border border-outline-variant/20 text-on-surface text-xs rounded-xl px-3 py-2 outline-none focus:border-primary/60 transition-colors"
                        >
                            <option value="all">Wszystkie kategorie</option>
                            {availableCategories.map((cat) => (
                                <option key={cat} value={cat}>
                                    {CATEGORY_LABELS[cat] || cat}
                                </option>
                            ))}
                        </select>
                    )}

                    {filteredAvailableServices.length > 0 && (
                        <select
                            value={selectedService}
                            onChange={(e) => setSelectedService(e.target.value)}
                            className="bg-surface-container-highest border border-outline-variant/20 text-on-surface text-xs rounded-xl px-3 py-2 outline-none focus:border-primary/60 transition-colors"
                        >
                            <option value="all">
                                {selectedCategory === "all" ? "Wszystkie usługi" : `Wszystkie z: ${CATEGORY_LABELS[selectedCategory] || selectedCategory}`}
                            </option>
                            {filteredAvailableServices.map((service) => (
                                <option key={service.id} value={service.name}>
                                    {service.name}
                                </option>
                            ))}
                        </select>
                    )}
                </div>

                <div className="flex items-center gap-2">
                    <span className="text-xs text-on-surface-variant font-label uppercase tracking-wider">
                        Sortuj:
                    </span>
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as "newest" | "highest" | "lowest")}
                        className="bg-surface-container-highest border border-outline-variant/20 text-on-surface text-xs rounded-xl px-3 py-2 outline-none focus:border-primary/60 transition-colors"
                    >
                        <option value="newest">Od najnowszych</option>
                        <option value="highest">Najwyższa ocena</option>
                        <option value="lowest">Najniższa ocena</option>
                    </select>
                </div>
            </div>

            {filteredReviews.length === 0 ? (
                <div className="text-center py-20 bg-surface-container/30 rounded-2xl border border-outline-variant/10">
                    <p className="text-on-surface-variant text-sm italic">
                        Brak opinii spełniających wybrane kryteria filtrowania.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredReviews.map((review) => {
                        const formattedDate = new Intl.DateTimeFormat("pl-PL", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                        }).format(new Date(review.createdAt));

                        return (
                            <div
                                key={review.id}
                                className="bg-surface-container-high/60 border border-outline-variant/25 rounded-2xl p-6 flex flex-col justify-between hover:border-primary/40 hover:bg-surface-container-high/80 transition-all shadow-sm"
                            >
                                <div>
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex gap-1 items-center">
                                            {Array(Math.floor(review.rating)).fill(0).map((_, index) => (
                                                <Star key={`full-${index}`} className="w-3.5 h-3.5 text-primary fill-primary" />
                                            ))}
                                            {review.rating % 1 >= 0.5 && (
                                                <StarHalf className="w-3.5 h-3.5 text-primary fill-primary" />
                                            )}
                                            <span className="text-xs font-bold text-on-surface ml-1.5">
                                                {review.rating.toFixed(1)}
                                            </span>
                                        </div>
                                        <Quote className="w-5 h-5 text-primary/30 rotate-180" />
                                    </div>

                                    <p className="text-[13px] text-on-surface/85 font-body leading-relaxed mb-5 italic line-clamp-4">
                                        &ldquo;{review.comment || "Świetna atmosfera i profesjonalne strzyżenie!"}&rdquo;
                                    </p>
                                </div>

                                <div className="pt-3.5 border-t border-outline-variant/15 flex flex-col gap-2.5">
                                    {review.serviceName && (
                                        <div className="flex items-center gap-1.5 text-[10px] text-on-surface-variant/65 tracking-wide font-normal">
                                            <Scissors className="w-2.5 h-2.5 shrink-0 opacity-60" />
                                            <span>{review.serviceName}</span>
                                        </div>
                                    )}

                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-full bg-surface-container-highest border border-primary/20 flex items-center justify-center text-primary font-headline font-bold text-sm uppercase shrink-0 shadow-xs">
                                            {review.authorName[0]}
                                        </div>
                                        <div className="flex flex-col">
                                            <div className="flex items-center gap-1.5 leading-tight">
                                                <span className="font-headline font-bold text-sm text-primary">
                                                    {review.authorName}
                                                </span>
                                            </div>
                                            <span className="text-[9px] text-on-surface-variant/60 font-medium tracking-wide mt-0.5">
                                                {formattedDate}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}