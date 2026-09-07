/**
 * The top bar is now responsive on its own (top-bar.css drops the address and
 * then the email as the strip narrows), so the phone build is the same
 * component. Kept as a module because Router.js picks between the two.
 */
export { default } from "./InfoHeader";
