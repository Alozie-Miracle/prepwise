import { interviewCovers, mappings } from "@/constants";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

interface SavedMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const techIconBaseURL = "https://cdn.jsdelivr.net/gh/devicons/devicon/icons";

const normalizeTechName = (tech: string) => {
  const key = tech.toLowerCase().replace(/\.js$/, "").replace(/\s+/g, "");
  return mappings[key as keyof typeof mappings];
};

const checkIconExists = async (url: string) => {
  try {
    const response = await fetch(url, { method: "HEAD" });
    return response.ok; // Returns true if the icon exists
  } catch {
    return false;
  }
};

export const getTechLogos = async (techArray: string[]) => {
  const logoURLs = techArray.map((tech) => {
    const normalized = normalizeTechName(tech);
    return {
      tech,
      url: `${techIconBaseURL}/${normalized}/${normalized}-original.svg`,
    };
  });

  const results = await Promise.all(
    logoURLs.map(async ({ tech, url }) => ({
      tech,
      url: (await checkIconExists(url)) ? url : "/tech.svg",
    }))
  );

  return results;
};

export const getRandomInterviewCover = () => {
  const randomIndex = Math.floor(Math.random() * interviewCovers.length);
  return `/covers${interviewCovers[randomIndex]}`;
};

export const extractInterviewInfo = (messages: SavedMessage[]) => {
  const data: {
    role?: string;
    type?: string;
    level?: string;
    amount?: string;
    techstack?: string;
  } = {};

  messages.forEach((msg) => {
    const text = msg.content.toLowerCase();

    if (!data.role && text.includes("role")) {
      data.role = text.match(/role(?:\:|\s+is)?\s+([a-zA-Z\s]+)/)?.[1]?.trim();
    }

    if (!data.type && text.includes("type")) {
      data.type = text.match(
        /type(?:\:|\s+is)?\s+(technical|behavioral|mixed)/
      )?.[1];
    }

    if (!data.level && text.includes("level")) {
      data.level = text.match(/level(?:\:|\s+is)?\s+([a-zA-Z0-9\s]+)/)?.[1];
    }

    if (!data.amount && text.includes("amount")) {
      data.amount = text.match(/amount(?:\:|\s+is)?\s+([0-9kK]+)/)?.[1];
    }

    if (!data.techstack && text.includes("techstack")) {
      data.techstack = text.match(
        /techstack(?:\:|\s+is)?\s+([a-zA-Z,\s]+)/
      )?.[1];
    }
  });

  return data;
};
