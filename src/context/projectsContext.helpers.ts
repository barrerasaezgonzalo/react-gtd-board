export function normalizeProjectName(name: string) {
  return name.trim();
}

export function normalizeProjectUpdates(updates: { name?: string; color?: string }) {
  const normalizedUpdates: { name?: string; color?: string } = {};

  if (typeof updates.name === "string") {
    const cleanName = updates.name.trim();
    if (!cleanName) return null;
    normalizedUpdates.name = cleanName;
  }

  if (typeof updates.color === "string" && updates.color.trim()) {
    normalizedUpdates.color = updates.color;
  }

  return Object.keys(normalizedUpdates).length > 0 ? normalizedUpdates : null;
}
