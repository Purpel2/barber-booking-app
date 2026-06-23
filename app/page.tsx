import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import { prisma } from "@/lib/prisma";
import { Scissors, Flower2, Coffee, ShieldCheck, Star, StarHalf, Quote } from "lucide-react";
import { Barber } from "@prisma/client";
import Newsletter from '@/app/components/newsletter';


export default async function Home() {
  //autentykacja serwerowa
  const supabase = await createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();

  let databaseUser = null;

  if (authUser) {
    databaseUser = await prisma.user.findUnique({
      where: { id: authUser.id },
    });
  }

  //pobranie wszystkich barberów z bazy danych
  const barbers = await prisma.barber.findMany();

  //losowe 3 opinie z bazy danych
  const randomReviews = await prisma.$queryRaw<any[]>`
    SELECT * FROM "Review" ORDER BY RANDOM() LIMIT 3
  `;

  return (
    <div className="bg-background text-on-surface font-body selection:bg-primary selection:text-on-primary min-h-screen">

      <main>
        {/* sekcja hero */}
        <section className="relative min-h-screen flex items-center justify-start pt-20 overflow-hidden">
          <div className="absolute inset-0 z-0">
            <div className="absolute inset-0 bg-linear-to-r from-background via-background/80 to-transparent z-10"></div>
            <img
              alt="Luxury Barber Shop Interior"
              className="w-full h-full object-cover scale-110 origin-center"
              src="/images/hero.webp"
            />
          </div>
          <div className="relative z-20 px-8 md:px-20 max-w-5xl">
            <label className="font-label text-primary tracking-[0.3em] uppercase text-sm mb-6 block font-medium">DOŁĄCZ DO NAS</label>
            <h1 className="font-headline text-6xl md:text-8xl font-black text-on-surface leading-[0.9] tracking-tighter mb-8">
              Nowoczesne <br />
              <span className="text-transparent bg-clip-text bg-linear-to-r from-primary via-secondary to-primary">Doświadczenie</span> <br />
              Barberskie
            </h1>
            <p className="text-on-surface-variant text-xl max-w-xl mb-12 font-body leading-relaxed">Precyzja, dziedzictwo i sztuka pielęgnacji. Wejdź do przestrzeni, w której klasyczne techniki spotykają się z nowoczesną estetyką redakcyjną.</p>
            <div className="flex flex-col sm:flex-row gap-6">
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

        {/* sekcja o nas */}
        <section className="pt-32 px-8 md:px-20 relative">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-16 items-center max-w-7xl mx-auto">

            {/* lewa strona*/}
            <div className="lg:col-span-5 relative">
              <div className="aspect-3/4 md:aspect-4/5 rounded-xl overflow-hidden shadow-2xl group relative">
                <img
                  alt="Barber working"
                  className="w-full h-full object-cover filter grayscale group-hover:grayscale-0 transition-all duration-700"
                  src="/images/barber_working.webp"
                />
              </div>
            </div>

            {/* prawa strona */}
            <div className="lg:col-span-7 flex flex-col justify-center">
              <span className="text-primary font-label tracking-[0.3em] text-xs uppercase mb-4 block">
                NASZA FILOZOFIA
              </span>
              <h2 className="font-headline text-5xl md:text-6xl font-black mb-8 leading-[1.1] text-on-surface">
                Tworzymy coś <span className="text-primary italic font-black">więcej</span> niż tylko fryzurę.
              </h2>

              {/* akapit */}
              <div className="space-y-6 mb-12 border-l-2 border-primary/30 pl-6 md:pl-8">
                <p className="text-on-surface-variant font-body text-lg leading-relaxed">
                  Fresh Cut zrodziło się z chęci przedefiniowania rytuału pielęgnacji. Nie podążamy tylko za trendami, studiujemy architekturę twarzy i teksturę włosów, aby stworzyć wygląd, który jest unikalny dla Ciebie.
                </p>
                <p className="text-on-surface-variant font-body text-lg leading-relaxed">
                  Wierzymy, że wizyta u barbera to nie przykry obowiązek, ale rzadki moment wytchnienia od codziennego zgiełku. To przestrzeń, w której tradycyjne, stare rzemiosło bezbłędnie łączy się z tempem życia nowoczesnego dżentelmena.
                </p>
              </div>

              {/* grid kolumny */}
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

        {/* sekcja barberzy */}
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
                    <img
                      alt={`Barber ${barber.name}`}
                      className="w-full h-auto object-contain translate-y-22.5 transition-transform duration-500 group-hover:scale-105"
                      src={barber.imageUrl || "/images/placeholder.webp"}
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

        {/* sekcja opinie klientow */}
        <section className="py-32">
          <div className="px-8 md:px-20 text-center mb-20">
            <span className="text-primary font-label tracking-widest text-xs uppercase mb-4 block">OPINIE</span>
            <h2 className="font-headline text-5xl font-bold">Co mówią klienci</h2>
          </div>

          <div className="px-8 md:px-20 grid grid-cols-1 md:grid-cols-3 gap-12">
            {randomReviews.length > 0 ? (
              randomReviews.map((review) => (
                <div key={review.id} className="relative pt-12">
                  <Quote className="absolute top-0 left-0 w-12 h-12 text-primary/10 rotate-180" />
                  <p className="italic text-lg text-on-surface font-body leading-relaxed mb-8">
                    "{review.content}"
                  </p>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-surface-container-highest flex items-center justify-center border border-outline-variant/20 text-primary font-headline font-bold text-sm">
                      {review.author[0]}
                    </div>
                    <div>
                      <p className="font-headline font-bold mb-1">{review.author}</p>
                      <div className="flex gap-0.5 items-center">
                        {/* generowanie gwiazdek na podstawie oceny */}
                        {Array(Math.floor(review.rating)).fill(0).map((_, index) => (
                          <Star key={`full-${index}`} className="w-3.5 h-3.5 text-primary fill-primary" />
                        ))}
                        {review.rating % 1 >= 0.5 && (
                          <StarHalf className="w-3.5 h-3.5 text-primary fill-primary" />
                        )}
                        <span className="text-[10px] text-on-surface-variant ml-1 font-bold">
                          {review.rating.toFixed(1)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-1 md:col-span-3 text-center text-on-surface-variant text-sm italic py-8">
                Brak opinii do wyświetlenia. Dodaj kilka rekordów w bazie danych.
              </div>
            )}
          </div>
        </section>

        {/* sekcja cta (call to action) */}
        <section className="py-24 px-8 md:px-20">
          <div className="bg-primary rounded-2xl p-16 flex flex-col items-center text-center relative overflow-hidden">
            <div className="absolute inset-0 opacity-10 pointer-events-none">
              <img
                alt="Texture background"
                className="w-full h-full object-cover"
                src="/images/texture_bg.webp"
              />
            </div>
            <h2 className="font-headline text-on-primary text-5xl md:text-6xl font-black mb-8 relative z-10">Gotowy na transformację w Fresh Cut?</h2>
            <p className="text-on-primary/80 max-w-2xl mb-12 text-lg font-medium relative z-10">Liczba miejsc jest ograniczona. Nasi barberzy mają szybko zapełniające się kalendarze. Zarezerwuj swój czas na fotelu już dziś i doświadcz szczytu pielęgnacji.</p>
            <Link
              href={databaseUser ? "/dashboard" : "/login"}
              className="bg-background text-primary border border-primary/20 px-12 py-6 rounded-xl font-headline font-black text-xl tracking-widest hover:bg-[#1c1b1b] hover:scale-105 transition-all shadow-2xl relative z-10 text-center"
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