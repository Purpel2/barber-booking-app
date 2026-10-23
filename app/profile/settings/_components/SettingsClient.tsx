"use client";

import { useState, useTransition, useRef, useEffect } from "react";
import Image from "next/image";
import { motion } from "motion/react";
import {
    User,
    Mail,
    Phone,
    Lock,
    Bell,
    KeyRound,
    Upload,
    Check,
    Shield,
    Trash2,
    Loader2,
    Smartphone,
    QrCode,
    X,
    Radio,
} from "lucide-react";
import toast from "react-hot-toast";
import FavoriteBarberCard from "@/app/profile/_components/FavoriteBarberCard";
import {
    updateUserProfile,
    changeUserPassword,
    updateUserEmail,
    updateUserAvatar,
    deleteUserAccountAction,
} from "../../actions";

interface BarberOption {
    id: string;
    name: string;
    role: string | null;
    imageUrl: string;
}

const PHONE_PREFIXES = [
    { value: "+48", label: "+48 (PL)" },
    { value: "+44", label: "+44 (UK)" },
    { value: "+49", label: "+49 (DE)" },
    { value: "+420", label: "+420 (CZ)" },
    { value: "+380", label: "+380 (UA)" },
    { value: "+1", label: "+1 (US)" },
    { value: "+33", label: "+33 (FR)" },
    { value: "+34", label: "+34 (ES)" },
    { value: "+39", label: "+39 (IT)" },
    { value: "+31", label: "+31 (NL)" },
    { value: "+47", label: "+47 (NO)" },
    { value: "+43", label: "+43 (AT)" },
];



/**
 * Funkcja zwracająca początkową wartość preferencji z localStorage.
 * @param key - Klucz preferencji.
 * @param defaultValue - Domyślna wartość preferencji.
 * @returns - Początkowa wartość preferencji.
 */
function getInitialPref(key: string, defaultValue: boolean): boolean {
    if (typeof window === "undefined") return defaultValue;
    const saved = localStorage.getItem(key);
    return saved !== null ? saved === "true" : defaultValue;
}

interface SettingsClientProps {
    user: {
        id: string;
        firstName?: string | null;
        lastName?: string | null;
        fullName?: string | null;
        email: string;
        avatarUrl?: string | null;
        phonePrefix?: string | null;
        phoneBody?: string | null;
        createdAt: Date;
        favoriteBarberId?: string | null;
        favoriteBarber?: {
            id: string;
            name: string;
            role: string | null;
            imageUrl: string;
        } | null;
    };
    barbers: BarberOption[];
    isVip: boolean;
}

/**
 * Funkcja SettingsClient renderuje interfejs użytkownika dla ustawień konta w profilu użytkownika.
 * Umożliwia zarządzanie danymi osobowymi, bezpieczeństwem logowania, powiadomieniami oraz awatarem użytkownika. 
 * Obsługuje również weryfikację dwuetapową (2FA) i preferencje powiadomień.
 * @param user - Obiekt reprezentujący dane użytkownika.
 * @param barbers - Tablica opcji barberów.
 * @param isVip - Flaga wskazująca, czy użytkownik jest Vip.
 * @returns Zwraca element JSX reprezentujący interfejs ustawień konta.
 */
export default function SettingsClient({ user, barbers, isVip }: SettingsClientProps) {
    const [isPending, startTransition] = useTransition();

    const [avatarUrl, setAvatarUrl] = useState<string | null>(() => {
        if (user.avatarUrl) return user.avatarUrl;
        if (typeof window !== "undefined") {
            return localStorage.getItem(`avatar_${user.id}`);
        }
        return null;
    });

    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const handleAvatarFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith("image/")) {
            toast.error("Wybierz plik graficzny (JPG, PNG, WebP).");
            return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new window.Image();
            img.onload = () => {
                const canvas = document.createElement("canvas");
                const size = 300;
                canvas.width = size;
                canvas.height = size;
                const ctx = canvas.getContext("2d");
                if (!ctx) return;

                const minDim = Math.min(img.width, img.height);
                const startX = (img.width - minDim) / 2;
                const startY = (img.height - minDim) / 2;

                ctx.drawImage(img, startX, startY, minDim, minDim, 0, 0, size, size);

                const webpDataUrl = canvas.toDataURL("image/webp", 0.85);

                setAvatarUrl(webpDataUrl);
                if (typeof window !== "undefined") {
                    localStorage.setItem(`avatar_${user.id}`, webpDataUrl);
                }

                startTransition(async () => {
                    const res = await updateUserAvatar(webpDataUrl);
                    if (res.success) {
                        toast.success("Zdjęcie profilowe zostało zaktualizowane.", {
                            style: { background: "#1c1b1b", color: "#e9c176", border: "1px solid rgba(233, 193, 118, 0.25)" },
                            iconTheme: { primary: "#e9c176", secondary: "#1c1b1b" },
                        });
                    } else {
                        toast.error(res.message || "Błąd podczas zapisu avatara.");
                    }
                });
            };
            img.src = event.target?.result as string;
        };
        reader.readAsDataURL(file);
    };

    const handleRemoveAvatar = () => {
        setAvatarUrl(null);
        if (typeof window !== "undefined") {
            localStorage.removeItem(`avatar_${user.id}`);
        }
        startTransition(async () => {
            const res = await updateUserAvatar(null);
            if (res.success) {
                toast.success("Usunięto awatar profilowy.", {
                    style: { background: "#1c1b1b", color: "#e9c176", border: "1px solid rgba(233, 193, 118, 0.25)" },
                    iconTheme: { primary: "#e9c176", secondary: "#1c1b1b" },
                });
            } else {
                toast.error(res.message || "Błąd podczas usuwania avatara.");
            }
        });
    };

    const [deleteEvadeStep, setDeleteEvadeStep] = useState(0);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isDeletingAccount, setIsDeletingAccount] = useState(false);
    const lastEvadeTimeRef = useRef(0);

    const triggerEvadeStep = () => {
        const now = Date.now();
        if (now - lastEvadeTimeRef.current < 450) return;
        lastEvadeTimeRef.current = now;

        setDeleteEvadeStep((prev) => {
            if (prev < 4) return prev + 1;
            return prev;
        });
    };

    const handleConfirmDeleteAccount = async () => {
        setIsDeletingAccount(true);
        try {
            const res = await deleteUserAccountAction();
            if (res.success) {
                toast.success(res.message);
                window.location.href = "/";
            } else {
                toast.error(res.message);
                setIsDeletingAccount(false);
            }
        } catch {
            toast.error("Wystąpił nieoczekiwany błąd podczas usuwania konta.");
            setIsDeletingAccount(false);
        }
    };

    const [firstName, setFirstName] = useState(user.firstName || "");
    const [lastName, setLastName] = useState(user.lastName || "");
    const [phonePrefix, setPhonePrefix] = useState(user.phonePrefix || "+48");
    const [phoneBody, setPhoneBody] = useState(user.phoneBody || "");

    const handleSaveProfile = (e: React.FormEvent) => {
        e.preventDefault();
        startTransition(async () => {
            const res = await updateUserProfile({ firstName, lastName, phonePrefix, phoneBody });
            if (res.success) {
                toast.success(res.message, {
                    style: { background: "#1c1b1b", color: "#e9c176", border: "1px solid rgba(233, 193, 118, 0.25)" },
                    iconTheme: { primary: "#e9c176", secondary: "#1c1b1b" },
                });
            } else {
                toast.error(res.message || "Błąd podczas zapisu.");
            }
        });
    };

    const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
    const [newEmail, setNewEmail] = useState("");

    const handleSaveEmail = (e: React.FormEvent) => {
        e.preventDefault();
        startTransition(async () => {
            const res = await updateUserEmail(newEmail);
            if (res.success) {
                setIsEmailModalOpen(false);
                setNewEmail("");
                toast.success(res.message, {
                    style: { background: "#1c1b1b", color: "#e9c176", border: "1px solid rgba(233, 193, 118, 0.25)" },
                    iconTheme: { primary: "#e9c176", secondary: "#1c1b1b" },
                });
            } else {
                toast.error(res.message || "Błąd podczas zmiany e-maila.");
            }
        });
    };

    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const handleChangePassword = (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword.length < 6) {
            toast.error("Hasło musi mieć co najmniej 6 znaków.");
            return;
        }
        if (newPassword !== confirmPassword) {
            toast.error("Wprowadzone hasła nie są identyczne.");
            return;
        }

        startTransition(async () => {
            const res = await changeUserPassword(newPassword);
            if (res.success) {
                setNewPassword("");
                setConfirmPassword("");
                toast.success(res.message, {
                    style: { background: "#1c1b1b", color: "#e9c176", border: "1px solid rgba(233, 193, 118, 0.25)" },
                    iconTheme: { primary: "#e9c176", secondary: "#1c1b1b" },
                });
            } else {
                toast.error(res.message || "Błąd podczas zmiany hasła.");
            }
        });
    };

    const [is2FaEnabled, setIs2FaEnabled] = useState(() => {
        if (typeof window !== "undefined") {
            return localStorage.getItem(`2fa_${user.id}`) === "true";
        }
        return false;
    });
    const [is2FaModalOpen, setIs2FaModalOpen] = useState(false);
    const [totpCode, setTotpCode] = useState("");

    const handleEnable2Fa = (e: React.FormEvent) => {
        e.preventDefault();
        if (totpCode.replace(/\D/g, "").length !== 6) {
            toast.error("Wprowadź 6-cyfrowy kod z aplikacji uwierzytelniającej.");
            return;
        }

        setIs2FaEnabled(true);
        setIs2FaModalOpen(false);
        setTotpCode("");
        localStorage.setItem(`2fa_${user.id}`, "true");
        toast.success("Weryfikacja dwuetapowa (2FA) została aktywowana.", {
            style: { background: "#1c1b1b", color: "#e9c176", border: "1px solid rgba(233, 193, 118, 0.25)" },
            iconTheme: { primary: "#e9c176", secondary: "#1c1b1b" },
        });
    };

    const handleDisable2Fa = () => {
        setIs2FaEnabled(false);
        localStorage.removeItem(`2fa_${user.id}`);
        toast.success("Weryfikacja dwuetapowa została wyłączona.", {
            style: { background: "#1c1b1b", color: "#e9c176", border: "1px solid rgba(233, 193, 118, 0.25)" },
            iconTheme: { primary: "#e9c176", secondary: "#1c1b1b" },
        });
    };

    const [appAppointmentAlerts, setAppAppointmentAlerts] = useState(() =>
        getInitialPref("pref_app_appointments", true)
    );
    const [appSubscriptionAlerts, setAppSubscriptionAlerts] = useState(() =>
        getInitialPref("pref_app_subscriptions", true)
    );
    const [appAdminAnnouncements, setAppAdminAnnouncements] = useState(() =>
        getInitialPref("pref_app_announcements", true)
    );

    const [smsReminders, setSmsReminders] = useState(() =>
        getInitialPref("pref_sms_reminders", true)
    );

    const [emailConfirmations, setEmailConfirmations] = useState(() =>
        getInitialPref("pref_email_confirmations", true)
    );
    const [emailInvoices, setEmailInvoices] = useState(() =>
        getInitialPref("pref_email_invoices", true)
    );
    const [emailVipOffers, setEmailVipOffers] = useState(() =>
        getInitialPref("pref_email_vip_offers", false)
    );

    useEffect(() => {
        const syncPrefs = () => {
            setAppAppointmentAlerts(getInitialPref("pref_app_appointments", true));
            setAppSubscriptionAlerts(getInitialPref("pref_app_subscriptions", true));
            setAppAdminAnnouncements(getInitialPref("pref_app_announcements", true));
            setSmsReminders(getInitialPref("pref_sms_reminders", true));
            setEmailConfirmations(getInitialPref("pref_email_confirmations", true));
            setEmailInvoices(getInitialPref("pref_email_invoices", true));
            setEmailVipOffers(getInitialPref("pref_email_vip_offers", false));
        };

        window.addEventListener("notification_preferences_changed", syncPrefs);
        window.addEventListener("storage", syncPrefs);
        return () => {
            window.removeEventListener("notification_preferences_changed", syncPrefs);
            window.removeEventListener("storage", syncPrefs);
        };
    }, []);

    const togglePref = (key: string, current: boolean, setter: React.Dispatch<React.SetStateAction<boolean>>) => {
        const next = !current;
        setter(next);
        if (typeof window !== "undefined") {
            localStorage.setItem(key, String(next));
            window.dispatchEvent(new Event("notification_preferences_changed"));
        }
    };

    const initials = (firstName && lastName)
        ? `${firstName[0]}${lastName[0]}`.toUpperCase()
        : user.fullName
            ? user.fullName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
            : "FC";

    return (
        <div className="w-full space-y-8">
            <section className="pb-6 border-b border-surface-container-high/80">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-on-surface">
                            Ustawienia konta
                        </h1>
                        <p className="text-xs text-on-surface-variant mt-1">
                            Zarządzaj swoimi danymi kontaktowymi, bezpieczeństwem logowania oraz powiadomieniami.
                        </p>
                    </div>

                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-surface-container/60 border border-surface-container-high text-xs font-medium text-on-surface-variant self-start sm:self-center">
                        <Shield className="w-3.5 h-3.5 text-primary" />
                        <span>Konto zweryfikowane</span>
                    </div>
                </div>
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                <div className="lg:col-span-6 space-y-6">
                    <section className="bg-surface-container border border-surface-container-high rounded-2xl p-6 sm:p-7 shadow-xl space-y-6">
                        <div className="flex items-center justify-between pb-4 border-b border-surface-container-high/60">
                            <div>
                                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary block mb-1">
                                    Profil
                                </span>
                                <h2 className="font-headline font-bold text-lg text-on-surface">
                                    Dane osobowe
                                </h2>
                            </div>
                            <User className="w-5 h-5 text-on-surface-variant/40" />
                        </div>

                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 rounded-xl bg-surface-container/40 border border-surface-container-high/60">
                            <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-surface-container-high border border-outline-variant/30 flex items-center justify-center shrink-0 shadow-inner">
                                {avatarUrl ? (
                                    <Image
                                        src={avatarUrl}
                                        alt="Awatar użytkownika"
                                        fill
                                        className="object-cover"
                                        unoptimized
                                    />
                                ) : (
                                    <span className="font-headline font-black text-lg text-primary tracking-wider">
                                        {initials}
                                    </span>
                                )}
                            </div>

                            <div className="flex-1 min-w-0 space-y-1">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-bold text-on-surface truncate">
                                        {user.fullName || "Klient Salonu"}
                                    </span>
                                    {isVip && (
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/10 border border-primary/25 px-2 py-0.5 rounded-md">
                                            VIP
                                        </span>
                                    )}
                                </div>
                                <div className="text-xs text-on-surface-variant">
                                    <span>{user.email}</span>
                                </div>

                                <div className="flex items-center gap-3 pt-2">
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        onChange={handleAvatarFile}
                                        className="hidden"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="text-xs font-semibold text-primary hover:underline flex items-center gap-1.5 transition-colors cursor-pointer"
                                    >
                                        <Upload className="w-3.5 h-3.5" />
                                        <span>Zmień zdjęcie</span>
                                    </button>

                                    {avatarUrl && (
                                        <button
                                            type="button"
                                            onClick={handleRemoveAvatar}
                                            className="text-xs font-semibold text-on-surface-variant hover:text-red-400 flex items-center gap-1 transition-colors cursor-pointer"
                                        >
                                            <Trash2 className="w-3 h-3" />
                                            <span>Usuń</span>
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

                        <form onSubmit={handleSaveProfile} className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="block text-[11px] uppercase font-bold tracking-wider text-on-surface-variant">
                                        Imię
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={firstName}
                                        onChange={(e) => setFirstName(e.target.value)}
                                        className="w-full bg-surface-input border border-surface-container-high rounded-xl px-3.5 py-2.5 text-xs text-on-surface focus:outline-none focus:border-primary transition-colors"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="block text-[11px] uppercase font-bold tracking-wider text-on-surface-variant">
                                        Nazwisko
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={lastName}
                                        onChange={(e) => setLastName(e.target.value)}
                                        className="w-full bg-surface-input border border-surface-container-high rounded-xl px-3.5 py-2.5 text-xs text-on-surface focus:outline-none focus:border-primary transition-colors"
                                    />
                                </div>

                                <div className="sm:col-span-2 space-y-1.5">
                                    <label className="block text-[11px] uppercase font-bold tracking-wider text-on-surface-variant">
                                        Numer telefonu
                                    </label>
                                    <div className="flex gap-2.5">
                                        <select
                                            value={phonePrefix}
                                            onChange={(e) => setPhonePrefix(e.target.value)}
                                            className="bg-surface-input border border-surface-container-high rounded-xl px-3 py-2.5 text-xs text-on-surface focus:outline-none focus:border-primary transition-colors cursor-pointer font-medium shrink-0"
                                        >
                                            {PHONE_PREFIXES.map((p) => (
                                                <option key={p.value} value={p.value} className="bg-surface-container text-on-surface">
                                                    {p.label}
                                                </option>
                                            ))}
                                            {!PHONE_PREFIXES.some((p) => p.value === phonePrefix) && phonePrefix && (
                                                <option value={phonePrefix} className="bg-surface-container text-on-surface">
                                                    {phonePrefix}
                                                </option>
                                            )}
                                        </select>
                                        <div className="relative flex-1">
                                            <input
                                                type="tel"
                                                placeholder="np. 601 234 567"
                                                value={phoneBody}
                                                onChange={(e) => setPhoneBody(e.target.value)}
                                                className="w-full bg-surface-input border border-surface-container-high rounded-xl pl-3.5 pr-10 py-2.5 text-xs text-on-surface focus:outline-none focus:border-primary transition-colors"
                                            />
                                            <Phone className="absolute right-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-on-surface-variant/40 pointer-events-none" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-end pt-3 border-t border-surface-container-high/60">
                                <button
                                    type="submit"
                                    disabled={isPending}
                                    className="px-5 py-2.5 rounded-xl bg-primary text-background text-xs font-bold uppercase tracking-wider hover:bg-primary-hover transition-colors shadow-md shadow-primary/10 cursor-pointer disabled:opacity-50 flex items-center gap-2"
                                >
                                    {isPending ? (
                                        <>
                                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                            <span>Zapisywanie...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Check className="w-3.5 h-3.5" />
                                            <span>Zapisz dane</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </section>

                    <FavoriteBarberCard
                        favoriteBarber={user.favoriteBarber ?? null}
                        barbers={barbers}
                        className="w-full"
                    />
                </div>

                <div className="lg:col-span-6 space-y-6">
                    <section className="bg-surface-container border border-surface-container-high rounded-2xl p-6 sm:p-7 shadow-xl space-y-6">
                        <div className="flex items-center justify-between pb-4 border-b border-surface-container-high/60">
                            <div>
                                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary block mb-1">
                                    Dostęp i Logowanie
                                </span>
                                <h2 className="font-headline font-bold text-lg text-on-surface">
                                    Bezpieczeństwo konta
                                </h2>
                            </div>
                            <Lock className="w-5 h-5 text-on-surface-variant/40" />
                        </div>

                        <div className="p-4 rounded-xl bg-surface-container/40 border border-surface-container-high/60 flex items-center justify-between gap-4">
                            <div className="space-y-0.5 min-w-0">
                                <span className="text-xs font-bold text-on-surface block">
                                    Adres e-mail logowania
                                </span>
                                <span className="text-xs text-on-surface-variant truncate block font-mono">
                                    {user.email}
                                </span>
                            </div>

                            <button
                                type="button"
                                onClick={() => {
                                    setNewEmail("");
                                    setIsEmailModalOpen(true);
                                }}
                                className="px-3.5 py-2 rounded-xl bg-surface-container-high hover:bg-surface-bright border border-outline-variant/20 text-xs font-semibold text-on-surface hover:text-primary transition-all cursor-pointer shrink-0"
                            >
                                Zmień e-mail
                            </button>
                        </div>

                        <form onSubmit={handleChangePassword} className="space-y-3 pt-1">
                            <span className="text-xs font-bold text-on-surface block">
                                Zmiana hasła
                            </span>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <label className="block text-[10px] uppercase font-bold tracking-wider text-on-surface-variant">
                                        Nowe hasło
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="password"
                                            required
                                            placeholder="Min. 6 znaków"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            className="w-full bg-surface-input border border-surface-container-high rounded-xl px-3.5 py-2 text-xs text-on-surface focus:outline-none focus:border-primary transition-colors"
                                        />
                                        <KeyRound className="absolute right-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-on-surface-variant/40" />
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="block text-[10px] uppercase font-bold tracking-wider text-on-surface-variant">
                                        Powtórz nowe hasło
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="password"
                                            required
                                            placeholder="Powtórz hasło"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            className="w-full bg-surface-input border border-surface-container-high rounded-xl px-3.5 py-2 text-xs text-on-surface focus:outline-none focus:border-primary transition-colors"
                                        />
                                        <KeyRound className="absolute right-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-on-surface-variant/40" />
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end pt-1">
                                <button
                                    type="submit"
                                    disabled={isPending || !newPassword}
                                    className="px-4 py-2 rounded-xl bg-surface-container-high hover:bg-surface-bright border border-outline-variant/20 text-xs font-semibold text-on-surface hover:text-primary transition-colors cursor-pointer disabled:opacity-50"
                                >
                                    {isPending ? "Zapisywanie..." : "Zaktualizuj hasło"}
                                </button>
                            </div>
                        </form>

                        <div className="pt-4 border-t border-surface-container-high/60 flex items-center justify-between gap-4">
                            <div className="space-y-0.5">
                                <div className="flex items-center gap-2">
                                    <Smartphone className="w-4 h-4 text-primary shrink-0" />
                                    <span className="text-xs font-bold text-on-surface">
                                        Weryfikacja dwuetapowa (2FA)
                                    </span>
                                </div>
                                <p className="text-[11px] text-on-surface-variant leading-relaxed">
                                    Dodatkowa warstwa ochrony przy logowaniu (Google Authenticator / TOTP).
                                </p>
                            </div>

                            {is2FaEnabled ? (
                                <button
                                    type="button"
                                    onClick={handleDisable2Fa}
                                    className="px-3 py-1.5 rounded-xl bg-emerald-950/30 border border-emerald-500/30 text-emerald-400 hover:bg-red-950/30 hover:border-red-500/30 hover:text-red-300 text-xs font-semibold transition-colors shrink-0 cursor-pointer"
                                >
                                    Aktywna (wyłącz)
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    onClick={() => setIs2FaModalOpen(true)}
                                    className="px-3.5 py-2 rounded-xl bg-primary text-background text-xs font-bold uppercase tracking-wider hover:bg-primary-hover transition-colors shadow-md shadow-primary/10 shrink-0 cursor-pointer"
                                >
                                    Skonfiguruj 2FA
                                </button>
                            )}
                        </div>
                    </section>

                    <section id="notifications" className="bg-surface-container border border-surface-container-high rounded-2xl p-6 sm:p-7 shadow-xl space-y-6 scroll-mt-24">
                        <div className="flex items-center justify-between pb-4 border-b border-surface-container-high/60">
                            <div>
                                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary block mb-1">
                                    Powiadomienia
                                </span>
                                <h2 className="font-headline font-bold text-lg text-on-surface">
                                    Centrum powiadomień
                                </h2>
                            </div>
                            <Bell className="w-5 h-5 text-primary" />
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center gap-2">
                                <Radio className="w-3.5 h-3.5 text-primary animate-pulse" />
                                <span className="text-xs font-bold text-on-surface uppercase tracking-wider">
                                    Powiadomienia w aplikacji (Ikona Dzwonka w menu)
                                </span>
                            </div>

                            <div className="space-y-2.5 p-3.5 rounded-xl bg-surface-container/40 border border-surface-container-high/60 divide-y divide-surface-container-high/50">
                                <div className="flex items-center justify-between pt-0.5 first:pt-0">
                                    <div className="pr-3">
                                        <span className="text-xs font-semibold text-on-surface block">
                                            Przypomnienia o wizytach
                                        </span>
                                        <span className="text-[11px] text-on-surface-variant">
                                            Powiadomienie z godziną i barberem na 24h oraz 2h przed wizytą
                                        </span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => togglePref("pref_app_appointments", appAppointmentAlerts, setAppAppointmentAlerts)}
                                        className="cursor-pointer shrink-0"
                                    >
                                        <div className={`w-8 h-4 rounded-full p-0.5 transition-colors flex items-center ${appAppointmentAlerts ? "bg-primary" : "bg-neutral-600"}`}>
                                            <div className={`w-3 h-3 rounded-full bg-background transition-transform ${appAppointmentAlerts ? "translate-x-4" : "translate-x-0"}`} />
                                        </div>
                                    </button>
                                </div>

                                <div className="flex items-center justify-between pt-2.5">
                                    <div className="pr-3">
                                        <span className="text-xs font-semibold text-on-surface block">
                                            Status karnetu i subskrypcji VIP
                                        </span>
                                        <span className="text-[11px] text-on-surface-variant">
                                            Informacja o pobraniu comiesięcznej opłaty lub zbliżającym się wygaśnięciu
                                        </span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => togglePref("pref_app_subscriptions", appSubscriptionAlerts, setAppSubscriptionAlerts)}
                                        className="cursor-pointer shrink-0"
                                    >
                                        <div className={`w-8 h-4 rounded-full p-0.5 transition-colors flex items-center ${appSubscriptionAlerts ? "bg-primary" : "bg-neutral-600"}`}>
                                            <div className={`w-3 h-3 rounded-full bg-background transition-transform ${appSubscriptionAlerts ? "translate-x-4" : "translate-x-0"}`} />
                                        </div>
                                    </button>
                                </div>

                                <div className="flex items-center justify-between pt-2.5">
                                    <div className="pr-3">
                                        <span className="text-xs font-semibold text-on-surface block">
                                            Ogłoszenia salonu i wiadomości od mistrzów
                                        </span>
                                        <span className="text-[11px] text-on-surface-variant">
                                            Ważne komunikaty administratora oraz wiadomości bezpośrednie
                                        </span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => togglePref("pref_app_announcements", appAdminAnnouncements, setAppAdminAnnouncements)}
                                        className="cursor-pointer shrink-0"
                                    >
                                        <div className={`w-8 h-4 rounded-full p-0.5 transition-colors flex items-center ${appAdminAnnouncements ? "bg-primary" : "bg-neutral-600"}`}>
                                            <div className={`w-3 h-3 rounded-full bg-background transition-transform ${appAdminAnnouncements ? "translate-x-4" : "translate-x-0"}`} />
                                        </div>
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3 pt-2">
                            <span className="text-xs font-bold text-on-surface uppercase tracking-wider block">
                                Kanały zewnętrzne (SMS i E-mail)
                            </span>

                            <div className="space-y-2.5 p-3.5 rounded-xl bg-surface-container/40 border border-surface-container-high/60 divide-y divide-surface-container-high/50">
                                <div className="flex items-center justify-between pt-0.5 first:pt-0">
                                    <div className="pr-3">
                                        <span className="text-xs font-semibold text-on-surface block">
                                            Powiadomienia SMS
                                        </span>
                                        <span className="text-[11px] text-on-surface-variant">
                                            Szybki SMS z terminem i adresem salonu na 24h przed wizytą
                                        </span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => togglePref("pref_sms_reminders", smsReminders, setSmsReminders)}
                                        className="cursor-pointer shrink-0"
                                    >
                                        <div className={`w-8 h-4 rounded-full p-0.5 transition-colors flex items-center ${smsReminders ? "bg-primary" : "bg-neutral-600"}`}>
                                            <div className={`w-3 h-3 rounded-full bg-background transition-transform ${smsReminders ? "translate-x-4" : "translate-x-0"}`} />
                                        </div>
                                    </button>
                                </div>

                                <div className="flex items-center justify-between pt-2.5">
                                    <div className="pr-3">
                                        <span className="text-xs font-semibold text-on-surface block">
                                            E-mail z potwierdzeniem i plikiem kalendarza (.ics)
                                        </span>
                                        <span className="text-[11px] text-on-surface-variant">
                                            Błyskawiczne dodanie wizyty do Google Calendar i Apple Calendar
                                        </span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => togglePref("pref_email_confirmations", emailConfirmations, setEmailConfirmations)}
                                        className="cursor-pointer shrink-0"
                                    >
                                        <div className={`w-8 h-4 rounded-full p-0.5 transition-colors flex items-center ${emailConfirmations ? "bg-primary" : "bg-neutral-600"}`}>
                                            <div className={`w-3 h-3 rounded-full bg-background transition-transform ${emailConfirmations ? "translate-x-4" : "translate-x-0"}`} />
                                        </div>
                                    </button>
                                </div>

                                <div className="flex items-center justify-between pt-2.5">
                                    <div className="pr-3">
                                        <span className="text-xs font-semibold text-on-surface block">
                                            Elektroniczne rachunki i faktury
                                        </span>
                                        <span className="text-[11px] text-on-surface-variant">
                                            Wysyłka potwierdzeń płatności po każdej opłaconej usłudze
                                        </span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => togglePref("pref_email_invoices", emailInvoices, setEmailInvoices)}
                                        className="cursor-pointer shrink-0"
                                    >
                                        <div className={`w-8 h-4 rounded-full p-0.5 transition-colors flex items-center ${emailInvoices ? "bg-primary" : "bg-neutral-600"}`}>
                                            <div className={`w-3 h-3 rounded-full bg-background transition-transform ${emailInvoices ? "translate-x-4" : "translate-x-0"}`} />
                                        </div>
                                    </button>
                                </div>

                                <div className="flex items-center justify-between pt-2.5">
                                    <div className="pr-3">
                                        <span className="text-xs font-semibold text-on-surface block">
                                            Klubowy Biuletyn VIP
                                        </span>
                                        <span className="text-[11px] text-on-surface-variant">
                                            Wcześniejszy dostęp do terminów świątecznych i specjalne rabaty
                                        </span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => togglePref("pref_email_vip_offers", emailVipOffers, setEmailVipOffers)}
                                        className="cursor-pointer shrink-0"
                                    >
                                        <div className={`w-8 h-4 rounded-full p-0.5 transition-colors flex items-center ${emailVipOffers ? "bg-primary" : "bg-neutral-600"}`}>
                                            <div className={`w-3 h-3 rounded-full bg-background transition-transform ${emailVipOffers ? "translate-x-4" : "translate-x-0"}`} />
                                        </div>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            </div>

            {isEmailModalOpen && (
                <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
                    <div className="bg-surface-container-low border border-surface-container-high rounded-2xl max-w-md w-full p-6 text-on-surface shadow-2xl space-y-5 relative">
                        <div className="flex items-center justify-between pb-3 border-b border-surface-container-high/60">
                            <div className="flex items-center gap-2.5">
                                <Mail className="w-5 h-5 text-primary" />
                                <h3 className="font-headline font-bold text-base text-on-surface">
                                    Zmiana adresu e-mail
                                </h3>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsEmailModalOpen(false)}
                                className="text-on-surface-variant hover:text-on-surface p-1 rounded-lg transition-colors cursor-pointer"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <form onSubmit={handleSaveEmail} className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="block text-[11px] uppercase font-bold tracking-wider text-on-surface-variant">
                                    Dotychczasowy e-mail
                                </label>
                                <input
                                    type="email"
                                    disabled
                                    value={user.email}
                                    className="w-full bg-surface-container/30 border border-surface-container-high/60 rounded-xl px-3.5 py-2.5 text-xs text-on-surface-variant cursor-not-allowed opacity-80"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="block text-[11px] uppercase font-bold tracking-wider text-on-surface-variant">
                                    Nowy adres e-mail
                                </label>
                                <input
                                    type="email"
                                    required
                                    placeholder="np. nowy.email@example.com"
                                    value={newEmail}
                                    onChange={(e) => setNewEmail(e.target.value)}
                                    className="w-full bg-surface-input border border-surface-container-high rounded-xl px-3.5 py-2.5 text-xs text-on-surface focus:outline-none focus:border-primary"
                                />
                                <p className="text-[11px] text-on-surface-variant mt-1 leading-relaxed">
                                    Na nowy adres zostanie wysłana wiadomość z linkiem potwierdzającym zmianę adresu.
                                </p>
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-3 border-t border-surface-container-high/60">
                                <button
                                    type="button"
                                    onClick={() => setIsEmailModalOpen(false)}
                                    className="px-4 py-2.5 rounded-xl bg-surface-container-high text-xs font-semibold text-on-surface hover:bg-surface-bright transition-colors cursor-pointer"
                                >
                                    Anuluj
                                </button>
                                <button
                                    type="submit"
                                    disabled={isPending || !newEmail}
                                    className="px-5 py-2.5 rounded-xl bg-primary text-background text-xs font-bold uppercase tracking-wider hover:bg-primary-hover transition-colors cursor-pointer shadow-md shadow-primary/10 disabled:opacity-50"
                                >
                                    {isPending ? "Wysyłanie..." : "Zapisz i wyślij link"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {is2FaModalOpen && (
                <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
                    <div className="bg-surface-container-low border border-surface-container-high rounded-2xl max-w-md w-full p-6 text-on-surface shadow-2xl space-y-5 relative">
                        <div className="flex items-center justify-between pb-3 border-b border-surface-container-high/60">
                            <div className="flex items-center gap-2.5">
                                <Smartphone className="w-5 h-5 text-primary" />
                                <h3 className="font-headline font-bold text-base text-on-surface">
                                    Weryfikacja dwuetapowa (2FA) (TESTOWA)
                                </h3>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIs2FaModalOpen(false)}
                                className="text-on-surface-variant hover:text-on-surface p-1 rounded-lg transition-colors cursor-pointer"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <form onSubmit={handleEnable2Fa} className="space-y-4 text-xs">
                            <p className="text-on-surface-variant leading-relaxed">
                                Zeskanuj poniższy kod w aplikacji uwierzytelniającej (Google Authenticator, Authy, 1Password) lub przepisz klucz konfiguracyjny.
                            </p>

                            <div className="flex flex-col items-center justify-center p-5 rounded-xl bg-white text-black text-center space-y-2">
                                <QrCode className="w-36 h-36" />
                                <span className="font-mono text-[11px] font-bold tracking-wider text-black/80 select-all">
                                    FRESH-CUT-7X9K-8821
                                </span>
                            </div>

                            <div className="space-y-1.5 pt-1">
                                <label className="block text-[11px] uppercase font-bold tracking-wider text-on-surface-variant">
                                    Wprowadź 6-cyfrowy kod z aplikacji
                                </label>
                                <input
                                    type="text"
                                    required
                                    maxLength={6}
                                    placeholder="000 000"
                                    value={totpCode}
                                    onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                                    className="w-full bg-surface-input border border-surface-container-high rounded-xl px-3.5 py-2.5 text-center text-sm font-mono tracking-widest text-primary focus:outline-none focus:border-primary"
                                />
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-3 border-t border-surface-container-high/60">
                                <button
                                    type="button"
                                    onClick={() => setIs2FaModalOpen(false)}
                                    className="px-4 py-2.5 rounded-xl bg-surface-container-high text-xs font-semibold text-on-surface hover:bg-surface-bright transition-colors cursor-pointer"
                                >
                                    Anuluj
                                </button>
                                <button
                                    type="submit"
                                    disabled={totpCode.length !== 6}
                                    className="px-5 py-2.5 rounded-xl bg-primary text-background text-xs font-bold uppercase tracking-wider hover:bg-primary-hover transition-colors cursor-pointer shadow-md shadow-primary/10 disabled:opacity-50"
                                >
                                    Włącz 2FA
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {isDeleteModalOpen && (
                <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-surface-container-low border border-red-900/40 rounded-2xl max-w-md w-full p-6 text-on-surface shadow-2xl space-y-5 relative">
                        <div className="flex items-center justify-between pb-3 border-b border-surface-container-high/60">
                            <div className="flex items-center gap-2.5 text-red-400">
                                <Trash2 className="w-5 h-5" />
                                <h3 className="font-headline font-bold text-base text-on-surface">
                                    Potwierdzenie usunięcia konta
                                </h3>
                            </div>
                            <button
                                type="button"
                                disabled={isDeletingAccount}
                                onClick={() => setIsDeleteModalOpen(false)}
                                className="text-on-surface-variant hover:text-on-surface p-1 rounded-lg transition-colors cursor-pointer"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="space-y-3 text-xs leading-relaxed text-on-surface-variant">
                            <p className="text-on-surface font-semibold">
                                Czy na pewno chcesz trwale usunąć swoje konto?
                            </p>
                            <p>
                                Ta operacja jest <strong className="text-red-400">nieodwracalna</strong>. Twoje dane profilowe, historia rezerwacji, opinie oraz aktywna subskrypcja zostaną bezpowrotnie usunięte z systemu Fresh Cut.
                            </p>
                        </div>

                        <div className="flex items-center justify-end gap-3 pt-3 border-t border-surface-container-high/60">
                            <button
                                type="button"
                                disabled={isDeletingAccount}
                                onClick={() => setIsDeleteModalOpen(false)}
                                className="px-4 py-2.5 rounded-xl bg-surface-container-high text-xs font-semibold text-on-surface hover:bg-surface-bright transition-colors cursor-pointer disabled:opacity-50"
                            >
                                Anuluj
                            </button>
                            <button
                                type="button"
                                disabled={isDeletingAccount}
                                onClick={handleConfirmDeleteAccount}
                                className="px-5 py-2.5 rounded-xl bg-red-950/60 hover:bg-red-900/80 text-red-200 border border-red-800/60 hover:border-red-600 transition-colors cursor-pointer shadow-md shadow-red-950/40 flex items-center gap-2 disabled:opacity-50 text-xs font-bold uppercase tracking-wider"
                            >
                                {isDeletingAccount ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin text-red-400" />
                                        <span>Usuwanie konta...</span>
                                    </>
                                ) : (
                                    <>
                                        <Trash2 className="w-4 h-4 text-red-400" />
                                        <span>Tak, usuń konto na stałe</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <section className="pt-6 border-t border-surface-container-high/60">
                <div className="relative w-full h-10 overflow-hidden select-none">
                    <motion.button
                        type="button"
                        onPointerEnter={(e) => {
                            if (e.pointerType === "touch") return;
                            if (deleteEvadeStep < 4) {
                                triggerEvadeStep();
                            }
                        }}
                        onClick={(e) => {
                            if (deleteEvadeStep < 4) {
                                e.preventDefault();
                                triggerEvadeStep();
                                return;
                            }
                            setIsDeleteModalOpen(true);
                        }}
                        animate={{
                            left:
                                deleteEvadeStep === 0
                                    ? "100%"
                                    : deleteEvadeStep === 1
                                        ? "50%"
                                        : deleteEvadeStep === 2
                                            ? "0%"
                                            : deleteEvadeStep === 3
                                                ? "50%"
                                                : "100%",
                            x:
                                deleteEvadeStep === 0
                                    ? "-100%"
                                    : deleteEvadeStep === 1
                                        ? "-50%"
                                        : deleteEvadeStep === 2
                                            ? "0%"
                                            : deleteEvadeStep === 3
                                                ? "-50%"
                                                : "-100%",
                        }}
                        transition={{
                            duration: 0.75,
                            ease: [0.25, 1, 0.5, 1],
                        }}
                        className={`absolute top-0 h-10 whitespace-nowrap flex items-center justify-center gap-2 px-5 rounded-xl text-xs font-bold uppercase tracking-wider cursor-pointer border transition-colors ${deleteEvadeStep === 4
                                ? "bg-red-950/40 hover:bg-red-900/50 text-red-300 border-red-800/80 hover:border-red-500/80 shadow-md shadow-red-950/40 active:scale-95"
                                : "bg-red-950/20 hover:bg-red-950/35 text-red-400 hover:text-red-300 border-red-900/40 hover:border-red-700/60 shadow-sm"
                            }`}
                    >
                        <Trash2 className="w-4 h-4 text-red-400" />
                        <span>Usuń konto</span>
                    </motion.button>
                </div>
            </section>
        </div>
    );
}
