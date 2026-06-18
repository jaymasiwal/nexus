"use client";

import { useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { useRouter } from "next/navigation";

export default function AuthPage() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"email" | "otp">("email");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  );

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithOtp({ email });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setStep("otp");
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.verifyOtp({
      email,
      token: otp,
      type: "email"
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push("/");
      router.refresh();
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-black text-white px-4">
      <div className="w-full max-w-md space-y-8 bg-zinc-900 p-8 rounded-xl border border-zinc-800">
        <div>
          <h2 className="text-center text-3xl font-bold tracking-tight text-white">
            Access Nexus
          </h2>
          <p className="mt-2 text-center text-sm text-zinc-400">
            {step === "email" ? "Enter your email to receive a 6-digit code" : "Enter the 6-digit code sent to your email"}
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-500 text-sm p-3 rounded-lg text-center">
            {error}
          </div>
        )}

        {step === "email" ? (
          <form className="mt-8 space-y-6" onSubmit={handleSendOtp}>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Email address
              </label>
              <input
                type="email"
                required
                className="mt-1 block w-full rounded-lg bg-zinc-800 border border-zinc-700 px-3 py-2 text-white placeholder-zinc-500 focus:border-blue-500 focus:outline-none text-sm"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={loading || !email}
              className="group relative flex w-full justify-center rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-500 disabled:opacity-50 transition"
            >
              {loading ? "Sending Code..." : "Send OTP"}
            </button>
          </form>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleVerifyOtp}>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">6-Digit Code</label>
              <input
                type="text"
                required
                className="mt-1 block w-full rounded-lg bg-zinc-800 border border-zinc-700 px-3 py-2 text-white placeholder-zinc-500 focus:border-blue-500 focus:outline-none text-sm tracking-widest text-center text-lg"
                placeholder="123456"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={loading || otp.length < 6}
              className="group relative flex w-full justify-center rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-500 disabled:opacity-50 transition"
            >
              {loading ? "Verifying..." : "Verify & Login"}
            </button>
            
            <button
              type="button"
              onClick={() => setStep("email")}
              className="w-full text-center text-sm text-zinc-400 hover:text-white transition"
            >
              Back
            </button>
          </form>
        )}
      </div>
    </div>
  );
}