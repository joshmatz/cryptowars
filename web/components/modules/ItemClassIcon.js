import { Icon } from "@chakra-ui/react";
import {
  RiFireFill,
  RiInkBottleLine,
  RiRadarFill,
  RiServerFill,
  RiSpyFill,
  RiTerminalBoxFill,
} from "react-icons/ri";

const ClassIcon = ({ classId, ...props }) => {
  switch (classId) {
    case 1:
      return <Icon mt={1} as={RiServerFill} title="Workstations" {...props} />;
    case 2:
      return <Icon mt={1} as={RiTerminalBoxFill} title="Software" {...props} />;
    case 3:
      return <Icon mt={1} as={RiRadarFill} title="Equipment" {...props} />;
    case 4:
      return <Icon mt={1} as={RiSpyFill} title="Shill" {...props} />;
    case 5:
      return <Icon mt={1} as={RiFireFill} title="Boost" {...props} />;
    case 6:
      return <Icon mt={1} as={RiInkBottleLine} title="Consumable" {...props} />;
    default:
      return "Unknown";
  }
};

export default ClassIcon;
