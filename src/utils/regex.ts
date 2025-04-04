type RegexPattern = Record<'walletRegex', RegExp>;

export const regexPattern: RegexPattern = {
  walletRegex: /^0x[a-fA-F0-9]{40}$/,
};
