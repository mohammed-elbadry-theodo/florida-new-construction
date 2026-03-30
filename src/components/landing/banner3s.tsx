import * as React from "react";

import { ArrowRightIcon } from "~components/icons/arrow";

interface Banner3SProps {
  title: string;
  doc: string;
}

const Banner3S: React.FC<React.PropsWithChildren<Banner3SProps>> = ({ title, doc, children }) => (
  <div className="flex flex-col justify-between border-l-2 border-gray-200/60 px-8 py-6 md:w-full lg:w-1/2 xl:w-1/4">
    <section>
      <h2 className="title-font mb-2 text-lg font-medium text-gray-900 sm:text-xl">{title}</h2>
      <p className="mb-4 text-base leading-relaxed">{children}</p>
    </section>

    <a href={doc} target="_blank" rel="noreferrer" className="inline-flex items-center text-red-500">
      Learn More
      <ArrowRightIcon />
    </a>
  </div>
);

export default Banner3S;
