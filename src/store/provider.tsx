import * as React from "react";

import { store } from "./configure";

import { Provider } from "react-redux";

export const StoreProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  return <Provider store={store}>{children}</Provider>;
};
