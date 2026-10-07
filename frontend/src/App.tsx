import { useEffect, useState } from "react";
import { Box, Flex, Spinner, Text } from "@radix-ui/themes";
import { handleRedirect, refreshIfNeeded } from "./auth";
import type { TokenSet } from "./types";
import { LoginScreen } from "./components/LoginScreen";
import { Console } from "./components/Console";

type SessionState =
  | { status: "loading" }
  | { status: "guest"; error?: string }
  | { status: "in"; tokens: TokenSet };

export function App() {
  const [session, setSession] = useState<SessionState>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const tokens = await refreshIfNeeded(await handleRedirect());
        if (cancelled) {
          return;
        }
        setSession(tokens ? { status: "in", tokens } : { status: "guest" });
      } catch (error) {
        if (cancelled) {
          return;
        }
        setSession({
          status: "guest",
          error: error instanceof Error ? error.message : "Falha ao autenticar"
        });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  if (session.status === "loading") {
    return (
      <Flex align="center" justify="center" minHeight="100vh" direction="column" gap="4">
        <Spinner size="3" />
        <Text color="gray" size="4">
          Carregando sessão…
        </Text>
      </Flex>
    );
  }

  return (
    <Box px={{ initial: "5", md: "8" }} py={{ initial: "6", md: "9" }}>
      {session.status === "guest" ? (
        <LoginScreen error={session.error} />
      ) : (
        <Console tokens={session.tokens} onTokensChange={(tokens) => setSession({ status: "in", tokens })} />
      )}
    </Box>
  );
}
