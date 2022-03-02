import { Box, Stack } from "@chakra-ui/react";
import jobTiers from "../../constants/jobs";
import JobTierListItem from "./JobTierListItem";

const JobTierList = ({ characterId, children, selectedIndex }) => {
  return (
    <Box>
      <Stack direction={"row"} align="stretch" mb={10} spacing={0}>
        {jobTiers.map((tier, i) => {
          return (
            <JobTierListItem
              selectedIndex={selectedIndex}
              characterId={characterId}
              tierIndex={i}
              key={i}
            />
          );
        })}
      </Stack>
      {children}
    </Box>
  );
};

export default JobTierList;
