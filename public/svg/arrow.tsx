import * as React from "react"
const Arrow = (props:any) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    xmlSpace="preserve"
    style={{
      fillRule: "evenodd",
      clipRule: "evenodd",
      strokeLinecap: "round",
      strokeMiterlimit: 10,
    }}
    viewBox="0 0 33 46"
    {...props}
  >
    <path
      d="M30.796 17.356 16.679 3.239 2.562 17.356"
      style={{
        fill: "none",
        stroke: "#fff",
        strokeWidth: "4.17px",
      }}
    />
    <path
      d="M16.679 3.239v40.258"
      style={{
        fill: "none",
        stroke: "#fff",
        strokeWidth: "4.17px",
        strokeLinejoin: "round",
        strokeMiterlimit: 1.5,
      }}
    />
  </svg>
)
export default Arrow