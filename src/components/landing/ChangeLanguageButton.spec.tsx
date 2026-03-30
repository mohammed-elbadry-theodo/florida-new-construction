import React from "react";

import { render, userEvent, waitFor } from "~__test__/test-utils";

import ChangeLanguageButton from "./ChangeLanguageButton";

describe("ChangeLanguageButton", () => {
  it("initial render should have button text in french", () => {
    const { getByText } = render(<ChangeLanguageButton />);
    expect(getByText(/changer la langue/iu)).toBeInTheDocument();
  });

  it("pressing the button changes the button text to english when the promise resolves", async () => {
    const user = userEvent.setup();
    const { getByText } = render(<ChangeLanguageButton />);
    await user.click(getByText(/changer la langue/iu));

    await waitFor(() => {
      expect(getByText(/change language/iu)).toBeInTheDocument();
    });
  });
});
