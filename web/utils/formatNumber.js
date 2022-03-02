import { ethers } from "ethers";

const formatNumber = (number, { isWei = true, style = "currency" } = {}) => {
  if (!number) {
    return "0.00";
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

  if (style === "normal") {
    opts.minimumFractionDigits = 0;
    opts.maximumFractionDigits = 0;
  }

  return new Intl.NumberFormat("en-US", {
    ...opts,
  }).format(numberToBeFormatted);
};

export default formatNumber;
