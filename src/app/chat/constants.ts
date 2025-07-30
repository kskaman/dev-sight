import { Message } from "ai";
import { nanoid } from "nanoid";

export const WELCOME_MSG: Message = {
  id: nanoid(), // any unique id is fine
  role: "assistant" as const,
  content:
    "Welcome! I can review your developer portfolio to help boost your chances of getting your first job. Where would you like to start - LinkedIn, GitHub, or your résumé?",
};
