export type ProductActionResult =
  | { success: true; id?: string }
  | { success: false; error: string };

function fail(error: string): ProductActionResult {
  return { success: false, error };
}

function succeed(id?: string): ProductActionResult {
  return id ? { success: true, id } : { success: true };
}

export { fail, succeed };
