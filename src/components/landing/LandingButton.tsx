"use client";
import React from "react";

import { Button } from "~components/elements/button";
import txKeys from "~i18n/translations";
import { useTranslation } from "~i18n/useTranslation";

import { RocketIcon } from "lucide-react";

export const LandingButton: React.FC = () => {
  const translate = useTranslation();
  return (
    <Button variant="destructive">
      <RocketIcon />
      {translate(txKeys.common.styledButton)}
    </Button>
  );
};
