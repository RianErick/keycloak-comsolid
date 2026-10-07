import { Button, Dialog, Flex } from "@radix-ui/themes";
import { JwtInspector } from "./JwtInspector";

export function ClaimsDialog({
  open,
  onOpenChange,
  token
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  token: string;
}) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Content maxWidth="none" className="claims-dialog claims-dialog-jwtio">
        <Dialog.Title size="6" mb="1">
          Inspetor JWT
        </Dialog.Title>
        <Dialog.Description size="4" mb="4">
          Mesma ideia do jwt.io: token codificado à esquerda, header e payload decodificados à direita.
        </Dialog.Description>

        <JwtInspector token={token} />

        <Flex gap="4" mt="5" justify="end">
          <Dialog.Close>
            <Button size="3" variant="soft" color="gray">
              Fechar
            </Button>
          </Dialog.Close>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  );
}
