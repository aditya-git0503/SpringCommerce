export function getApiErrorMessage(err, fallback = "Something went wrong") {
  if (!err.response) {
    return "Server unreachable. Please try again.";
  }

  if (typeof err.response.data === "string") {
    return err.response.data;
  }

  return err.response.data?.message || fallback;
}
