import Banner3S from "~components/landing/banner3s";
import ChangeLanguageButton from "~components/landing/ChangeLanguageButton";
import { SITE_CONFIG } from "~config/site";
import TranslateMessage from "~i18n/TranslateMessage";
import txKeys from "~i18n/translations";

import { LandingButton } from "./../components/landing/LandingButton";

import type { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Home",
};

const HomePage: React.FC = () => {
  return (
    <div>
      <section className="body-font text-gray-600">
        <div className="container mx-auto px-5 py-24">
          <div className="mb-20 flex w-full flex-col items-center justify-center text-center">
            <Image src="/logo.svg" alt="Logo" width={100} height={100} className="mb-4" />
            <h2 className="title-font mb-1 text-xs font-medium tracking-widest text-red-500">
              {SITE_CONFIG.title.toUpperCase()}
            </h2>
            <h1 className="title-font mb-4 text-2xl font-medium text-gray-900 sm:text-3xl">
              {SITE_CONFIG.description}
            </h1>
          </div>
          <div className="flex flex-wrap justify-center">
            <Banner3S
              title="Stability"
              doc={
                "https://www.notion.so/m33/Framework-Qualit-3S-3bff76b2f374475298ef909341696281#77f96802a1954504a71ca6480f609c50"
              }
            >
              Le produit ne doit pas présenter de bugs impactant l&apos;expérience utilisateur.
            </Banner3S>
            <Banner3S
              title="Security"
              doc={
                "https://www.notion.so/m33/Framework-Qualit-3S-3bff76b2f374475298ef909341696281#becfbc6cab35431fbef11110c9b34546"
              }
            >
              Le produit doit être prémunis contre les vulnérabilités les plus communes.
            </Banner3S>
            <Banner3S
              title="Speed"
              doc={
                "https://www.notion.so/m33/Framework-Qualit-3S-3bff76b2f374475298ef909341696281#b9184c326e2c48d6a696ecd59f64328f"
              }
            >
              Le produit doit être au standard sur la performance. Ca inclut la vitesse de chargement et la scalabilité.
            </Banner3S>
          </div>

          <div className="mb-20 flex w-full flex-col text-center">
            <h2 className="text-s mb-1 font-medium tracking-widest text-red-500 ">
              <ChangeLanguageButton />
            </h2>
            <div className="title-font mb-4 text-2xl font-medium text-gray-900 sm:text-3xl">
              <h2>
                <TranslateMessage txKey={txKeys.common.labelExample} />
              </h2>
              <h2>
                <TranslateMessage txKey={txKeys.common.labelExampleFormatted} components={{ underline: <u /> }} />
              </h2>
              <div className="mt-4 flex justify-center">
                <LandingButton />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
