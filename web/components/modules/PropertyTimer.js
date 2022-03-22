import { Box, Icon, Text, Tooltip } from "@chakra-ui/react";
import { formatDistanceStrict } from "date-fns";
import fromUnixTime from "date-fns/fromUnixTime";
import {
  MdBatteryCharging20,
  MdOutlineBatteryChargingFull,
} from "react-icons/md";

const PropertyTimer = ({ time, percentFull, lastCollected, maxCollection }) => {
  if (time <= 0) {
    return (
      <Box flex="1 0 auto" display="flex" alignItems="center" mr={5}>
        <Text fontSize="sm" whiteSpace="nowrap">
          100% Capacity
        </Text>
        <Icon as={MdOutlineBatteryChargingFull} w={4} h={4} />
      </Box>
    );
  }

  return (
    <Tooltip
      label={`${formatDistanceStrict(
        fromUnixTime(new Date().getTime() / 1000),
        fromUnixTime(lastCollected.add(maxCollection).toNumber())
      )} to go`}
    >
      <Box display="flex" alignItems="center" mr={5}>
        <Text fontSize="sm" mr={2}>
          {percentFull}% Capacity
        </Text>
        {time !== 0 ? <Icon as={MdBatteryCharging20} w={4} h={4} /> : null}
      </Box>
    </Tooltip>
  );
};

export default PropertyTimer;
