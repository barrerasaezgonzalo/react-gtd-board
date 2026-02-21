export const formatDate = (dateString: string): string => {
  if (!dateString) return "";

  const date = new Date(dateString);

  const day = String(date.getUTCDate()).padStart(2, "0");
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const year = date.getUTCFullYear();

  return `${day}/${month}/${year}`;
};

export const getDaysRemaining = (targetDateString: string): string => {
  if (!targetDateString) return "";

  const targetDate = new Date(targetDateString);
  const today = new Date();

  const targetUTC = Date.UTC(
    targetDate.getUTCFullYear(),
    targetDate.getUTCMonth(),
    targetDate.getUTCDate(),
  );
  const todayUTC = Date.UTC(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );

  const diffTime = targetUTC - todayUTC;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return "Vencida";
  if (diffDays === 0) return "Vence hoy";
  if (diffDays === 1) return "Queda 1 día";

  return `Quedan ${diffDays} días`;
};
