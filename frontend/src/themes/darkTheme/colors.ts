const colors = {
  red100: "#E5494D",
  red200: "#FFB8AE",

  white100: "#FFFFFF",

  green100: "#25B05B",

  blue100: "#5A81EA",
  blue200: "#3C69FF",

  grey100: "#959DAE",
  grey120: "#5A6274",
  grey150: "#495060",
  grey160: "#3A4050",
  grey200: "#323846",
  grey300: "#222936",

  darkblue100: "#1A1D1F",
  darkblue200: "#0F141E",
  darkblue300: "#111315",
};
// eslint-disable-next-line
export default {
  ...colors,
  mainBackground: "#19202E",
  text: colors.white100,
  disabledBtnTextColor: "rgba(255, 255, 255, 0.35)",
  disabledBtnColor: colors.grey200,

  button: {
    backgroundDisabled: colors.grey200,

    primaryColor: colors.white100,
    primaryBackground: colors.blue100,
    primaryBackgroundHover: colors.blue200,

    secondaryColor: colors.green100,
    secondaryBackground: colors.grey200,
    secondaryBackgroundHover: colors.grey100,
  },
  divider: "rgba(223, 229, 250, 0.2)",
  switch: {
    background: colors.grey200,
    circleColor: colors.darkblue100,
  },
  modal: {
    background: colors.darkblue100,
    mask: "rgba(49, 58, 69, 0.8)",
  },
  table: {
    headerColor: colors.grey100,
    background: "#242A3C",
  },
  tooltip: {
    border: "none",
    background: "#323846",
    hoverElement: "#242A3C",
  },
  tokenTooltip: {
    background: "#323846",
  },
  header: {
    walletInfoColor: colors.grey100,
    walletAddressBackground: colors.grey200,
    mobileMenuIconBackground: colors.grey200,
    mobileMenuIconColor: colors.grey100,
    // mobileMenuIconColor: colors.neutral2,
    background: colors.darkblue200,
  },
  skeleton: {
    base: colors.darkblue100,
    highlight: colors.grey200,
  },
  switchButtons: {
    selectedBackground: colors.darkblue100,
    selectedColor: colors.grey100,
    // selectedColor: colors.neutral3,
    secondaryBackground: colors.grey200,
    secondaryColor: colors.grey100,
  },
  dashboard: {
    tokenRowSelected: "#313A45",
    tokenRowColor: "#323846",
    cardBackground: "#323846",
  },
  supplyBtn: {
    background: "#1F262B",
    backgroundSelected: "#333D46",
    backgroundDisabled: "#232A2E",
  },

  card: {
    background: "#323846",
    border: colors.grey200,
  },
  icon: {
    borderColor: "none",
  },
  progressBar: {
    main: colors.green100,
    secondary: colors.grey200,
    red: colors.green100,
  },
  gradient: "rgba(0, 0, 0, 0.5);",
  notifications: {
    boxShadow:
      "0px 0px 14px -4px rgba(227, 233, 249, 0.05), 0px 32px 48px -8px rgba(227, 233, 249, 0.1)",
    background: colors.darkblue100,
    warningBackground: "rgb(150 93 85 / 60%)",
  },
  textArea: {
    borderColor: colors.grey200,
  },
  tokenDescGradient:
    "linear-gradient(180deg, rgba(248, 248, 255, 0) 0%, #181931 100%)",
  noNftGradient:
    "-webkit-linear-gradient(rgba(255, 255, 255, 0), rgb(20 22 49) 57.65%);",
};
