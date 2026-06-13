/* START: THIS SECTION CODE IS CANNOT BE CHANGED, YOU ONLY READ IT */
export interface FieldSchemaType {
  fieldName?: string;
  type:
    | "string"
    | "number"
    | "boolean"
    | "object"
    | "array"
    | "color"
    | "url"
    | "enum"
    | "datetime"
    | "file"
    | "files";
  required?: boolean;
  label?: string;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  options?: string[];
  fields?: FieldSchemaType[];
  item?: FieldSchemaType;
}
/* END: THIS SECTION CODE IS CANNOT BE CHANGED, YOU ONLY READ IT */

export type ConfigurableSchemas = {
  formSchema: FieldSchemaType[];
};



export const configurableSchemas: ConfigurableSchemas = {
  formSchema: [
    {
      fieldName: "appName",
      type: "string",
      required: true,
      label: "App Name",
    },
    {
      fieldName: "logoUrl",
      type: "url",
      required: true,
      label: "Logo URL",
    },
    {
      fieldName: "tagline",
      type: "string",
      required: false,
      label: "Tagline",
      maxLength: 120,
    },
    {
      fieldName: "welcomeMessage",
      type: "string",
      required: false,
      label: "Welcome Message",
      maxLength: 200,
    },
    {
      fieldName: "systemPrompt",
      type: "string",
      required: false,
      label: "AI System Prompt",
      maxLength: 1000,
    },
    {
      fieldName: "inputPlaceholder",
      type: "string",
      required: false,
      label: "Chat Input Placeholder",
      maxLength: 100,
    },
    {
      fieldName: "brandColor",
      type: "object",
      required: true,
      label: "Brand Color",
      fields: [
        {
          fieldName: "primary",
          type: "color",
          required: true,
          label: "Primary",
        },
        {
          fieldName: "secondary",
          type: "color",
          required: true,
          label: "Secondary",
        },
        {
          fieldName: "accent",
          type: "color",
          required: true,
          label: "Accent",
        },
      ],
    },
    {
      fieldName: "bgColors",
      type: "object",
      required: false,
      label: "Background Colors",
      fields: [
        {
          fieldName: "page",
          type: "color",
          required: false,
          label: "Page Background",
        },
        {
          fieldName: "panel",
          type: "color",
          required: false,
          label: "Panel Background",
        },
        {
          fieldName: "card",
          type: "color",
          required: false,
          label: "Card Background",
        },
      ],
    },
    {
      fieldName: "showSidebar",
      type: "boolean",
      required: false,
      label: "Show Sidebar",
    },
    {
      fieldName: "suggestionPrompts",
      type: "array",
      label: "Suggestion Prompts",
      item: { type: "string", required: true },
    },
  ],
};