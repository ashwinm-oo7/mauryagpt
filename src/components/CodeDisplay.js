// import React, { useState } from "react";
// import Prism from "prismjs"; // Import prism for syntax highlighting
// import "prismjs/themes/prism.css"; // Import default styles for prism

// // CodeDisplay component for displaying and copying code
// const CodeDisplay = ({ code, language }) => {
//   const [copied, setCopied] = useState(false);

//   // Function to copy the code to clipboard
//   const handleCopy = () => {
//     navigator.clipboard.writeText(code);
//     setCopied(true);
//     setTimeout(() => setCopied(false), 2000); // Reset "copied" state after 2 seconds
//   };

//   // Highlight the code using PrismJS
//   const highlightedCode = Prism.highlight(
//     code,
//     Prism.languages[language],
//     language
//   );

//   return (
//     <div
//       style={{
//         position: "relative",
//         width: "100%",
//         padding: "20px",
//         background: "#f5f5f5",
//         borderRadius: "8px",
//       }}
//     >
//       {/* Display the highlighted code */}
//       <pre>
//         <code dangerouslySetInnerHTML={{ __html: highlightedCode }} />
//       </pre>

//       {/* Copy Button */}
//       <button
//         onClick={handleCopy}
//         style={{
//           position: "absolute",
//           top: "10px",
//           right: "10px",
//           padding: "5px 10px",
//           backgroundColor: "#4CAF50",
//           color: "white",
//           border: "none",
//           borderRadius: "5px",
//           cursor: "pointer",
//         }}
//       >
//         {copied ? "Copied!" : "Copy"}
//       </button>
//       <div
//         style={{
//           position: "relative",
//           padding: "20px 0",
//           borderBottom: "1px solid #ccc",
//           marginBottom: "20px",
//         }}
//       >
//         {/* Centered H2 */}
//         <h1
//           className="app-h2"
//           style={{
//             textAlign: "center",
//             margin: 0,
//             fontSize: "28px",
//             cursor: "pointer", // show pointer
//           }}
//           onClick={() => navigate("/")} // Navigate to home on click
//         >
//           Chat with Maurya AI
//         </h1>

//         {/* Top-right buttons */}
//         <div
//           style={{
//             position: "absolute",
//             top: "20px",
//             right: "20px",
//           }}
//         >
//           {token ? (
//             <button
//               onClick={handleLogout}
//               style={{
//                 padding: "8px 16px",
//                 fontSize: "16px",
//                 cursor: "pointer",
//               }}
//             >
//               Logout
//             </button>
//           ) : (
//             <>
//               <Link
//                 to="/login"
//                 style={{
//                   marginRight: "10px",
//                   fontSize: "16px",
//                   textDecoration: "none",
//                 }}
//               >
//                 Login
//               </Link>
//               {/* <Link
//                 to="/register"
//                 style={{ fontSize: "16px", textDecoration: "none" }}
//               >
//                 Register
//               </Link> */}
//             </>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default CodeDisplay;
