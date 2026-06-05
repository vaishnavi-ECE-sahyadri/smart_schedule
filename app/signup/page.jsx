"use client";

import { useState, useEffect, useTransition, Suspense } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

const AUTH_ERRORS = {
  OAuthSignin: "Error starting Google sign-in. Please try again.",
  OAuthCallback: "Error during Google sign-in callback. Please try again.",
  OAuthCreateAccount: "Could not create account with Google. Please try again.",
  EmailCreateAccount: "Could not create account. Please try again.",
  Callback: "Sign-in callback error. Please try again.",
  OAuthAccountNotLinked: "This email is already linked to a different sign-in method.",
  SessionRequired: "Please sign in to access this page.",
  Default: "An unexpected error occurred. Please try again.",
};

const styles = `
  @keyframes float {
    0%   { transform: translateY(0px)   rotate(-2deg); }
    50%  { transform: translateY(-14px) rotate(2deg);  }
    100% { transform: translateY(0px)   rotate(-2deg); }
  }
  @keyframes iconGlow {
    0%   { box-shadow: 0 8px 32px rgba(74,93,58,0.25); }
    50%  { box-shadow: 0 20px 48px rgba(74,93,58,0.45); }
    100% { box-shadow: 0 8px 32px rgba(74,93,58,0.25); }
  }
  @keyframes pulseRing {
    0%   { transform: scale(1);    opacity: 0.5; }
    100% { transform: scale(1.65); opacity: 0;   }
  }
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(22px); }
    to   { opacity: 1; transform: translateY(0);    }
  }
  .icon-float  { animation: float 3.6s ease-in-out infinite, iconGlow 3.6s ease-in-out infinite; }
  .pulse-ring  { animation: pulseRing 2.2s ease-out infinite; }
  .pulse-ring2 { animation: pulseRing 2.2s ease-out 1.1s infinite; }
  .fade-up-1   { animation: fadeUp 0.55s ease both 0.05s; }
  .fade-up-2   { animation: fadeUp 0.55s ease both 0.2s;  }
  .fade-up-3   { animation: fadeUp 0.55s ease both 0.35s; }
`;

function BookmarkIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" width="40" height="40">
      <path
        d="M6 4C6 3.44772 6.44772 3 7 3H17C17.5523 3 18 3.44772 18 4V20.382C18 20.7607 17.5785 20.9926 17.2764 20.7764L12 17.118L6.72361 20.7764C6.42148 20.9926 6 20.7607 6 20.382V4Z"
        fill="white"
        fillOpacity="0.95"
      />
    </svg>
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
}

function LoaderIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" className="animate-spin">
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}

function AlertCircleIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}

function LoginPageInner() {
  const { status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();
  const [isLoading, setIsLoading] = useState(false);


  const errorKey = searchParams.get("error");
  const errorMsg = errorKey ? (AUTH_ERRORS[errorKey] ?? AUTH_ERRORS.Default) : null;


  useEffect(() => {
    if (status === "authenticated") {
      startTransition(() => {
        router.replace("/");
      });
    }
  }, [status, router]);

  async function handleGoogleSignIn() {
    try {
      setIsLoading(true);
      await signIn("google", { callbackUrl: "/" });
    } catch {
      setIsLoading(false);
    }
  }

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f8f6f0]">
        <LoaderIcon />
      </div>
    );
  }

  return (
    <>
      <style>{styles}</style>

      <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-[#f8f6f0] via-[#eeeade] to-[#f5f3ee] px-4">


        <div className="absolute left-8 top-7 flex items-center gap-2.5">
          <div className="h-6 w-1 rounded-full bg-[#b89a3e]" />
          <span className="font-serif text-lg font-bold tracking-tight text-foreground">
            SignUp Page
          </span>
        </div>


        <div className="fade-up-1 relative mb-7">
          <span className="pulse-ring pointer-events-none absolute inset-[-10px] rounded-[26px] border-2 border-[rgba(74,93,58,0.3)]" />
          <span className="pulse-ring2 pointer-events-none absolute inset-[-10px] rounded-[26px] border-2 border-[rgba(74,93,58,0.18)]" />
          <div
            className="icon-float relative flex h-[88px] w-[88px] items-center justify-center rounded-[22px]"
            style={{ background: "linear-gradient(145deg,#5c6e47 0%,#3d4f2e 60%,#2e3d22 100%)" }}
          >
            <span
              className="pointer-events-none absolute inset-0 rounded-[22px]"
              style={{ background: "linear-gradient(to bottom, rgba(255,255,255,0.18) 0%, transparent 55%)" }}
            />
            <BookmarkIcon />
          </div>
        </div>


        <div className="fade-up-2 mb-8 text-center">
          <h1 className="mb-2 font-serif text-[42px] font-extrabold tracking-tight text-foreground">
            Smart Bookmark
          </h1>
          <p className="text-[15px] text-muted-foreground">
            Your personal reading list, organized and synced
          </p>
        </div>


        <div className="fade-up-3 w-full max-w-[420px]">
          <Card className="border border-white/80 bg-white/85 shadow-xl backdrop-blur-md">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-center gap-2">
                <CardTitle className="font-serif justify-center items-center text-xl">Welcome</CardTitle>
              </div>
              <CardDescription>
                Sign in with your Google account to continue
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              {errorMsg && (
                <Alert variant="destructive" className="py-3">
                  <AlertCircleIcon />
                  <AlertDescription className="ml-2 text-sm">{errorMsg}</AlertDescription>
                </Alert>
              )}

              <Button
                variant="outline"
                className="h-12 w-full gap-2 border-[#e0dbd2] bg-white text-sm font-medium shadow-sm transition-all hover:border-[#c8bfa8] hover:bg-[#f9f6f1] hover:shadow-md active:scale-[0.98]"
                onClick={handleGoogleSignIn}
                disabled={isLoading}
              >
                {isLoading
                  ? <><LoaderIcon /> Signing in...</>
                  : <><GoogleIcon /> Continue with Google</>
                }
              </Button>

              <Separator className="bg-[#ede9e1]" />
            </CardContent>

            <CardFooter className="flex-col gap-2 pt-0">
              <p className="text-center text-xs text-muted-foreground">
                By continuing, you agree to our{" "}
                <a href="/terms" className="underline underline-offset-2 hover:text-foreground">Terms of Service</a>{" "}
                and{" "}
                <a href="/privacy" className="underline underline-offset-2 hover:text-foreground">Privacy Policy</a>.
              </p>
            </CardFooter>
          </Card>
        </div>

        <p className="fade-up-3 mt-6 text-xs text-muted-foreground">Thank you for visiting</p>
      </div>
    </>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#f8f6f0]">
          <LoaderIcon />
        </div>
      }
    >
      <LoginPageInner />
    </Suspense>
  );
}