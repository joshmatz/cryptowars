import { Box, Button, Heading, Link, Text } from "@chakra-ui/react";
import RouterLink from "next/link";
export default function Home() {
  return (
    <Box textAlign="center" py="10" px={5}>
      <Heading size={"4xl"} mb={5}>
        CryptoWars
      </Heading>
      <Text mb={5}>
        Battle others in an evolving world that hits too close to home.
      </Text>
      <RouterLink href="/game" passHref>
        <Button as={"a"} variant="outline" mr={2.5}>
          Enter
        </Button>
      </RouterLink>
      <Button
        as={"a"}
        href="https://documentation.com"
        target="_blank"
        variant="outline"
      >
        Documentation
      </Button>
    </Box>
  );
}
