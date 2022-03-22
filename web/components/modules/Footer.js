import { Box, Button, Container, Stack, Text } from "@chakra-ui/react";
import Link from "next/link";

const Footer = () => {
  return (
    <Container maxW={"container.xl"}>
      <Text fontSize="2xl" fontFamily="heading">
        <Link href="/" passHref>
          CryptoWars
        </Link>
      </Text>
    </Container>
  );
};

export default Footer;
