const colors = {
  neutral0: "#FFFFFF",
  neutral1: "#F0F2FA",
  neutral2: "#E3E9F9",
  neutral3: "#DFE5FA",
  neutral4: "#9A9ABD",
  neutral5: "#323846",
  neutral6: "#19202E",
  neutral7: "#0F141E",
  neutral8: "#1A1D1F",
  neutral9: "#111315",
  primary01: "#5A81EA",
  primary02: "#3C69FF",
  primary03: "#00B493",
  secondary1: "#FF6A55",
  secondary2: "#FFB8AE",
  secondary3: "#CFDAFF",
};
// eslint-disable-next-line
export default {
  ...colors,
  mainBackground: colors.neutral6,
  text: colors.neutral2,
  disabledBtnTextColor: "rgba(255, 255, 255, 0.35)",
  disabledBtnColor: colors.neutral5,

  button: {
    backgroundDisabled: colors.neutral5,

    primaryColor: colors.neutral0,
    primaryBackground: colors.primary01,
    primaryBackgroundHover: colors.primary02,

    secondaryColor: colors.neutral1,
    secondaryBackground: colors.neutral5,
    secondaryBackgroundHover: colors.neutral4,
  },
  divider: "rgba(223, 229, 250, 0.2)",
  switch: {
    background: colors.neutral5,
    circleColor: colors.neutral7,
  },
  modal: {
    background: colors.neutral8,
    mask: "rgba(49, 58, 69, 0.8)",
  },
  table: {
    headerColor: colors.neutral4,
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
    walletInfoColor: colors.neutral4,
    walletAddressBackground: colors.neutral5,
    mobileMenuIconBackground: colors.neutral5,
    mobileMenuIconColor: colors.neutral2,
    background: colors.neutral7,
  },
  skeleton: {
    base: colors.neutral7,
    highlight: colors.neutral5,
  },
  switchButtons: {
    selectedBackground: colors.neutral7,
    selectedColor: colors.neutral3,
    secondaryBackground: colors.neutral5,
    secondaryColor: colors.neutral4,
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
    border: colors.neutral5,
  },
  icon: {
    borderColor: "none",
  },
  progressBar: {
    main: colors.primary03,
    secondary: colors.neutral5,
    red: colors.primary03,
  },
  gradient: "rgba(0, 0, 0, 0.5);",
  notifications: {
    boxShadow:
      "0px 0px 14px -4px rgba(227, 233, 249, 0.05), 0px 32px 48px -8px rgba(227, 233, 249, 0.1)",
    background: colors.neutral8,
    warningBackground: "rgb(150 93 85 / 60%)",
  },
  textArea: {
    borderColor: colors.neutral5,
  },
  tokenDescGradient: "linear-gradient(180deg, rgba(248, 248, 255, 0) 0%, #181931 100%)",
  noNftGradient: "-webkit-linear-gradient(rgba(255, 255, 255, 0), rgb(20 22 49) 57.65%);",
};
