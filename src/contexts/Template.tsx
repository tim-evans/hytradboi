import { createContext } from "react";
import { ComponentType } from "react";

const EMPTY_COMPONENT_MAP = {};

export const TemplateContext = createContext<{
  PAGENAME: string;
  templates: {
    [key: string]: ComponentType<any>;
  };
}>({ PAGENAME: "", templates: EMPTY_COMPONENT_MAP });

export const TemplateProvider = TemplateContext.Provider;
