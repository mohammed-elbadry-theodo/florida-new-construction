"use client";
/* eslint-disable-next-line no-restricted-imports */
import { Trans, useTranslation } from "react-i18next";

interface ITranslateMessageProps {
  txKey: string;
  values?: Record<string, unknown>;
  components?: Readonly<Record<string, React.ReactElement>> | readonly React.ReactElement[];
  count?: number;
  context?: string;
  defaults?: string;
  nameSpace?: string;
  shouldUnescape?: boolean;
}

const TranslateMessage: React.FC<ITranslateMessageProps> = ({ txKey, ...props }) => {
  const translation = useTranslation();
  return <Trans t={translation.t} i18nKey={txKey} {...props} />;
};

export default TranslateMessage;
