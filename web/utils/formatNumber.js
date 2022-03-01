import { ethers } from "ethers";

const formatNumber = (number, { isWei = true, style = "currency" } = {}) => {
  if (!number) {
    return null;
  }

  let numberToBeFormatted = number;
  if (number instanceof ethers.BigNumber) {
    if (isWei) {
      numberToBeFormatted = ethers.utils.formatEther(number);
    } else {
      numberToBeFormatted = number.toString();
    }
  }

  let opts = {};
  if (style === "currency") {
    opts.currency = "USD";
    opts.minimumFractionDigits = 2;
    opts.maximumFractionDigits = 2;
  }

  return new Intl.NumberFormat("en-US", {
    ...opts,
  }).format(numberToBeFormatted);
};

export default formatNumber;
