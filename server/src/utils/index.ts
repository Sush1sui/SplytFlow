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

export function getUtcMidnight(date = new Date()) {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );
}

export function toUtcDay(date?: Date | string) {
  if (typeof date === "string") {
    // KISS contract: accept date-only strings from clients.
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      throw new Error("Invalid date format. Use YYYY-MM-DD");
    }

    return new Date(`${date}T00:00:00.000Z`);
  }

  return getUtcMidnight(date ?? new Date());
}
