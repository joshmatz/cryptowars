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
        <Text whiteSpace="nowrap">100% Capacity</Text>
        <Icon as={MdOutlineBatteryChargingFull} w={5} h={5} />
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
        <Text mr={2}>{percentFull}% Capacity</Text>
        {time !== 0 ? <Icon as={MdBatteryCharging20} w={5} h={5} /> : null}
      </Box>
    </Tooltip>
  );
};

export default PropertyTimer;
