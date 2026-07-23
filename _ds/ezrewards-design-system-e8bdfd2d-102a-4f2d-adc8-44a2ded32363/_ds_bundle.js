/* @ds-bundle: {"format":4,"namespace":"EzRewardsDesignSystem_e8bdfd","components":[{"name":"Logo","sourcePath":"assets/logo/Logo.jsx"},{"name":"Badge","sourcePath":"components/core/Badge.jsx"},{"name":"Button","sourcePath":"components/core/Button.jsx"},{"name":"Card","sourcePath":"components/core/Card.jsx"},{"name":"Tag","sourcePath":"components/core/Tag.jsx"},{"name":"Input","sourcePath":"components/forms/Input.jsx"},{"name":"NavLink","sourcePath":"components/navigation/NavLink.jsx"}],"sourceHashes":{"assets/logo/Logo.jsx":"c5025f234fd4","components/core/Badge.jsx":"6763eb30096c","components/core/Button.jsx":"05d9309e9bbb","components/core/Card.jsx":"29f1593334b3","components/core/Tag.jsx":"4d0c7547e9b9","components/forms/Input.jsx":"e6c39d974495","components/navigation/NavLink.jsx":"c93b18959907","ui_kits/app/OverviewRecognition.jsx":"b7f3250b7862","ui_kits/app/RewardsWalletReports.jsx":"f687c9a2c9ff","ui_kits/app/Shell.jsx":"131d85e1ec43","ui_kits/website/EarlyAccessForm.jsx":"b58f31b30cc9","ui_kits/website/FeatureSections.jsx":"a3f189eb82a8","ui_kits/website/Footer.jsx":"0da1062b9c46","ui_kits/website/Header.jsx":"8cc95399b98b","ui_kits/website/Hero.jsx":"213cb5d777f0"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.EzRewardsDesignSystem_e8bdfd = window.EzRewardsDesignSystem_e8bdfd || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// assets/logo/Logo.jsx
try { (() => {
// Wordmark + sparkle mark, traced from the EzRewards Figma source (node 119:410).
function Logo(props = {}) {
  const height = props.height || 26;
  const scale = height / 26;
  return /*#__PURE__*/React.createElement("div", {
    className: props.className,
    style: {
      width: "fit-content",
      height,
      overflow: "hidden",
      display: "flex",
      alignItems: "center",
      position: "relative",
      ...props.style
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: "relative",
      height: 26,
      width: 158.364,
      overflow: "hidden",
      flexShrink: 0,
      transform: `scale(${scale})`,
      transformOrigin: "left center"
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: 19.303,
    height: 18.766,
    viewBox: "0 0 19.303 18.766",
    fill: "none",
    style: {
      position: "absolute",
      left: 8.941,
      top: 3.619
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 7.874 0 C 10.533 0.209 11.45 3.661 11.942 5.827 C 13.257 6.584 17.542 8.011 19.303 8.707 C 16.333 10.851 15.56 11.258 12.35 12.963 C 11.523 14.816 10.723 16.866 9.943 18.755 L 9.238 18.766 C 7.704 18.046 6.366 14.299 5.688 12.712 C 4.013 11.819 0.52 10.974 0 9.285 C 0.689 7.804 3.674 6.765 5.189 6.115 C 6.675 3.918 7.309 2.664 7.874 0 Z",
    fill: props.markColor || "var(--color-lime, #C2F24A)",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 12.914,
    height: 12.307,
    viewBox: "0 0 12.914 12.307",
    fill: "none",
    style: {
      position: "absolute",
      left: -0.123,
      top: 0.026
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 5.401 0.069 C 7.199 0.036 10.26 -0.093 12.104 0.119 C 12.63 0.179 12.729 0.657 12.914 1.092 C 12.036 5.439 2.926 -2.094 2.527 7.189 C 2.568 8.615 3.057 12.063 1.253 12.307 C 0.623 11.791 0.21 10.791 0.141 9.997 C -0.303 4.926 0.015 1.082 5.401 0.069 Z",
    fill: props.color || "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 13.023,
    height: 12.724,
    viewBox: "0 0 13.023 12.724",
    fill: "none",
    style: {
      position: "absolute",
      left: 22.613,
      top: 12.882
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 11.377 0 L 12.395 0.565 C 13.009 1.607 13 3.91 13.02 5.156 C 13.171 14.649 7.927 12.548 1.253 12.482 C 0.59 12.154 0.393 12.125 0 11.534 L 0.253 10.998 C 2.137 10.053 7.057 10.415 9.361 10.476 C 11.433 5.724 9.397 2.457 11.377 0 Z",
    fill: props.color || "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 10.616,
    height: 16.164,
    viewBox: "0 0 10.616 16.164",
    fill: "none",
    style: {
      position: "absolute",
      left: 49.789,
      top: 3.956
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 0.512 0.016 C 2.27 0.046 9.185 -0.178 10.268 0.437 C 12.167 5.043 5.798 1.696 3.455 3.59 C 3.04 4.629 3.16 4.998 3.307 6.105 C 4.519 7.377 9.481 5.694 9.979 7.839 C 8.685 9.962 5.936 8.222 3.514 9.15 L 3.143 13.192 C 5.32 13.287 9.167 12.872 10.457 14.146 L 10.463 15.27 C 10.42 15.32 10.031 15.769 10.031 15.769 C 6.698 15.972 3.474 15.854 0.117 16.164 C 0.081 14.083 -0.291 1.083 0.512 0.016 Z",
    fill: props.color || "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 9.945,
    height: 11.023,
    viewBox: "0 0 9.945 11.023",
    fill: "none",
    style: {
      position: "absolute",
      left: 61.287,
      top: 8.674
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 3.817 0.042 C 15.857 -0.551 7.11 5.267 3.214 9.022 C 4.566 9.063 8.522 8.945 9.455 9.341 C 9.845 10.208 9.825 9.832 9.52 10.748 C 8.338 11.236 7.77 10.956 6.392 10.801 C 4.7 10.724 0.947 11.497 0.118 10.53 C -0.322 7.04 4.219 5.241 5.465 2.736 C 4.831 1.742 1.5 2.483 0 1.062 L 0.15 0.654 C 1.321 -0.056 2.455 0.056 3.817 0.042 Z",
    fill: props.color || "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 15.228,
    height: 11.693,
    viewBox: "0 0 15.228 11.693",
    fill: "none",
    style: {
      position: "absolute",
      left: 98.266,
      top: 8.444
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 11.184 11.171 C 11.973 7.905 11.851 3.454 12.963 0.721 C 13.693 0.056 13.339 0.247 14.333 0.022 L 14.89 0.418 C 15.38 1.452 15.212 2.51 15.145 3.657 C 14.876 5.907 14.713 9.41 13.517 11.161 C 12.365 11.883 11.242 11.671 9.744 11.639 C 8.717 10.457 7.98 3.611 7.652 1.57 C 6.779 4.588 6.859 8.433 5.53 11.143 C 4.472 11.87 3.466 11.149 1.778 11.675 L 1.329 11.356 C 0.693 9.428 -0.444 1.866 0.182 0 C 0.871 0.049 1.026 0.103 1.694 0.3 C 2.904 1.578 3.238 6.564 3.73 8.727 L 3.967 8.612 L 3.69 8.472 L 4.018 8.444 C 4.576 5.764 4.624 3.161 5.159 0.279 C 9.097 -0.001 10.629 0.184 10.748 4.874 C 10.8 6.934 10.985 9.11 11.184 11.171 Z",
    fill: props.color || "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 11.324,
    height: 11.875,
    viewBox: "0 0 11.324 11.875",
    fill: "none",
    style: {
      position: "absolute",
      left: 85.846,
      top: 8.374
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 5.583 0 C 10.267 0.627 10.607 2.757 11.324 6.858 C 9.799 6.912 3.785 6.297 3.178 7.806 C 5.362 9.929 7.01 8.722 9.463 7.959 C 10.237 8.515 10.118 8.257 10.353 9.016 C 4.36 18.263 -6.763 2.328 5.583 0 Z M 4.865 4.714 C 6.307 4.726 6.461 4.95 7.568 4.347 C 7.612 3.354 6.499 2.749 5.721 2.23 C 4.923 2.757 3.663 3.446 3.254 4.231 C 3.808 4.825 3.859 4.645 4.865 4.714 Z",
    fill: props.color || "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 11.978,
    height: 16.12,
    viewBox: "0 0 11.978 16.12",
    fill: "none",
    style: {
      position: "absolute",
      left: 72.443,
      top: 3.921
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 0.383 0.028 C 1.314 0.014 2.245 0.006 3.176 0.003 C 6.113 -0.005 12.115 -0.196 11.976 4.395 C 11.923 6.161 11.612 7.055 10.289 8.268 L 10.184 8.362 L 10.2 8.825 L 11.252 9.459 C 11.814 10.677 11.669 14.881 10.734 15.952 C 9.694 16.103 10.034 16.203 9.333 15.732 C 8.867 14.806 9.031 13.371 9.063 12.285 C 8.968 11.247 9.115 11.628 8.551 10.804 C 7.228 9.947 4.888 10.062 3.241 9.998 C 3.139 12.231 4.118 15.483 1.613 16.12 C 1.213 16 0.635 15.914 0.519 15.489 C -0.087 13.261 -0.2 1.589 0.383 0.028 Z M 8.424 6.678 C 9.022 5.942 9.108 5.843 9.233 4.909 C 8.37 2.747 5.497 2.929 3.459 2.958 C 1.812 7.406 4.963 8.032 8.424 6.678 Z",
    fill: props.color || "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 6.603,
    height: 11.697,
    viewBox: "0 0 6.603 11.697",
    fill: "none",
    style: {
      position: "absolute",
      left: 128.008,
      top: 8.478
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 0.025 0 C 2.03 0.307 5.512 0.164 6.603 1.277 L 6.469 1.928 C 5.652 2.884 4.485 3.178 3.296 3.605 C 3.089 4.895 2.982 5.804 2.9 7.107 C 2.943 8.797 3.336 10.515 2.005 11.66 C 0.832 11.691 1.232 11.83 0.374 11.264 C -0.13 9.187 0.019 2.465 0.025 0 Z",
    fill: props.color || "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 11.9,
    height: 16.409,
    viewBox: "0 0 11.9 16.409",
    fill: "none",
    style: {
      position: "absolute",
      left: 134.967,
      top: 3.701
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 9.379 0 C 10.464 0.147 11.347 0.399 11.517 1.622 C 11.932 4.615 12.33 13.986 10.875 16.351 L 10.131 16.409 C 7.305 14.268 7.398 16.576 2.747 16.049 C -2.885 11.504 0.569 1.479 9.236 6.1 C 9.2 3.952 9.133 2.138 9.379 0 Z M 6.712 14.035 C 10.273 11.714 9.037 7.094 5.799 7.2 C 1.728 9.391 2.104 13.053 6.712 14.035 Z",
    fill: props.color || "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 9.786,
    height: 11.214,
    viewBox: "0 0 9.786 11.214",
    fill: "none",
    style: {
      position: "absolute",
      left: 148.709,
      top: 8.575
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 2.821 0.079 C 4.878 -0.206 9.029 0.185 9.206 2.794 C 7.704 4.78 4.656 0.835 3.271 2.747 C 3.644 4.769 6.98 4.313 9.218 6.074 C 10.751 8.356 8.993 11.12 6.183 11.214 C 4.092 11.121 -0.212 11.307 0.096 8.253 C 1.874 6.47 4.152 9.982 7.015 8.743 C 7.209 7.015 -5.483 4.782 2.821 0.079 Z",
    fill: props.color || "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 11.17,
    height: 11.756,
    viewBox: "0 0 11.17 11.756",
    fill: "none",
    style: {
      position: "absolute",
      left: 115.02,
      top: 8.356
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 5.111 0 C 6.449 0.12 7.466 0.144 8.524 1.093 C 10.486 2.853 11.062 8.651 11.17 11.182 C 10.529 11.728 10.119 11.991 9.307 11.485 C 5.337 9.009 4.147 13.732 0.138 10.08 C -0.998 2.945 5.208 5.781 7.169 4.012 C 6.872 3.168 5.71 2.613 4.906 2.121 C 3.589 3.276 2.692 4.186 0.922 3.344 C 0.182 0.941 3.455 0.322 5.111 0 Z M 6.754 8.619 L 7.199 7.873 C 6.697 6.662 4.502 6.989 3.261 6.992 C 3.148 8.291 2.98 8.054 3.505 9.078 C 4.778 9.531 5.565 9.21 6.754 8.619 Z",
    fill: props.color || "currentColor",
    fillRule: "nonzero"
  }))));
}
Object.assign(__ds_scope, { Logo, __ds_default_assets_logo_Logo_3ziqt4: Logo });
})(); } catch (e) { __ds_ns.__errors.push({ path: "assets/logo/Logo.jsx", error: String((e && e.message) || e) }); }

// components/core/Badge.jsx
try { (() => {
function Badge({
  children,
  tone = "lime",
  style
}) {
  const tones = {
    lime: {
      background: "var(--color-yellow)",
      color: "var(--color-ink)",
      boxShadow: "2px 2px 0px 0px var(--color-ink)"
    },
    coral: {
      background: "var(--color-coral)",
      color: "var(--color-ink)",
      boxShadow: "0 0 0 2px var(--color-ink), 6px 6px 0px 0px var(--color-ink)"
    },
    outline: {
      background: "transparent",
      color: "var(--color-ink)",
      boxShadow: "var(--ring-hairline)"
    },
    olive: {
      background: "rgba(178,230,120,0.18)",
      color: "var(--color-lime-strong)",
      boxShadow: "none"
    }
  };
  return /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-body)",
      fontWeight: 700,
      fontSize: 14,
      lineHeight: "20px",
      borderRadius: "var(--radius-xs)",
      padding: "4px 10px",
      display: "inline-flex",
      alignItems: "center",
      gap: 6,
      ...tones[tone],
      ...style
    }
  }, children);
}
Object.assign(__ds_scope, { Badge, __ds_default_components_core_Badge_2ajn45: Badge });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Badge.jsx", error: String((e && e.message) || e) }); }

// components/core/Button.jsx
try { (() => {
function Button({
  variant = "primary",
  size = "md",
  children,
  href,
  onClick,
  disabled,
  style,
  className
}) {
  const base = {
    fontFamily: "var(--font-body)",
    fontWeight: 500,
    fontSize: size === "sm" ? 14 : 16,
    lineHeight: "100%",
    textAlign: "center",
    borderRadius: "var(--radius-lg)",
    padding: size === "sm" ? "14px 26px" : "15px 24px",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.5 : 1,
    border: "none",
    transition: "transform .12s ease, box-shadow .12s ease",
    whiteSpace: "nowrap"
  };
  const variants = {
    primary: {
      background: "var(--color-lime)",
      color: "var(--color-ink)",
      boxShadow: "var(--shadow-sm)"
    },
    dark: {
      background: "var(--color-ink)",
      color: "var(--color-white)",
      boxShadow: "3px 3px 0px 0px var(--color-lime)"
    },
    secondary: {
      background: "var(--color-white)",
      color: "var(--color-ink)",
      boxShadow: "var(--ring-lime)",
      borderRadius: "var(--radius-lg)"
    },
    ghost: {
      background: "var(--surface-canvas)",
      color: "var(--color-ink)",
      boxShadow: "var(--ring-hairline)",
      borderRadius: "var(--radius-pill-sm)",
      fontFamily: "var(--font-heading)",
      fontSize: 15
    }
  };
  const Tag = href ? "a" : "button";
  const hoverStyle = {
    transform: "translate(-1px,-1px)"
  };
  const [hover, setHover] = React.useState(false);
  return /*#__PURE__*/React.createElement(Tag, {
    href: href,
    onClick: onClick,
    disabled: disabled,
    className: className,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    style: {
      ...base,
      ...variants[variant],
      ...(hover && !disabled ? hoverStyle : null),
      ...style
    }
  }, children);
}
Object.assign(__ds_scope, { Button, __ds_default_components_core_Button_51d4zy: Button });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Button.jsx", error: String((e && e.message) || e) }); }

// components/core/Card.jsx
try { (() => {
function Card({
  variant = "cream",
  children,
  style
}) {
  const variants = {
    cream: {
      background: "var(--color-cream)",
      boxShadow: "inset 0 0 0 1px var(--color-ink), 5px 5px 0px 0px var(--color-ink)",
      borderRadius: "var(--radius-xl)"
    },
    dark: {
      background: "linear-gradient(180deg, var(--color-navy-800) 0%, var(--color-navy-700) 100%)",
      boxShadow: "var(--shadow-card-dark)",
      borderRadius: "var(--radius-2xl)"
    },
    paper: {
      background: "var(--color-cream-paper)",
      boxShadow: "inset 0 0 0 1px var(--color-ink), 8px 8px 0px 0px var(--color-olive)",
      borderRadius: "var(--radius-2xl)"
    }
  };
  return /*#__PURE__*/React.createElement("div", {
    style: {
      padding: variant === "dark" ? "48px 32px 32px" : "22px 20px 26px",
      boxSizing: "border-box",
      ...variants[variant],
      ...style
    }
  }, children);
}
Object.assign(__ds_scope, { Card, __ds_default_components_core_Card_pwdrbg: Card });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Card.jsx", error: String((e && e.message) || e) }); }

// components/core/Tag.jsx
try { (() => {
function Tag({
  children,
  color,
  style
}) {
  return /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-heading)",
      fontWeight: 400,
      fontSize: 12,
      lineHeight: "100%",
      letterSpacing: "1.44px",
      textTransform: "uppercase",
      color: color || "var(--color-ink)",
      ...style
    }
  }, children);
}
Object.assign(__ds_scope, { Tag, __ds_default_components_core_Tag_1gfzecu: Tag });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Tag.jsx", error: String((e && e.message) || e) }); }

// components/forms/Input.jsx
try { (() => {
function Input({
  label,
  hint,
  placeholder,
  type = "text",
  value,
  onChange,
  style
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 8,
      width: "100%",
      boxSizing: "border-box",
      ...style
    }
  }, label && /*#__PURE__*/React.createElement("label", {
    style: {
      fontFamily: "var(--font-heading)",
      fontSize: 17,
      color: "var(--color-ink)"
    }
  }, label), /*#__PURE__*/React.createElement("input", {
    type: type,
    placeholder: placeholder,
    value: value,
    onChange: onChange,
    style: {
      height: 51,
      borderRadius: "var(--radius-md)",
      background: "var(--color-white)",
      boxShadow: "var(--ring-hairline)",
      border: "none",
      padding: "0 16px",
      fontFamily: "var(--font-body)",
      fontSize: 15,
      color: "var(--color-ink)",
      boxSizing: "border-box"
    }
  }), hint && /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-body)",
      fontSize: 14,
      color: "var(--color-gray-500)"
    }
  }, hint));
}
Object.assign(__ds_scope, { Input, __ds_default_components_forms_Input_jsghkw: Input });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Input.jsx", error: String((e && e.message) || e) }); }

// components/navigation/NavLink.jsx
try { (() => {
function NavLink({
  children = "Product",
  href = "#",
  active,
  style
}) {
  return /*#__PURE__*/React.createElement("a", {
    href: href,
    style: {
      fontFamily: "var(--font-heading)",
      fontWeight: 400,
      fontSize: 16,
      lineHeight: "100%",
      color: "var(--color-ink)",
      textDecoration: active ? "underline" : "none",
      opacity: 1,
      ...style
    }
  }, children);
}
Object.assign(__ds_scope, { NavLink, __ds_default_components_navigation_NavLink_zxfsmk: NavLink });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/NavLink.jsx", error: String((e && e.message) || e) }); }

// ui_kits/app/OverviewRecognition.jsx
try { (() => {
function Avatar({
  letter
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      width: 36,
      height: 36,
      borderRadius: 10,
      background: '#C2F24A',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'DM Sans,sans-serif',
      fontWeight: 700,
      color: '#111'
    }
  }, letter);
}
function OverviewScreen() {
  const stats = [['128', 'Recognitions this month'], ['12,450', 'Reward credits in wallet'], ['78%', 'Participation rate']];
  return /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 28,
      display: 'flex',
      flexDirection: 'column',
      gap: 20
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 20
    }
  }, stats.map(([v, l], i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      flex: 1,
      background: 'linear-gradient(180deg,#1F2128,#363941)',
      borderRadius: 14,
      padding: '20px 22px',
      boxShadow: 'inset 0 0 0 1px #363941'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'DM Sans,sans-serif',
      fontWeight: 700,
      fontSize: 28,
      color: '#fff'
    }
  }, v), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'Inter,sans-serif',
      fontSize: 13,
      color: '#8A8A93',
      marginTop: 4
    }
  }, l)))), /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'linear-gradient(180deg,#1F2128,#363941)',
      borderRadius: 14,
      padding: 24,
      boxShadow: 'inset 0 0 0 1px #363941'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'DM Sans,sans-serif',
      fontWeight: 700,
      fontSize: 16,
      color: '#fff',
      marginBottom: 14
    }
  }, "Recent activity"), ['Maya recognized Daniel — Ownership', 'Priya sent a $25 gift card to Sam', 'Team lunch credit redeemed by Alex'].map((t, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      display: 'flex',
      gap: 12,
      alignItems: 'center',
      padding: '10px 0',
      borderTop: i ? '1px solid #2A2D35' : 'none'
    }
  }, /*#__PURE__*/React.createElement(Avatar, {
    letter: t[0]
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'Inter,sans-serif',
      fontSize: 14,
      color: '#E4E1E6'
    }
  }, t)))));
}
function RecognitionScreen() {
  const feed = [['Maya', 'Daniel', 'Ownership', 'For turning a difficult launch into a team win.', '12 reactions · 3 comments'], ['Priya', 'Sam', 'Craft', 'For the cleanest release notes we\'ve shipped.', '8 reactions · 1 comment']];
  return /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 28,
      display: 'flex',
      flexDirection: 'column',
      gap: 16
    }
  }, feed.map(([from, to, tag, body, meta], i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      background: 'linear-gradient(180deg,#1F2128,#363941)',
      borderRadius: 14,
      padding: 22,
      boxShadow: 'inset 0 0 0 1px #363941'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 12,
      alignItems: 'center',
      marginBottom: 10
    }
  }, /*#__PURE__*/React.createElement(Avatar, {
    letter: from[0]
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'DM Sans,sans-serif',
      fontWeight: 700,
      fontSize: 16,
      color: '#fff'
    }
  }, from, " recognized ", to)), /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-block',
      background: 'rgba(178,230,120,0.18)',
      color: '#B3E82F',
      borderRadius: 6,
      padding: '4px 10px',
      fontFamily: 'Inter,sans-serif',
      fontSize: 13,
      fontWeight: 600,
      marginBottom: 10
    }
  }, "\u2726 ", tag), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'Inter,sans-serif',
      fontSize: 15,
      color: '#E4E1E6',
      marginBottom: 8
    }
  }, body), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'Inter,sans-serif',
      fontSize: 12,
      color: '#8A8A93'
    }
  }, meta))));
}
window.OverviewScreen = OverviewScreen;
window.RecognitionScreen = RecognitionScreen;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/app/OverviewRecognition.jsx", error: String((e && e.message) || e) }); }

// ui_kits/app/RewardsWalletReports.jsx
try { (() => {
function RewardsScreen() {
  const items = [['Learning & development credit', '2,450 credits'], ['Team lunch credit', '1,800 credits'], ['Wellbeing credit', '3,200 credits']];
  return /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 28,
      display: 'flex',
      flexDirection: 'column',
      gap: 20
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'DM Sans,sans-serif',
      fontWeight: 700,
      fontSize: 16,
      color: '#fff'
    }
  }, "Reward catalogue"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 16
    }
  }, items.map(([t, c], i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      flex: 1,
      background: 'linear-gradient(180deg,#1F2128,#363941)',
      borderRadius: 14,
      padding: 20,
      boxShadow: 'inset 0 0 0 1px #363941'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 36,
      height: 36,
      borderRadius: 10,
      background: '#00CCF9',
      marginBottom: 14
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'DM Sans,sans-serif',
      fontWeight: 700,
      fontSize: 15,
      color: '#fff'
    }
  }, t), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'Inter,sans-serif',
      fontSize: 13,
      color: '#8A8A93',
      marginTop: 6
    }
  }, c)))));
}
function WalletScreen() {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 28,
      display: 'flex',
      flexDirection: 'column',
      gap: 16,
      maxWidth: 420
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'linear-gradient(135deg,#BAADF1,#7188FE)',
      borderRadius: 16,
      padding: 24
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'Inter,sans-serif',
      fontSize: 13,
      color: '#111'
    }
  }, "Available balance"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'DM Sans,sans-serif',
      fontWeight: 700,
      fontSize: 44,
      color: '#111'
    }
  }, "12,450"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'Inter,sans-serif',
      fontSize: 13,
      color: '#111'
    }
  }, "reward credits")), [['Monthly funding', 'Ready'], ['Redemption', 'Approved']].map(([l, s], i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      background: 'linear-gradient(180deg,#1F2128,#363941)',
      borderRadius: 12,
      padding: '16px 18px',
      boxShadow: 'inset 0 0 0 1px #363941'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'DM Sans,sans-serif',
      fontWeight: 700,
      fontSize: 15,
      color: '#fff'
    }
  }, l), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'Inter,sans-serif',
      fontSize: 13,
      color: '#7188FE'
    }
  }, s))));
}
function ReportsScreen() {
  const bars = [40, 55, 45, 65, 50, 78, 70];
  return /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 28,
      display: 'flex',
      flexDirection: 'column',
      gap: 20
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 16
    }
  }, [['78%', 'Participation'], ['+18%', 'This month'], ['4.7', 'Avg. reactions']].map(([v, l], i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      flex: 1,
      background: 'linear-gradient(180deg,#1F2128,#363941)',
      borderRadius: 14,
      padding: '18px 20px',
      boxShadow: 'inset 0 0 0 1px #363941'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'DM Sans,sans-serif',
      fontWeight: 700,
      fontSize: 24,
      color: '#fff'
    }
  }, v), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'Inter,sans-serif',
      fontSize: 12,
      color: '#8A8A93'
    }
  }, l)))), /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'linear-gradient(180deg,#1F2128,#363941)',
      borderRadius: 14,
      padding: 20,
      boxShadow: 'inset 0 0 0 1px #363941'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'DM Sans,sans-serif',
      fontWeight: 700,
      fontSize: 15,
      color: '#fff',
      marginBottom: 16
    }
  }, "Participation report"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 10,
      alignItems: 'flex-end',
      height: 100
    }
  }, bars.map((h, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      flex: 1,
      height: `${h}%`,
      background: 'linear-gradient(180deg,#BAADF1,#7188FE)',
      borderRadius: 4
    }
  })))), /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'linear-gradient(180deg,#1F2128,#363941)',
      borderRadius: 14,
      padding: 20,
      boxShadow: 'inset 0 0 0 1px #363941'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'DM Sans,sans-serif',
      fontWeight: 700,
      fontSize: 15,
      color: '#fff',
      marginBottom: 8
    }
  }, "Ask EzRewards"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'Inter,sans-serif',
      fontSize: 13,
      color: '#8A8A93',
      marginBottom: 10
    }
  }, "You asked: Which team increased recognition participation this month?"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'Inter,sans-serif',
      fontSize: 14,
      color: '#E4E1E6'
    }
  }, "\u2726 Product showed the largest illustrative increase. Participation rose 18% in this preview.")));
}
window.RewardsScreen = RewardsScreen;
window.WalletScreen = WalletScreen;
window.ReportsScreen = ReportsScreen;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/app/RewardsWalletReports.jsx", error: String((e && e.message) || e) }); }

// ui_kits/app/Shell.jsx
try { (() => {
function Sidebar({
  active,
  setActive
}) {
  const {
    Logo
  } = window.EzRewardsDesignSystem_e8bdfd;
  const items = ['Overview', 'Recognition', 'Rewards', 'Wallet', 'Reports'];
  return /*#__PURE__*/React.createElement("div", {
    style: {
      width: 220,
      background: '#0B0D13',
      display: 'flex',
      flexDirection: 'column',
      padding: '24px 16px',
      boxSizing: 'border-box',
      gap: 28,
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 36,
      height: 36,
      background: '#C2F24A',
      borderRadius: 10,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'Space Grotesk,sans-serif',
      fontWeight: 700,
      color: '#111'
    }
  }, "EZ"), /*#__PURE__*/React.createElement(Logo, {
    height: 18,
    color: "#F2ECDD"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 4
    }
  }, items.map(i => /*#__PURE__*/React.createElement("div", {
    key: i,
    onClick: () => setActive(i),
    style: {
      padding: '10px 12px',
      borderRadius: 8,
      cursor: 'pointer',
      fontFamily: 'DM Sans,sans-serif',
      fontWeight: active === i ? 700 : 400,
      fontSize: 15,
      color: active === i ? '#0B0D13' : '#B7B9C2',
      background: active === i ? '#C2F24A' : 'transparent'
    }
  }, i))));
}
window.Sidebar = Sidebar;
function TopBar({
  title
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '20px 28px',
      borderBottom: '1px solid #1F2128'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'DM Sans,sans-serif',
      fontWeight: 700,
      fontSize: 20,
      color: '#fff'
    }
  }, title), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'Inter,sans-serif',
      fontSize: 11,
      letterSpacing: '1px',
      textTransform: 'uppercase',
      color: '#8A8A93',
      border: '1px solid #363941',
      borderRadius: 20,
      padding: '4px 12px'
    }
  }, "Illustrative preview"));
}
window.TopBar = TopBar;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/app/Shell.jsx", error: String((e && e.message) || e) }); }

// ui_kits/website/EarlyAccessForm.jsx
try { (() => {
function EarlyAccessForm() {
  const {
    Input,
    Button,
    Card
  } = window.EzRewardsDesignSystem_e8bdfd;
  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [submitted, setSubmitted] = React.useState(false);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      background: '#F0ECE2',
      borderTop: '6px solid #C2F24A',
      borderLeft: '1px solid #C2F24A',
      borderRight: '1px solid #C2F24A',
      borderBottom: '1px solid #C2F24A',
      padding: '60px 0 90px',
      display: 'flex',
      justifyContent: 'center',
      boxSizing: 'border-box'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 60,
      padding: '0 60px',
      maxWidth: 1440,
      width: '100%',
      boxSizing: 'border-box',
      alignItems: 'flex-start',
      justifyContent: 'space-between'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      paddingTop: 30,
      display: 'flex',
      flexDirection: 'column',
      gap: 13
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'Space Grotesk,sans-serif',
      fontSize: 48,
      letterSpacing: '-1px',
      color: '#111'
    }
  }, "Build a culture people can see."), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'Inter,sans-serif',
      fontSize: 16,
      color: '#111'
    }
  }, "We're opening early access for selected companies."), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'Inter,sans-serif',
      fontSize: 15,
      color: '#555'
    }
  }, "Share a few details about your company. We'll review them and contact you when early access becomes available.")), /*#__PURE__*/React.createElement(Card, {
    variant: "paper",
    style: {
      flex: 1,
      maxWidth: 460,
      display: 'flex',
      flexDirection: 'column',
      gap: 20
    }
  }, submitted ? /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'Space Grotesk,sans-serif',
      fontSize: 20,
      color: '#111'
    }
  }, "Thanks \u2014 we'll be in touch soon.") : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Input, {
    label: "Full name",
    hint: "Your first and last name.",
    value: name,
    onChange: e => setName(e.target.value)
  }), /*#__PURE__*/React.createElement(Input, {
    label: "Work email",
    hint: "Use the email you use at work.",
    type: "email",
    value: email,
    onChange: e => setEmail(e.target.value)
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'Inter,sans-serif',
      fontSize: 16,
      lineHeight: '22.4px',
      color: '#111'
    }
  }, "By joining, you agree that EzRewards may use these details to contact you about early access."), /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    onClick: () => setSubmitted(true),
    disabled: !name || !email
  }, "Continue")))));
}
window.EarlyAccessForm = EarlyAccessForm;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/website/EarlyAccessForm.jsx", error: String((e && e.message) || e) }); }

// ui_kits/website/FeatureSections.jsx
try { (() => {
function ProblemSection() {
  const {
    Tag,
    Card
  } = window.EzRewardsDesignSystem_e8bdfd;
  const cards = [{
    icon: '"Amazing work!"',
    sub: 'Scattered in chat'
  }, {
    icon: 'reward_budget_final_v7',
    sub: 'Buried in spreadsheets'
  }, {
    icon: 'Voucher sent?',
    sub: 'Nobody knows'
  }];
  return /*#__PURE__*/React.createElement("div", {
    style: {
      background: '#0B0D13',
      padding: '120px 80px',
      display: 'flex',
      flexDirection: 'column',
      gap: 60,
      alignItems: 'center',
      boxSizing: 'border-box'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 12,
      alignItems: 'center',
      textAlign: 'center'
    }
  }, /*#__PURE__*/React.createElement(Tag, {
    color: "#F2ECDD"
  }, "Appreciation Gets Fragmented"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'Space Grotesk,sans-serif',
      fontSize: 52,
      lineHeight: '58px',
      letterSpacing: '-2px',
      color: '#E4E1E6',
      maxWidth: 900
    }
  }, "A thank-you in one tool. A reward in another. The bigger picture nowhere.")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 32
    }
  }, cards.map((c, i) => /*#__PURE__*/React.createElement(Card, {
    key: i,
    variant: "dark",
    style: {
      width: 300,
      color: '#fff'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'DM Sans,sans-serif',
      fontWeight: 500,
      fontSize: 15,
      color: '#8A8A93'
    }
  }, c.icon), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 100,
      fontFamily: 'Inter,sans-serif',
      fontSize: 14,
      color: '#E4E1E6'
    }
  }, c.sub)))));
}
function LoopSection() {
  const {
    Tag,
    Card
  } = window.EzRewardsDesignSystem_e8bdfd;
  const steps = [['01', 'Recognize', 'Say it'], ['02', 'Celebrate', 'Share it'], ['03', 'Reward', 'Make it count'], ['04', 'Redeem', 'Choose something good'], ['05', 'Understand', 'Learn from it']];
  return /*#__PURE__*/React.createElement("div", {
    style: {
      background: '#F7CF52',
      padding: '100px 60px',
      display: 'flex',
      flexDirection: 'column',
      gap: 40,
      alignItems: 'center',
      boxSizing: 'border-box'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 23,
      alignItems: 'flex-start',
      maxWidth: 1320,
      width: '100%'
    }
  }, /*#__PURE__*/React.createElement(Tag, null, "The Appreciation Loop"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'Space Grotesk,sans-serif',
      fontWeight: 300,
      fontSize: 64,
      lineHeight: '66px',
      letterSpacing: '-1.5px',
      color: '#111'
    }
  }, "From \"nice work\" to a culture you can actually see.")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 26
    }
  }, steps.map(([n, h, s], i) => /*#__PURE__*/React.createElement(Card, {
    key: i,
    variant: "cream",
    style: {
      width: 220
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'Space Grotesk,sans-serif',
      fontSize: 14,
      color: '#555'
    }
  }, n), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 130,
      fontFamily: 'Space Grotesk,sans-serif',
      fontSize: 24,
      color: '#111'
    }
  }, h), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 8,
      fontFamily: 'Inter,sans-serif',
      fontSize: 14,
      color: '#333'
    }
  }, s)))));
}
function RecognitionSection() {
  const {
    Tag
  } = window.EzRewardsDesignSystem_e8bdfd;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      background: '#C2F24A',
      display: 'flex',
      padding: '80px 120px',
      gap: 60,
      alignItems: 'center',
      boxSizing: 'border-box'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      gap: 19
    }
  }, /*#__PURE__*/React.createElement(Tag, null, "Recognition"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'Space Grotesk,sans-serif',
      fontSize: 56,
      lineHeight: '60px',
      letterSpacing: '-1.4px',
      color: '#111'
    }
  }, "Make everyday wins part of company culture."), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'Inter,sans-serif',
      fontWeight: 500,
      fontSize: 16,
      lineHeight: '27.55px',
      color: '#111'
    }
  }, "Give specific appreciation, connect it to shared values, and make meaningful work visible across the company."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 14,
      marginTop: 10
    }
  }, ['Ownership', 'Empathy', 'Craft'].map(t => /*#__PURE__*/React.createElement("span", {
    key: t,
    style: {
      background: '#fff',
      borderRadius: 20,
      boxShadow: 'inset 0 0 0 1px #111',
      padding: '9px 20px',
      fontFamily: 'Space Grotesk,sans-serif',
      fontSize: 15,
      color: '#111'
    }
  }, t)))), /*#__PURE__*/React.createElement("img", {
    src: "../../assets/imagery/recognition-feed.png",
    alt: "Recognition feed",
    style: {
      flex: 1,
      maxWidth: 520,
      width: '100%'
    }
  }));
}
function RewardSection() {
  const {
    Tag
  } = window.EzRewardsDesignSystem_e8bdfd;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      background: '#F37C73',
      display: 'flex',
      padding: '80px 120px',
      gap: 60,
      alignItems: 'center',
      justifyContent: 'space-between',
      boxSizing: 'border-box'
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: "../../assets/imagery/reward-wallet.png",
    alt: "Reward wallet",
    style: {
      maxWidth: 420,
      width: '100%'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      gap: 20,
      maxWidth: 520
    }
  }, /*#__PURE__*/React.createElement(Tag, null, "Rewards + Wallet"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'Space Grotesk,sans-serif',
      fontSize: 56,
      lineHeight: '60px',
      letterSpacing: '-1.4px',
      color: '#111'
    }
  }, "Reward freely. Stay in control."), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'Inter,sans-serif',
      fontWeight: 500,
      fontSize: 16,
      lineHeight: '27.55px',
      color: '#111'
    }
  }, "Create a catalogue people actually want while keeping budgets, balances, and approvals clear.")));
}
function ReportsSection() {
  const {
    Tag,
    Button
  } = window.EzRewardsDesignSystem_e8bdfd;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      background: '#A78BFA',
      display: 'flex',
      padding: '80px 120px',
      gap: 60,
      alignItems: 'center',
      justifyContent: 'space-between',
      boxSizing: 'border-box'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      gap: 20,
      maxWidth: 520
    }
  }, /*#__PURE__*/React.createElement(Tag, null, "Reports + AI"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'Space Grotesk,sans-serif',
      fontSize: 56,
      lineHeight: '60px',
      letterSpacing: '-1.4px',
      color: '#111'
    }
  }, "Ask what changed. Know what matters."), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'Inter,sans-serif',
      fontWeight: 500,
      fontSize: 16,
      lineHeight: '27.55px',
      color: '#111'
    }
  }, "Turn participation signals into useful answers without losing sight of the underlying report."), /*#__PURE__*/React.createElement(Button, {
    variant: "ghost"
  }, "Ask a plain-language question \u2192")), /*#__PURE__*/React.createElement("img", {
    src: "../../assets/imagery/participation-report.png",
    alt: "Participation report",
    style: {
      maxWidth: 420,
      width: '100%'
    }
  }));
}
function WholeCompanySection() {
  const {
    Tag,
    Card
  } = window.EzRewardsDesignSystem_e8bdfd;
  const groups = [['HR + People', 'See the signals behind the sentiment.'], ['Founders', 'See the signals behind the sentiment.'], ['Operations', 'Keep the moving parts under control.'], ['Admins', 'Run the everyday work with clarity.']];
  return /*#__PURE__*/React.createElement("div", {
    style: {
      background: '#F2ECDD',
      padding: '100px 56px',
      display: 'flex',
      flexDirection: 'column',
      gap: 23,
      alignItems: 'flex-start',
      boxSizing: 'border-box'
    }
  }, /*#__PURE__*/React.createElement(Tag, null, "Built For The Whole Company"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'Space Grotesk,sans-serif',
      fontWeight: 300,
      fontSize: 64,
      lineHeight: '66px',
      letterSpacing: '-1.6px',
      color: '#111',
      maxWidth: 900
    }
  }, "Broad enough for everyone. Clear enough for every day."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 26,
      marginTop: 20
    }
  }, groups.map(([h, s], i) => /*#__PURE__*/React.createElement(Card, {
    key: i,
    variant: "cream",
    style: {
      width: 260
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: '#B3E82F',
      fontSize: 20
    }
  }, "+"), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 70,
      fontFamily: 'Space Grotesk,sans-serif',
      fontSize: 20,
      color: '#111'
    }
  }, h), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 6,
      fontFamily: 'Inter,sans-serif',
      fontSize: 14,
      color: '#333'
    }
  }, s)))));
}
window.ProblemSection = ProblemSection;
window.LoopSection = LoopSection;
window.RecognitionSection = RecognitionSection;
window.RewardSection = RewardSection;
window.ReportsSection = ReportsSection;
window.WholeCompanySection = WholeCompanySection;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/website/FeatureSections.jsx", error: String((e && e.message) || e) }); }

// ui_kits/website/Footer.jsx
try { (() => {
function Footer() {
  const {
    Logo
  } = window.EzRewardsDesignSystem_e8bdfd;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      background: '#F7CF52',
      padding: '70px 0 40px',
      display: 'flex',
      flexDirection: 'column',
      gap: 40,
      boxSizing: 'border-box'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '0 56px',
      display: 'flex',
      flexDirection: 'column',
      gap: 20
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'Space Grotesk,sans-serif',
      fontWeight: 700,
      fontSize: 'clamp(60px,14vw,180px)',
      textAlign: 'center',
      color: '#111',
      lineHeight: 1
    }
  }, "EZREWARDS"), /*#__PURE__*/React.createElement("div", {
    style: {
      borderTop: '1px solid #111'
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '0 56px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-end',
      gap: 40,
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 26,
      maxWidth: 520
    }
  }, /*#__PURE__*/React.createElement(Logo, {
    height: 26,
    color: "#111111"
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'Inter,sans-serif',
      fontSize: 18,
      lineHeight: '27px',
      color: '#111'
    }
  }, "Recognize contributions, reward people, manage redemptions, and understand appreciation across teams.")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 80
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 16,
      fontFamily: 'Inter,sans-serif',
      fontSize: 15,
      color: '#111'
    }
  }, /*#__PURE__*/React.createElement("span", null, "Product"), /*#__PURE__*/React.createElement("span", null, "Pricing"), /*#__PURE__*/React.createElement("span", null, "Join the Waitlist")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 16,
      fontFamily: 'Inter,sans-serif',
      fontSize: 15,
      color: '#111'
    }
  }, /*#__PURE__*/React.createElement("span", null, "How It Works"), /*#__PURE__*/React.createElement("span", null, "About"), /*#__PURE__*/React.createElement("span", null, "Contact")))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '0 56px',
      display: 'flex',
      flexDirection: 'column',
      gap: 20
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      borderTop: '1px solid #111'
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'Inter,sans-serif',
      fontSize: 15,
      color: '#111'
    }
  }, "An Evolutyz product")));
}
window.Footer = Footer;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/website/Footer.jsx", error: String((e && e.message) || e) }); }

// ui_kits/website/Header.jsx
try { (() => {
function Header() {
  const {
    Logo,
    NavLink,
    Button
  } = window.EzRewardsDesignSystem_e8bdfd;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      height: 79,
      background: '#F2ECDD',
      borderBottom: '1px solid #111',
      display: 'flex',
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      width: '100%',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 56px',
      boxSizing: 'border-box'
    }
  }, /*#__PURE__*/React.createElement(Logo, {
    height: 26,
    color: "#111111"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 38,
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement(NavLink, null, "Product"), /*#__PURE__*/React.createElement(NavLink, null, "How It Works"), /*#__PURE__*/React.createElement(NavLink, null, "Pricing"), /*#__PURE__*/React.createElement(NavLink, null, "About")), /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    size: "sm"
  }, "Join the Waitlist")));
}
window.Header = Header;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/website/Header.jsx", error: String((e && e.message) || e) }); }

// ui_kits/website/Hero.jsx
try { (() => {
function Hero() {
  const {
    Tag,
    Button
  } = window.EzRewardsDesignSystem_e8bdfd;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      overflow: 'hidden',
      background: '#F2ECDD',
      padding: '40px 0',
      display: 'flex',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      left: 25,
      top: -16,
      width: 170,
      height: 170,
      borderRadius: 85,
      background: '#C2F24A'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 40,
      padding: '0 60px',
      maxWidth: 1440,
      width: '100%',
      boxSizing: 'border-box',
      alignItems: 'flex-start'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 20,
      padding: '80px 0',
      flex: 1
    }
  }, /*#__PURE__*/React.createElement(Tag, null, "Employee Appreciation, Made Visible"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'Archivo,sans-serif',
      fontWeight: 400,
      fontSize: 72,
      lineHeight: '76px',
      letterSpacing: '-2px',
      color: '#111'
    }
  }, "GREAT WORK", /*#__PURE__*/React.createElement("br", null), "SHOULD", /*#__PURE__*/React.createElement("br", null), "NEVER", /*#__PURE__*/React.createElement("br", null), "GO", /*#__PURE__*/React.createElement("br", null), "UNSEEN."), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'Inter,sans-serif',
      fontSize: 18,
      lineHeight: '28px',
      color: '#111',
      maxWidth: 520
    }
  }, "EzRewards brings recognition, rewards, redemption, and insight into one clear appreciation journey."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 34,
      alignItems: 'center',
      marginTop: 8
    }
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "primary"
  }, "Join the Waitlist"), /*#__PURE__*/React.createElement(Button, {
    variant: "secondary"
  }, "See how it works \u2192"))), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '60px 0',
      position: 'relative'
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: "../../assets/imagery/recognition-feed-dashboard.png",
    alt: "Recognition feed dashboard",
    style: {
      width: '100%',
      maxWidth: 560
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      right: 10,
      top: 40,
      background: '#FE7171',
      borderRadius: 8,
      boxShadow: '0 0 0 2px #000, 6px 6px 0 0 #000',
      padding: '12px 20px',
      fontFamily: 'Inter,sans-serif',
      fontWeight: 700,
      fontSize: 16,
      color: '#111',
      transform: 'rotate(10deg)'
    }
  }, "\u2726 Reward Sent"))));
}
window.Hero = Hero;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/website/Hero.jsx", error: String((e && e.message) || e) }); }

__ds_ns.Logo = __ds_scope.Logo;

__ds_ns.Badge = __ds_scope.Badge;

__ds_ns.Button = __ds_scope.Button;

__ds_ns.Card = __ds_scope.Card;

__ds_ns.Tag = __ds_scope.Tag;

__ds_ns.Input = __ds_scope.Input;

__ds_ns.NavLink = __ds_scope.NavLink;

})();
