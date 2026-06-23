"use client";
import { useState } from "react";
import { Eye, EyeOff, ArrowRight } from "lucide-react";
import { registerUser } from "../actions/auth";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function RegisterPage() {
    //pokazywanie/ukrywanie hasla
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const router = useRouter();
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    async function handleSubmit(formData: FormData) {
        setError(null);
        const loadingToast = toast.loading("Tworzenie profilu...");

        const result = await registerUser(formData);
        toast.dismiss(loadingToast);

        if (result?.error) {
            setError(result.error);
            toast.error("Nie udało się utworzyć konta.");
        } else if (result?.success) {
            toast.success("Konto utworzone pomyślnie! Witamy w klubie.", {
                duration: 5000,
                style: {
                    background: "#2a2a2a",
                    color: "#e9c176",
                    border: "1px solid rgba(233, 193, 118, 0.2)",
                },
                iconTheme: {
                    primary: "#e9c176",
                    secondary: "#2a2a2a",
                },
            });
            router.push("/login");
        }
    }

    return (

        //glowny kontener
        <div className="bg-background text-on-background font-body min-h-screen relative overflow-y-auto">

            {/* photo background */}
            <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
                <img
                    alt="register background"
                    className="w-full h-full object-cover grayscale"
                    src="/images/register_bg.webp"
                />
                {/* gradient */}
                <div className="absolute inset-0 bg-linear-to-b from-background via-transparent to-background"></div>
            </div>

            <main className="relative z-10 min-h-screen flex items-center justify-center px-6 py-24">
                <div className="glass-panel w-full max-w-xl p-8 md:p-12 rounded-xl border border-outline-variant/10 shadow-2xl">

                    <div className="mb-10 text-center md:text-left">
                        <span className="font-label text-xs tracking-[0.2em] text-primary uppercase mb-2 block">Rejestracja</span>
                        <h1 className="font-headline text-4xl md:text-5xl font-bold tracking-tight text-on-background mb-4">
                            Dołącz do <span className="text-primary italic">Fresh Cut</span>
                        </h1>
                        <p className="text-on-surface-variant max-w-sm leading-relaxed mx-auto md:mx-0">Doświadcz precyzyjnej pielęgnacji dostosowanej do Twojego wyjątkowego charakteru. Twoja podróż zaczyna się tutaj.</p>
                    </div>
                    {/* formularz */}
                    {error && (
                        <div className="mb-6 p-4 bg-red-900/50 border border-red-500/30 rounded-lg text-sm text-red-200">
                            {error}
                        </div>
                    )}
                    <form className="space-y-6" action={handleSubmit}>

                        {/* imie i nazwisko */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex flex-col gap-1.5">
                                <label className="font-label text-[10px] uppercase tracking-[0.15em] text-on-surface-variant ml-1">Imię</label>
                                <input
                                    type="text"
                                    name="firstName"
                                    required
                                    placeholder="Dawid"
                                    className="w-full bg-surface-container-highest border-none rounded-lg px-4 py-3 text-sm focus:ring-1 focus:ring-primary placeholder:text-on-surface-variant/20 transition-all font-medium tracking-wider text-white"
                                />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="font-label text-[10px] uppercase tracking-[0.15em] text-on-surface-variant ml-1">Nazwisko</label>
                                <input
                                    type="text"
                                    name="lastName"
                                    required
                                    placeholder="Staniaszek"
                                    className="w-full bg-surface-container-highest border-none rounded-lg px-4 py-3 text-sm focus:ring-1 focus:ring-primary placeholder:text-on-surface-variant/20 transition-all font-medium tracking-wider text-white"
                                />
                            </div>
                        </div>
                        {/* {numer teleofnu} */}
                        <div className="flex flex-col gap-1.5">
                            <label className="font-label text-[10px] uppercase tracking-[0.15em] text-on-surface-variant ml-1">
                                Numer Telefonu
                            </label>
                            <div className="flex gap-2">
                                {/* wybor numeru kierunkowego */}
                                <select
                                    name="phonePrefix"
                                    defaultValue="+48"
                                    className="bg-surface-container-highest border-none rounded-lg px-3 py-3 text-sm focus:ring-1 focus:ring-primary text-white cursor-pointer font-medium"
                                >
                                    <option value="+48" className="bg-[#1a1a1a] text-white">+48 (PL)</option>
                                    <option value="+44" className="bg-[#1a1a1a] text-white">+44 (UK)</option>
                                    <option value="+49" className="bg-[#1a1a1a] text-white">+49 (DE)</option>
                                    <option value="+420" className="bg-[#1a1a1a] text-white">+420 (CZ)</option>
                                    <option value="+1" className="bg-[#1a1a1a] text-white">+1 (US)</option>
                                </select>

                                {/* input numer telefonu */}
                                <input
                                    type="tel"
                                    name="phoneBody"
                                    required
                                    pattern="[0-9]{9,15}"
                                    title="Wpisz poprawny numer telefonu (same cyfry)"
                                    placeholder="123456789"
                                    className="w-full bg-surface-container-highest border-none rounded-lg px-4 py-3 text-sm focus:ring-1 focus:ring-primary placeholder:text-on-surface/20 transition-all text-white"
                                />
                            </div>
                        </div>
                        {/* email */}
                        <div className="flex flex-col gap-1.5">
                            <label className="font-label text-[10px] uppercase tracking-[0.15em] text-on-surface-variant ml-1">
                                Adres E-mail
                            </label>
                            <input
                                name="email"
                                type="email"
                                required
                                placeholder="adres@domena.com"
                                className="w-full bg-surface-container-highest border-none rounded-lg px-4 py-3 text-sm focus:ring-1 focus:ring-primary placeholder:text-on-surface/20 transition-all text-white"
                            />
                        </div>

                        {/* hasło*/}


                        <div className="flex flex-col gap-1.5">
                            <label className="font-label text-[10px] uppercase tracking-[0.15em] text-on-surface-variant ml-1">
                                Hasło
                            </label>
                            <div className="relative">
                                <input
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    required
                                    placeholder="••••••••••••"
                                    className="w-full bg-surface-container-highest border-none rounded-lg px-4 py-3 text-sm focus:ring-1 focus:ring-primary placeholder:text-on-surface/20 transition-all text-white pr-12"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface/40 hover:text-white cursor-pointer select-none"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        {/* Ppotwierdzenie hasla*/}
                        <div className="flex flex-col gap-1.5">
                            <label className="font-label text-[10px] uppercase tracking-[0.15em] text-on-surface-variant ml-1">
                                Potwierdź Hasło
                            </label>
                            <div className="relative">
                                <input
                                    name="confirmPassword"
                                    type={showConfirmPassword ? "text" : "password"}
                                    required
                                    placeholder="••••••••••••"
                                    className="w-full bg-surface-container-highest border-none rounded-lg px-4 py-3 text-sm focus:ring-1 focus:ring-primary placeholder:text-on-surface/20 transition-all text-white pr-12"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface/40 hover:text-white cursor-pointer select-none"
                                >
                                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>


                        {/* button submit */}
                        <div className="pt-4">
                            <button
                                type="submit"
                                className="w-full bg-primary text-on-primary font-label font-bold text-xs uppercase tracking-[0.2em] py-4 rounded-lg hover:bg-primary/90 active:scale-[0.98] transition-all cursor-pointer shadow-lg shadow-primary/10 flex items-center justify-center gap-2"
                            >
                                Utwórz konto
                                <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>


                    </form>
                    <div className="mt-8 text-center">
                        <p className="text-on-surface-variant font-body text-sm">
                            Masz już konto?{" "}
                            <Link className="text-primary font-bold ml-1 hover:underline underline-offset-4 decoration-primary/30 transition-all" href="/login">
                                Zaloguj się
                            </Link>
                        </p>
                    </div>
                </div>
            </main>

        </div>
    )
}