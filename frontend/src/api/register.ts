import { config } from "../auth";

export interface RegisterInput {
  name: string;
  username: string;
  password: string;
}

export async function registerUser(input: RegisterInput) {
  const response = await fetch(`${config().apiUrl}/public/register`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json"
    },
    body: JSON.stringify(input)
  });

  const data = (await response.json()) as { error?: string; message?: string; username?: string };
  if (!response.ok) {
    throw new Error(data.error || data.message || "Falha ao cadastrar");
  }
  return data;
}
