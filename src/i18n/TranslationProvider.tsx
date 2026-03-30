import * as React from "react";

import useAsync from "~hooks/useAsync";
import { i18nInitializer } from "~i18n";

/* eslint-disable-next-line no-restricted-imports */
import type { i18n as i18nApi } from "i18next";
/* eslint-disable-next-line no-restricted-imports */
import { I18nextProvider } from "react-i18next";

export const createTranslationProvider = (i18n: i18nApi) =>
  function TransactionProvider({ children }: React.PropsWithChildren): React.ReactElement<React.PropsWithChildren> {
    const { loading, error } = useAsync(i18nInitializer, []);
    return (
      <>
        {loading && <div>Loading...</div>}
        {error !== undefined && <div>Error: {error.message}</div>}
        {!loading && error === undefined && <I18nextProvider i18n={i18n}>{children}</I18nextProvider>}
      </>
    );
  };

export const createTestTranslationProvider = (i18n: i18nApi) =>
  function TransactionProvider({ children }: React.PropsWithChildren): React.ReactElement<React.PropsWithChildren> {
    i18nInitializer().catch((error) => {
      // Disabled because the rule is not relevant in the test provider
      // eslint-disable-next-line no-console
      console.error(error);
    });
    return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
  };
