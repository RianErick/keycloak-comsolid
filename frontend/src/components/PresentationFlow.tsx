import { Box, Flex, Text } from "@radix-ui/themes";

const steps = [
  { id: 1, title: "Login", detail: "Redirect · PKCE · Keycloak" },
  { id: 2, title: "JWT", detail: "Access token · claims · roles" },
  { id: 3, title: "API", detail: "Bearer · Java valida · autoriza" }
] as const;

export function PresentationFlow({ activeStep }: { activeStep: 1 | 2 | 3 }) {
  return (
    <Flex gap="3" wrap="wrap" className="flow-steps" role="list" aria-label="Fluxo da demonstração">
      {steps.map((step) => {
        const active = step.id === activeStep;
        const done = step.id < activeStep;
        return (
          <Box
            key={step.id}
            className={`flow-step${active ? " flow-step--active" : ""}${done ? " flow-step--done" : ""}`}
            role="listitem"
          >
            <Text size="3" weight="bold" className="flow-step-num">
              {step.id}
            </Text>
            <Box>
              <Text size="4" weight="medium">
                {step.title}
              </Text>
              <Text size="3" color="gray">
                {step.detail}
              </Text>
            </Box>
          </Box>
        );
      })}
    </Flex>
  );
}
