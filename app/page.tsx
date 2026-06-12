import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import { prisma } from "@/lib/prisma";
import { Scissors, Flower2, Star, StarHalf, Quote } from "lucide-react";
import { Barber } from "@prisma/client";

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
            <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent z-10"></div>
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
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-secondary to-primary">Doświadczenie</span> <br />
              Barberskie
            </h1>
            <p className="text-on-surface-variant text-xl max-w-xl mb-12 font-body leading-relaxed">Precyzja, dziedzictwo i sztuka pielęgnacji. Wejdź do przestrzeni, w której klasyczne techniki spotykają się z nowoczesną estetyką redakcyjną.</p>
            <div className="flex flex-col sm:flex-row gap-6">
              <Link href={databaseUser ? "/dashboard" : "/login"} className="bg-primary text-on-primary px-10 py-5 rounded-lg font-headline font-extrabold tracking-widest text-base hover:scale-105 transition-transform text-center">
                UMÓW WIZYTĘ
              </Link>
              <button className="border border-outline-variant/30 text-on-surface px-10 py-5 rounded-lg font-headline font-bold tracking-widest text-base hover:bg-surface-container-high transition-colors">
                ZOBACZ USŁUGI
              </button>
            </div>
          </div>
        </section>

        {/* sekcja o nas */}
        <section className="py-32 px-8 md:px-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
            <div className="lg:col-span-7 relative">
              <div className="aspect-[4/5] rounded-xl overflow-hidden shadow-2xl">
                <img
                  alt="Barber working"
                  className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700"
                  src="/images/barber_working.webp"
                />
              </div>
            </div>
            <div className="lg:col-span-5 lg:pl-12">
              <span className="text-secondary font-label tracking-widest text-xs uppercase mb-4 block">NASZA FILOZOFIA</span>
              <h2 className="font-headline text-5xl font-bold mb-8 leading-tight">Tworzymy coś więcej niż tylko fryzurę.</h2>
              <p className="text-on-surface-variant font-body text-lg leading-relaxed mb-8">Fresh Cut zrodziło się z chęci przedefiniowania rytuału pielęgnacji. Nie podążamy tylko za trendami; studiujemy architekturę twarzy i teksturę włosów, aby stworzyć wygląd, który jest unikalny dla Ciebie.</p>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <Scissors className="text-primary w-6 h-6 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-headline font-bold text-lg">Inżynieria Precyzji</h4>
                    <p className="text-on-surface-variant text-sm">Każde cięcie wykonywane jest z chirurgiczną precyzją i artystycznym wyczuciem.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <Flower2 className="text-primary w-6 h-6 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-headline font-bold text-lg">Zmysłowe Rytuały</h4>
                    <p className="text-on-surface-variant text-sm">Sygnowane golenie gorącym ręcznikiem przy użyciu rzemieślniczych olejków i ekstraktów roślinnych.</p>
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
                  <div className="aspect-[16/9] overflow-hidden bg-black flex items-center justify-center">
                    <img
                      alt={`Barber ${barber.name}`}
                      className="w-[100%] h-auto object-contain translate-y-[90px] transition-transform duration-500 group-hover:scale-105"
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

        {/* sekcja CTA (call to action) */}
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
            <Link href={databaseUser ? "/dashboard" : "/login"} className="bg-primary-container text-on-primary-container px-12 py-6 rounded-xl font-headline font-black text-xl tracking-widest hover:scale-105 transition-all shadow-2xl relative z-10 text-center">
              UMÓW WIZYTĘ
            </Link>
          </div>
        </section>
      </main>

      <footer className="w-full py-12 px-8 mt-24 bg-[#131313]">
        <div className="flex flex-col md:flex-row justify-between items-center border-t border-primary/10 pt-8">
          <div className="font-inter text-xs tracking-[0.2em] uppercase text-on-surface/40 mb-8 md:mb-0">© 2026 Fresh Cut. WSZELKIE PRAWA ZASTRZEŻONE.</div>
          <div className="flex gap-8 mb-8 md:mb-0">
            <Link className="font-inter text-xs tracking-[0.2em] uppercase text-on-surface/40 hover:text-primary transition-colors" href="#">PRYWATNOŚĆ</Link>
            <Link className="font-inter text-xs tracking-[0.2em] uppercase text-on-surface/40 hover:text-primary transition-colors" href="#">WARUNKI</Link>
            <Link className="font-inter text-xs tracking-[0.2em] uppercase text-on-surface/40 hover:text-primary transition-colors" href="#">KARIERA</Link>
            <Link className="font-inter text-xs tracking-[0.2em] uppercase text-on-surface/40 hover:text-primary transition-colors" href="#">LOKALIZACJE</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}