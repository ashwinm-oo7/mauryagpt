// DownloadChatPDF.js
import React from "react";
import { jsPDF } from "jspdf";

// Function to format long messages into smaller lines for better readability in the PDF
const downloadChatAsPDF = (messages) => {
  const doc = new jsPDF();
  const pageHeight = doc.internal.pageSize.height;
  const pageWidth = doc.internal.pageSize.width;

  let y = 30; // Start lower for margins
  const margin = 10; // Add margin for neatness

  doc.setFont("helvetica", "normal");

  // Title at the top of the page
  doc.setFontSize(16);
  doc.text("Chat Conversation", pageWidth / 2, y, { align: "center" });
  y += 20; // Add some spacing after the title

  const currentDate = new Date().toLocaleString();
  doc.setFontSize(10);
  doc.text(`Date: ${currentDate}`, pageWidth - margin - 50, y, {
    align: "right",
  });
  y += 10; // Add space below the date

  // Set font size for regular text
  doc.setFontSize(12);

  // Iterate through each message in the chat
  messages.forEach((msg) => {
    if (y > pageHeight - 50) {
      doc.addPage();
      y = 20;
    }

    // Add the sender's name and message formatting
    if (msg.role === "user") {
      doc.setFont("helvetica", "bold");
      doc.text("You:", margin, y);
      y += 5;
    } else {
      doc.setFont("times", "italic");
      doc.text("Assistant:", margin, y);
      y += 5;
    }

    // Add the message content (with formatting)
    const formattedContent = renderMarkdownToText(msg.content);

    formattedContent.forEach((line) => {
      doc.setFont("helvetica", "normal");
      doc.text(line, margin, y);
      y += 6; // Space between each line
    });

    // Handle code blocks
    const codeMatches = msg.content.match(/```([\s\S]*?)```/g);
    if (codeMatches) {
      codeMatches.forEach((codeBlock) => {
        const codeText = codeBlock.replace(/```/g, "");
        const codeLines = formatMessage(codeText);

        doc.setFont("courier", "normal");
        doc.setTextColor(0, 0, 255); // Blue text for code
        doc.setDrawColor(200);
        doc.setFillColor(240, 240, 240); // Light background color for code blocks

        // Draw a light grey background for code blocks
        const blockHeight = codeLines.length * 6 + 10;
        doc.rect(
          margin - 2,
          y - 2,
          pageWidth - margin * 2 + 4,
          blockHeight,
          "F"
        );

        // Add the code lines
        codeLines.forEach((line) => {
          doc.text(line, margin, y);
          y += 6;
        });
        y += 10; // Add extra space after code block
      });
    }

    y += 10; // Add extra space between messages
  });

  // Save the PDF
  doc.save("chat_conversation.pdf");
};

const renderMarkdownToText = (content) => {
  // Render Markdown-style text (bold, inline code) to plain text
  return content
    .replace(/\*\*(.+?)\*\*/g, "$1") // remove bold formatting (for simplicity)
    .replace(/`(.+?)`/g, "$1") // remove inline code formatting
    .split("\n");
};

const formatMessage = (message) => {
  // Split long messages into multiple lines for better readability
  const maxLineLength = 90; // Adjust this value based on your requirements
  const words = message.split(" ");
  const lines = [];
  let currentLine = "";

  words.forEach((word) => {
    if ((currentLine + word).length > maxLineLength) {
      lines.push(currentLine.trim());
      currentLine = word + " ";
    } else {
      currentLine += word + " ";
    }
  });

  if (currentLine.length > 0) {
    lines.push(currentLine.trim());
  }

  return lines;
};

const DownloadChatPDF = ({ messages }) => {
  return (
    <button
      className="download-button"
      onClick={() => downloadChatAsPDF(messages)}
    >
      Download Full Chat
    </button>
  );
};

export default DownloadChatPDF;
