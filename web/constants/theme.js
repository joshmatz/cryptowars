import { extendTheme } from "@chakra-ui/react";
import { mode } from "@chakra-ui/theme-tools";

const theme = extendTheme({
  fonts: {
    body: "Space Mono, system-ui, sans-serif",
    heading: "VT323, system-ui, sans-serif",
  },
  colors: {
    gray: {
      50: "#f1f1f1",
      100: "#d9d9d9",
      200: "#c1c1c1",
      300: "#a9a9a9",
      400: "#919191",
      500: "#797979",
      600: "#565656",
      700: "#3E3E3E",
      800: "#252525",
      900: "#191919",
    },
  },
  components: {
    Input: {
      sizes: {
        sm: {
          field: {
            borderRadius: "none",
          },
          addon: {
            borderRadius: "none",
          },
        },
        md: {
          field: {
            borderRadius: "none",
          },
          addon: {
            borderRadius: "none",
          },
        },
        lg: {
          field: {
            borderRadius: "none",
          },
          addon: {
            borderRadius: "none",
          },
        },
        xl: {
          field: {
            borderRadius: "none",
          },
          addon: {
            borderRadius: "none",
          },
        },
      },
    },
    Button: {
      baseStyle: {
        borderRadius: "none",
        borderBottom: "",
      },
    },
  },
  styles: {
    global: (props) => ({
      body: {
        bg: mode(
          "var(--chakra-colors-gray-100)",
          "var(--chakra-colors-gray-900)"
        )(props),
      },
    }),
  },
});

export default theme;
