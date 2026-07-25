import "server-only";

interface DatabaseErrorLike {
  code?: string;
  message?: string;
  details?: string;
  hint?: string;
}

function isDatabaseErrorLike(error: unknown): error is DatabaseErrorLike {
  return Boolean(error && typeof error === "object");
}

export function databaseWriteError(error: unknown, fallback: string): string {
  if (!isDatabaseErrorLike(error)) return fallback;

  const code = typeof error.code === "string" ? error.code : "";
  const message = typeof error.message === "string" ? error.message : "";
  const details = typeof error.details === "string" ? error.details : "";
  const hint = typeof error.hint === "string" ? error.hint : "";
  const combined = `${message} ${details} ${hint}`.toLowerCase();

  console.error("[database:write]", { code, message, details, hint });

  if (
    code === "22P02" &&
    (combined.includes("product_category") ||
      combined.includes("oil_spin_on") ||
      combined.includes("oil_element") ||
      combined.includes("fuel_spin_on") ||
      combined.includes("fuel_elements") ||
      combined.includes("air_cleaners"))
  ) {
    return "The Supabase product categories are out of date. Apply the latest catalogue integration migration, refresh this page, and try again.";
  }

  if (code === "23505") {
    return "A record with the same unique name, URL, part number, or reference already exists.";
  }

  if (code === "23503") {
    return "This change is linked to another record and cannot be completed as entered.";
  }

  if (code === "23514") {
    return "One or more fields do not meet the database requirements. Check the entered values and try again.";
  }

  if (code === "42501" || combined.includes("row-level security") || combined.includes("permission denied")) {
    return "Your staff account does not have permission to make this change. Ask a super administrator to verify your role.";
  }

  if (code === "PGRST116") {
    return "That record no longer exists. Refresh the page and try again.";
  }

  return fallback;
}
