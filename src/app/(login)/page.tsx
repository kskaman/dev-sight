"use client";

import { GitHubIcon } from "@/components/icons";

import { useTransition } from "react";
import { DotLoader } from "@/components/ui/dot-loader";
import { login } from "../(auth)/actions";
import { Button } from "@/components/ui/button";

export default function Page() {
  const [pending, start] = useTransition();

  const handleSubmit = () => {
    start(() => login());
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="flex w-full flex-col gap-12">
        <div className="mx-auto flex max-w-[75%] flex-col items-center gap-2 text-center">
          <h3 className="text-xl font-semibold dark:text-zinc-50">
            Build a Portfolio that Recruiters love
          </h3>
          <p className="text-sm text-gray-500 dark:text-zinc-400">
            Analyze your profile and get personalized recommendations to improve
            your chances of getting hired.
          </p>
        </div>

        <Button
          onClick={handleSubmit}
          className="w-full flex justify-center 
            items-center cursor-pointer
            gap-2 px-4 py-2
            border rounded-md 
            max-w-[60%] md:max-w-[400px] mx-auto
            text-gray-800
            bg-white hover:bg-gray-100 active:bg-white"
        >
          {pending ? (
            <DotLoader />
          ) : (
            <>
              <GitHubIcon size={20} />
              Sign in with GitHub
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
