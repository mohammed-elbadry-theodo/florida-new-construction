import React from "react";

import { TestTranslationProvider } from "~i18n";

// eslint-disable-next-line no-restricted-imports
import type {
  Queries,
  queries,
  RenderHookOptions,
  RenderHookResult,
  RenderOptions,
  RenderResult,
} from "@testing-library/react";
// eslint-disable-next-line no-restricted-imports
import { render, renderHook } from "@testing-library/react";
import type { ReactNode } from "react";

const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return <TestTranslationProvider>{children}</TestTranslationProvider>;
};

const customRender = <
  Q extends Queries = typeof queries,
  Container extends DocumentFragment | Element = HTMLElement,
  BaseElement extends DocumentFragment | Element = Container,
>(
  ui: ReactNode,
  options?: RenderOptions<Q, Container, BaseElement>,
): RenderResult<Q, Container, BaseElement> => render(ui, { wrapper: AllTheProviders, ...options });

const customRenderHook = <
  Result,
  Props,
  Q extends Queries = typeof queries,
  Container extends DocumentFragment | Element = HTMLElement,
  BaseElement extends DocumentFragment | Element = Container,
>(
  hook: (initialProps: Props) => Result,
  options?: RenderHookOptions<Props, Q, Container, BaseElement>,
): RenderHookResult<Result, Props> => {
  return renderHook<Result, Props, Q, Container, BaseElement>(hook, { wrapper: AllTheProviders, ...options });
};

// eslint-disable-next-line no-restricted-imports
export * from "@testing-library/react";
// eslint-disable-next-line no-restricted-imports
export * from "@testing-library/user-event";
export { customRender as render, customRenderHook as renderHook };
