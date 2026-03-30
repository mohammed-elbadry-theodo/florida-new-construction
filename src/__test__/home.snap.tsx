import HomePage from "~app/page";

import { render } from "./test-utils";

describe("Testing page example", () => {
  it("should render home", () => {
    const { container } = render(<HomePage />);
    expect(container).toMatchSnapshot();
  });
});
