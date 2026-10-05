import {
  ALERT_CHANNEL_GROUPS,
  ALERT_CHANNEL_LABELS,
  type AlertChannel,
  DEFAULT_ALERT_CHANNELS,
} from "@qa/shared";
import { useEffect, useState } from "react";
import { Button } from "../../components/Button/Button.tsx";
import { Modal } from "../../components/Modal/Modal.tsx";
import { StatusMessage } from "../../components/StatusMessage/StatusMessage.tsx";
import { Toggle } from "../../components/Toggle/Toggle.tsx";
import "./SearchAlertDialog.css";

export type SearchAlertDialogProps = {
  open: boolean;
  onClose: () => void;
  /** Recebe os canais ligados. O dono grava (mutation) e controla `status`. */
  onSubmit: (channels: AlertChannel[]) => void;
  status?: "idle" | "saving" | "saved" | "error";
  errorMessage?: string;
};

/**
 * Modal "Criar alerta de imóvel" (print docs/reference/criar_alerta.png): escolher onde receber
 * os imóveis novos da busca atual. Só apresentação — gravar o alerta é do dono (apps/web).
 */
export function SearchAlertDialog({
  open,
  onClose,
  onSubmit,
  status = "idle",
  errorMessage,
}: SearchAlertDialogProps) {
  const [channels, setChannels] = useState<AlertChannel[]>([...DEFAULT_ALERT_CHANNELS]);
  useEffect(() => {
    if (open) setChannels([...DEFAULT_ALERT_CHANNELS]);
  }, [open]);

  const toggle = (channel: AlertChannel, on: boolean) =>
    setChannels((current) => (on ? [...current, channel] : current.filter((c) => c !== channel)));

  if (status === "saved") {
    return (
      <Modal
        open={open}
        onClose={onClose}
        title="Alerta criado"
        hideTitle
        className="qa-alert-dialog"
      >
        <StatusMessage
          icon="bell"
          title="Alerta criado!"
          description="Avisaremos quando chegarem imóveis novos para esta busca."
          action={<Button onClick={onClose}>Continuar buscando</Button>}
        />
      </Modal>
    );
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Escolha onde quer receber novos imóveis dessa busca"
      className="qa-alert-dialog"
    >
      <form
        className="qa-alert-dialog__form"
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit(channels);
        }}
      >
        {ALERT_CHANNEL_GROUPS.map((group) => (
          <fieldset key={group.title} className="qa-alert-dialog__group">
            <legend className="qa-alert-dialog__legend">{group.title}</legend>
            {group.channels.map((channel) => (
              <Toggle
                key={channel}
                label={ALERT_CHANNEL_LABELS[channel]}
                checked={channels.includes(channel)}
                onChange={(on) => toggle(channel, on)}
                className="qa-alert-dialog__toggle"
              />
            ))}
          </fieldset>
        ))}
        <p className="qa-alert-dialog__hint">
          Você pode alterar suas preferências quando quiser dentro da página de alertas criados.
        </p>
        {status === "error" && (
          <p className="qa-alert-dialog__error" role="alert">
            {errorMessage ?? "Não foi possível criar o alerta. Tente novamente."}
          </p>
        )}
        <Button
          type="submit"
          fullWidth
          loading={status === "saving"}
          disabled={channels.length === 0}
        >
          Criar alerta de imóveis
        </Button>
      </form>
    </Modal>
  );
}
