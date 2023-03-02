const colors = {
  neutral0: "#FFFFFF",
  neutral1: "#F0F2FA",
  neutral2: "#E3E9F9",
  neutral3: "#DFE5FA",
  neutral4: "#9A9ABD",
  neutral5: "#313A45",
  neutral6: "#1F262B",
  neutral7: "#1A1D1F",
  neutral8: "#111315",
  primary01: "#3FE8BD",
  primary02: "#1DD4A6",
  primary03: "#00B493",
  secondary1: "#FF6A55",
  secondary2: "#FFB8AE",
  secondary3: "#CFDAFF",
};
// eslint-disable-next-line
export default {
  ...colors,
  text: colors.neutral6,
  mainBackground: colors.neutral1,
  menuBackground: colors.neutral5,
  divider: "rgba(31, 38, 43, 0.2)",
  disabledBtnTextColor: "rgba(26, 29, 31, 0.35);",
  disabledBtnColor: "rgba(184, 189, 208, 0.5)",

  switch: {
    background: colors.neutral3,
    circleColor: colors.neutral1,
  },
  switchButtons: {
    selectedBackground: colors.neutral1,
    selectedColor: colors.neutral7,
    secondaryBackground: colors.neutral3,
    secondaryColor: colors.neutral4,
  },

  button: {
    backgroundDisabled: colors.neutral3,

    primaryColor: colors.neutral7,
    primaryBackground: colors.primary01,
    primaryBackgroundHover: colors.primary02,

    secondaryColor: colors.neutral7,
    secondaryBackground: colors.neutral3,
    secondaryBackgroundHover: colors.secondary3,
  },
  header: {
    navLinkBackground: colors.neutral3,
    walletInfoColor: colors.neutral4,
    walletAddressBackground: colors.neutral3,
    walletBalanceBackground: colors.neutral4,
    mobileMenuIconBackground: colors.neutral3,
    mobileMenuIconColor: colors.neutral6,
  },
  skeleton: {
    base: colors.neutral3,
    highlight: colors.neutral1,
  },
  card: {
    background: "rgba(255, 255, 255, 0.5);",
    border: colors.neutral2,
  },
  tokenTooltip: {
    background: "#F9FAFF",
  },
  modal: {
    background: colors.neutral0,
    mask: "rgba(227, 233, 249, 0.8)",
  },
  table: {
    headerColor: colors.neutral4,
    background: "rgba(255, 255, 255, 0.5)",
  },
  tooltip: {
    border: "none",
    background: "#F9FAFF",
    hoverElement: "rgba(223, 229, 250, 0.6)",
  },
  dashboard: {
    tokenRowColor: "#F9FAFF",
    cardBackground: "#F9FAFF",
    tokenRowSelected: colors.neutral0,
  },
  supplyBtn: {
    background: "rgba(223, 229, 250,0.6)",
    backgroundSelected: colors.neutral3,
    backgroundDisabled: "rgba(223, 229, 250, 0.5)",
  },
  //fixme
  icon: {
    borderColor: "none",
  },
  gradient: "rgba(255, 255, 255, 0.5)",
  notifications: {
    boxShadow:
      "0px 0px 14px -4px rgba(31, 38, 42, 0.05), 0px 32px 48px -8px rgba(31, 38, 42, 0.1)",
    background: colors.neutral0,
    warningBackground: "#ffded9",
  },
  progressBar: {
    main: colors.primary03,
    secondary: colors.neutral3,
    red: colors.primary03,
  },
  textArea: {
    borderColor: colors.neutral3,
  },
  tokenDescGradient:
    "linear-gradient(180deg, rgba(248, 248, 255, 0) 0%, #f8f8ff 100%)",
  noNftGradient:
    "-webkit-linear-gradient(rgba(255, 255, 255, 0), rgba(241, 242, 254, 1) 57.65%);",
};
