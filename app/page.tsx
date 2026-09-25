import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import { prisma } from "@/lib/prisma";
import { Scissors, Flower2, Coffee, ShieldCheck, Star, StarHalf, Quote } from "lucide-react";
import { Barber } from "@prisma/client";
import Newsletter from '@/app/components/newsletter';
import { getRandomRecentReviews } from "@/lib/reviews";
import Image from "next/image";

/**
 * Strona główna aplikacji Fresh Cut, prezentująca informacje o salonie barberskim, zespole barberów oraz opinie klientów.
 */
export default async function Home() {
  const supabase = await createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();

  let databaseUser = null;

  if (authUser) {
    databaseUser = await prisma.user.findUnique({
      where: { id: authUser.id },
    });
  }

  const barbers = await prisma.barber.findMany();

  const [reviews, totalReviewsCount] = await Promise.all([
    getRandomRecentReviews(12),
    prisma.review.count(),
  ]);

  return (
    <div className="bg-background text-on-surface font-body selection:bg-primary selection:text-on-primary min-h-screen">

      <main>
        <section className="relative min-h-screen flex items-center justify-start pt-20 overflow-hidden w-full">
          <div className="absolute inset-0 z-0 overflow-hidden">
            <div className="absolute inset-0 bg-linear-to-r from-background via-background/80 to-transparent z-10"></div>
            <Image
              src="/images/hero.webp"
              alt="Luxury Barber Shop Interior"
              fill
              priority
              sizes="100vw"
              className="object-cover scale-110 origin-center"
            />
          </div>
          <div className="relative z-20 px-6 sm:px-8 md:px-20 max-w-5xl">
            <label className="font-label text-primary tracking-[0.3em] uppercase text-sm mb-6 block font-medium">DOŁĄCZ DO NAS</label>
            <h1 className="font-headline text-4xl sm:text-6xl md:text-8xl font-black text-on-surface leading-[0.9] tracking-tighter mb-8">
              Nowoczesne <br />
              <span className="text-transparent bg-clip-text bg-linear-to-r from-primary via-secondary to-primary">Doświadczenie</span> <br />
              Barberskie
            </h1>
            <p className="text-on-surface-variant text-lg sm:text-xl max-w-xl mb-12 font-body leading-relaxed">Precyzja, dziedzictwo i sztuka pielęgnacji. Wejdź do przestrzeni, w której klasyczne techniki spotykają się z nowoczesną estetyką redakcyjną.</p>
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 sm:w-auto">
              <Link href={databaseUser ? "/dashboard" : "/login"} className="bg-primary text-on-primary px-10 py-5 rounded-lg font-headline font-extrabold tracking-widest text-base hover:scale-105 transition-transform text-center">
                UMÓW WIZYTĘ
              </Link>
              <Link
                href="/services"
                className="border border-outline-variant/30 text-on-surface px-10 py-5 rounded-lg font-headline font-bold tracking-widest text-base hover:bg-surface-container-high transition-colors text-center">
                ZOBACZ USŁUGI
              </Link>
            </div>
          </div>
        </section>

        <section className="pt-32 px-8 md:px-20 relative">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-16 items-center max-w-7xl mx-auto">

            <div className="lg:col-span-5 relative">
              <div className="aspect-3/4 md:aspect-4/5 rounded-xl overflow-hidden shadow-2xl group relative">
                <Image
                  src="/images/barber_working.webp"
                  alt="Barber working"
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover filter grayscale group-hover:grayscale-0 transition-all duration-700"
                />
              </div>
            </div>

            <div className="lg:col-span-7 flex flex-col justify-center">
              <span className="text-primary font-label tracking-[0.3em] text-xs uppercase mb-4 block">
                NASZA FILOZOFIA
              </span>
              <h2 className="font-headline text-5xl md:text-6xl font-black mb-8 leading-[1.1] text-on-surface">
                Tworzymy coś <span className="text-primary italic font-black">więcej</span> niż tylko fryzurę.
              </h2>

              <div className="space-y-6 mb-12 border-l-2 border-primary/30 pl-6 md:pl-8">
                <p className="text-on-surface-variant font-body text-lg leading-relaxed">
                  Fresh Cut zrodziło się z chęci przedefiniowania rytuału pielęgnacji. Nie podążamy tylko za trendami, studiujemy architekturę twarzy i teksturę włosów, aby stworzyć wygląd, który jest unikalny dla Ciebie.
                </p>
                <p className="text-on-surface-variant font-body text-lg leading-relaxed">
                  Wierzymy, że wizyta u barbera to nie przykry obowiązek, ale rzadki moment wytchnienia od codziennego zgiełku. To przestrzeń, w której tradycyjne, stare rzemiosło bezbłędnie łączy się z tempem życia nowoczesnego dżentelmena.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 md:gap-10">

                <div className="flex items-start gap-4">
                  <div className="text-primary mt-1 bg-surface-container-high p-2 rounded-lg">
                    <Scissors className="w-5 h-5 shrink-0" />
                  </div>
                  <div>
                    <h4 className="font-headline font-bold text-lg mb-1">Inżynieria Precyzji</h4>
                    <p className="text-on-surface-variant text-sm leading-relaxed">Cięcia z chirurgiczną precyzją, architektonicznie dopasowane do Twojej twarzy.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="text-primary mt-1 bg-surface-container-high p-2 rounded-lg">
                    <Flower2 className="w-5 h-5 shrink-0" />
                  </div>
                  <div>
                    <h4 className="font-headline font-bold text-lg mb-1">Zmysłowe Rytuały</h4>
                    <p className="text-on-surface-variant text-sm leading-relaxed">Gorące ręczniki i rzemieślnicze olejki dla absolutnego relaksu podczas golenia.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="text-primary mt-1 bg-surface-container-high p-2 rounded-lg">
                    <Coffee className="w-5 h-5 shrink-0" />
                  </div>
                  <div>
                    <h4 className="font-headline font-bold text-lg mb-1">Klubowa Atmosfera</h4>
                    <p className="text-on-surface-variant text-sm leading-relaxed">Wyśmienita kawa, wyselekcjonowane trunki i muzyka, która pozwala zwolnić.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="text-primary mt-1 bg-surface-container-high p-2 rounded-lg">
                    <ShieldCheck className="w-5 h-5 shrink-0" />
                  </div>
                  <div>
                    <h4 className="font-headline font-bold text-lg mb-1">Kosmetyki Premium</h4>
                    <p className="text-on-surface-variant text-sm leading-relaxed">Pracujemy wyłącznie na elitarnych markach zapewniających zdrowie włosa.</p>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </section>

        <section className="py-32 bg-surface-container-low">
          <div className="px-8 md:px-20 mb-20">
            <h2 className="font-headline text-5xl font-bold mb-4">Nasi Barberzy</h2>
            <p className="text-on-surface-variant max-w-xl">Poznaj zespół stojący za Fresh Cut. Doświadczeni specjaliści męskiego rzemiosła, którzy zadbają o Twój nienaganny wygląd.</p>
          </div>

          <div className="px-8 md:px-20 grid grid-cols-1 md:grid-cols-2 gap-8">
            {barbers.length > 0 ? (
              barbers.map((barber: Barber) => (
                <div key={barber.id} className="group relative bg-surface-container overflow-hidden rounded-xl border border-outline-variant/10">
                  <div className="aspect-video overflow-hidden bg-black flex items-center justify-center">
                    <Image
                      src={barber.imageUrl || "/images/placeholder.webp"}
                      alt={`Barber ${barber.name}`}
                      width={500}
                      height={650}
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="w-full h-auto object-contain translate-y-22.5 transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="p-8">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-headline text-2xl font-bold">{barber.name}</h3>
                        <p className="text-primary font-label text-xs tracking-widest uppercase mt-1">{barber.role}</p>
                      </div>
                    </div>
                    <p className="text-on-surface-variant mb-6 text-sm leading-relaxed">{barber.bio}</p>
                    <Link
                      href={`/portfolio/${barber.name.toLowerCase().replace(/\s+/g, "-")}`}
                      className="block w-full text-center py-3 rounded-lg border border-primary/20 text-primary font-headline font-bold text-xs tracking-widest hover:bg-primary hover:text-on-primary transition-all"
                    >
                      ZOBACZ PORTFOLIO
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-1 md:col-span-2 text-center text-on-surface-variant text-sm italic py-12">
                Brak zarejestrowanych barberów. Sprawdź bazę danych.
              </div>
            )}
          </div>
        </section>

        <section className="py-2 overflow-hidden relative">
          <div className="px-8 md:px-20 text-center mb-16">
            <span className="text-primary font-label tracking-widest text-xs uppercase mb-4 block">OPINIE</span>
            <h2 className="font-headline text-5xl font-bold">Co mówią klienci</h2>
          </div>

          {reviews.length === 0 ? (
            <div className="text-center text-on-surface-variant text-sm italic py-8">
              Brak opinii do wyświetlenia.
            </div>
          ) : reviews.length > 5 ? (
            <div className="relative w-full overflow-hidden">
              <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-24 bg-linear-r from-background to-transparent z-10" />
              <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-24 bg-linear-l from-background to-transparent z-10" />

              <div className="animate-marquee flex gap-6">
                {[...reviews, ...reviews].map((review, idx) => {
                  const authorName = review.user?.firstName || "Klient";
                  const reviewComment = review.comment || "Świetna atmosfera i profesjonalne strzyżenie!";

                  return (
                    <div
                      key={`${review.id}-${idx}`}
                      className="w-75 md:w-85 2xl:w-90 shrink-0 bg-white/3 border border-white/8 hover:border-primary/40 rounded-2xl p-6 flex flex-col justify-between transition-colors"
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

                        <p className="text-sm text-on-surface/90 font-body leading-relaxed mb-6 italic line-clamp-3">
                          &ldquo;{reviewComment}&rdquo;
                        </p>
                      </div>

                      <div className="flex items-center gap-3 pt-3 border-t border-outline-variant/10">
                        <div className="w-8 h-8 rounded-full bg-surface-container-highest border border-outline-variant/20 flex items-center justify-center text-primary font-headline font-bold text-xs uppercase">
                          {authorName[0]}
                        </div>
                        <span className="font-headline font-bold text-sm text-on-surface">
                          {authorName}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="w-full overflow-x-auto px-6 md:px-12 py-2 flex justify-start md:justify-center items-stretch gap-6 scrollbar-none [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
              {reviews.map((review) => {
                const authorName = review.user?.firstName || "Klient";
                const reviewComment = review.comment || "Świetna atmosfera i profesjonalne strzyżenie!";

                return (
                  <div
                    key={review.id}
                    className="w-75 md:w-85 2xl:w-90 shrink-0 bg-white/3 border border-white/8 hover:border-primary/40 rounded-2xl p-6 flex flex-col justify-between transition-colors"
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

                      <p className="text-sm text-on-surface/90 font-body leading-relaxed mb-6 italic line-clamp-3">
                        &ldquo;{reviewComment}&rdquo;
                      </p>
                    </div>

                    <div className="flex items-center gap-3 pt-3 border-t border-outline-variant/10">
                      <div className="w-8 h-8 rounded-full bg-surface-container-highest border border-outline-variant/20 flex items-center justify-center text-primary font-headline font-bold text-xs uppercase">
                        {authorName[0]}
                      </div>
                      <span className="font-headline font-bold text-sm text-on-surface">
                        {authorName}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {totalReviewsCount > 0 && (
            <div className="mt-12 text-center">
              <Link
                href="/reviews"
                className="inline-flex items-center gap-2 border border-outline-variant/30 hover:border-primary/50 bg-surface-container/40 hover:bg-surface-container px-6 py-3 rounded-xl font-headline font-bold text-xs tracking-widest text-on-surface hover:text-primary transition-all uppercase"
              >
                Zobacz wszystkie opinie ({totalReviewsCount}) &rarr;
              </Link>
            </div>
          )}
        </section>

        <section className="py-16 sm:py-24 px-4 sm:px-8 md:px-20 w-full">
          <div className="bg-primary rounded-2xl p-16 flex flex-col items-center text-center relative overflow-hidden">
            <div className="absolute inset-0 opacity-10 pointer-events-none">
              <Image
                src="/images/texture_bg.webp"
                alt="Texture background"
                fill
                sizes="100vw"
                aria-hidden="true"
                className="object-cover"
              />
            </div>
            <h2 className="font-headline text-on-primary text-4xl sm:text-5xl md:text-6xl font-black mb-8 relative z-10 leading-tight wrap-break-word max-w-3xl">Gotowy na transformację w Fresh Cut?</h2>
            <p className="text-on-primary/80 max-w-2xl mb-8 sm:mb-12 text-lg font-medium relative z-10 leading-relaxed">Liczba miejsc jest ograniczona. Nasi barberzy mają szybko zapełniające się kalendarze. Zarezerwuj swój czas na fotelu już dziś i doświadcz szczytu pielęgnacji.</p>
            <Link
              href={databaseUser ? "/dashboard" : "/login"}
              className="bg-background text-primary border border-primary/20 px-6 py-4 sm:px-12 sm:py-6 rounded-xl font-headline font-black text-xl tracking-widest hover:bg-[#1c1b1b] hover:scale-105 transition-all shadow-2xl relative z-10 text-center w-full sm:w-auto"
            >
              UMÓW WIZYTĘ
            </Link>
          </div>
        </section>
      </main>
      <Newsletter />
    </div>
  );
}