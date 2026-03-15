export function runJobs(jobs: Array<() => Promise<void>>) {
  jobs.forEach((job) => {
    job().catch((error) => {
      console.error(
        "Error running job:",
        error instanceof Error ? error : new Error("An unknown error occurred"),
      );
    });
  });
}

export function removeHyphensAndReplaceWithWhitespace(str: string) {
  return str.replace(/-/g, " ");
}

export function capitalizeFirstLetter(str: string) {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function capitalizeWords(str: string) {
  if (!str) return str;
  return str
    .split(" ")
    .map((word) => capitalizeFirstLetter(word))
    .join(" ");
}
