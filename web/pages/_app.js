import { ChakraProvider } from "@chakra-ui/react";
import { Hydrate, QueryClient, QueryClientProvider } from "react-query";
import { useState } from "react";
import BrowserOnly from "../components/BrowserOnly";
import dynamic from "next/dynamic";
import AppTemplate from "../components/modules/AppTemplate";
import NetworkButtons from "../components/modules/NetworkButtons";
import theme from "../constants/theme";
// Attempt to load Torus or other browser-only imports...
const Web3ContextProvider = dynamic(() =>
  import("../components/Web3ContextProvider")
);

function MyApp({ Component, pageProps }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        refetchOnWindowFocus: false,
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <ChakraProvider theme={theme}>
        <BrowserOnly>
          <Web3ContextProvider>
            <Hydrate state={pageProps.dehydratedState}>
              <AppTemplate>
                <Component {...pageProps} />
              </AppTemplate>
            </Hydrate>
          </Web3ContextProvider>
        </BrowserOnly>
      </ChakraProvider>
    </QueryClientProvider>
  );
}

export default MyApp;
